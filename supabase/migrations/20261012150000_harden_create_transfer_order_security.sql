-- ============================================================================
-- Migracion: endurecer create_transfer_order (seguridad + folio server-side)
--
-- Motivo: versionar en el repo la definicion vigente del RPC que vive en
-- Supabase y que no estaba reflejada en ninguna migracion posterior a
-- 20260917200000. Se incluyen los parches F5 ya aplicados en produccion:
--   (a) Autoria: auth.uid() como fuente de verdad (p_user_id es fallback).
--   (b) Valoracion: cost_price / sale_price se obtienen de public.products
--       (se ignora completamente el payload del cliente).
--   (c) Guard anti-stock negativo en sucursal origen antes de restar.
--   (d) Snapshots origin_stock_before / origin_stock_after dentro de la TX.
--   (e) Folio generado server-side (p_folio del cliente se ignora) para
--       evitar spoofing y colisiones.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_transfer_order(
    p_from_branch_id uuid,
    p_to_branch_id uuid,
    p_user_id uuid,
    p_notes text,
    p_folio text,
    p_items jsonb
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    v_transfer_id   uuid;
    v_database_ts   timestamptz := now();
    v_folio         text;
    v_origin_name   text;
    v_dest_name     text;
    v_item          record;
    v_idx           integer := 0;
    v_product_id    uuid;
    v_req_qty       integer;
    v_cost_price    numeric;
    v_sale_price    numeric;
    v_reason        text;
    v_meta_folio    jsonb;
    v_notes_final   text;
    v_temp          text;
    v_origin_before numeric(18,4);
    v_origin_after  numeric(18,4);
    -- vars de seguridad (parche F5 checks b y c):
    v_product_exists    boolean;
    v_p_cost_from_tbl   numeric(18,4);
    v_p_sale_from_tbl   numeric(18,4);
begin
    -- (a) AUTORIA: Fuente de verdad = auth.uid() (JWT authenticated).
    -- p_user_id es fallback defensivo.
    p_user_id := coalesce(auth.uid(), p_user_id);

    if p_from_branch_id is null then
        raise exception 'No hay una sucursal origen activa.';
    end if;
    if p_to_branch_id is null then
        raise exception 'Selecciona la sucursal destino.';
    end if;
    if p_user_id is null then
        raise exception 'No se detectó el usuario que genera el traspaso.';
    end if;
    if p_from_branch_id = p_to_branch_id then
        raise exception 'La sucursal destino debe ser distinta a la origen.';
    end if;
    if p_items is null or jsonb_array_length(p_items) = 0 then
        raise exception 'Agrega al menos un producto al traspaso.';
    end if;

    -- (e) FOLIO: generado server-side. Se ignora p_folio del cliente para
    -- evitar spoofing y colisiones. Formato: TR-DDMMYY-HHMMSS (hora Mexico).
    v_folio := 'TR-' || to_char(timezone('America/Mexico_City', v_database_ts), 'DDMMYY-HH24MISS');

    select name into v_origin_name from public.branches where id = p_from_branch_id;
    select name into v_dest_name   from public.branches where id = p_to_branch_id;
    v_origin_name := coalesce(v_origin_name, 'SUCURSAL ORIGEN');
    v_dest_name   := coalesce(v_dest_name,   'SUCURSAL DESTINO');

    v_meta_folio  := jsonb_build_object('folio', v_folio);
    v_notes_final := public._build_transfer_notes(p_notes, v_meta_folio);

    insert into public.inventory_transfers (
        from_branch_id, to_branch_id, user_id,
        status, notes, created_at, approved_at
    ) values (
        p_from_branch_id, p_to_branch_id, p_user_id,
        'pending_receipt', v_notes_final, v_database_ts, v_database_ts
    ) returning id into v_transfer_id;

    for v_item in select * from jsonb_array_elements(p_items) loop
        v_idx := v_idx + 1;

        v_temp       := coalesce(v_item.value ->> 'productId', v_item.value ->> 'product_id');
        v_product_id := case when btrim(coalesce(v_temp,'')) = '' then null else v_temp::uuid end;

        v_req_qty    := coalesce((v_item.value ->> 'requestedQty')::numeric,
                                 (v_item.value ->> 'quantity')::numeric, 0)::integer;

        if v_product_id is null then
            raise exception 'Producto inválido en la línea %', v_idx;
        end if;
        if v_req_qty <= 0 then
            raise exception 'Cantidad inválida en la línea %', v_idx;
        end if;

        -- ================================================================
        -- (b) SPOOF DE costPrice/salePrice: se IGNORA COMPLETAMENTE el
        -- payload del cliente. Fuente de verdad: tabla public.products.
        -- ================================================================
        select true, p.cost_price, p.sale_price
          into v_product_exists, v_p_cost_from_tbl, v_p_sale_from_tbl
        from public.products p
        where p.id = v_product_id
        limit 1;

        if not coalesce(v_product_exists, false) then
            raise exception 'Producto % no existe en la tabla products (línea %).',
                coalesce(v_item.value ->> 'name', v_item.value ->> 'product_name', v_product_id::text),
                v_idx;
        end if;

        v_cost_price := coalesce(v_p_cost_from_tbl, 0);
        v_sale_price := coalesce(v_p_sale_from_tbl, 0);

        -- ================================================================
        -- (c) GUARD ANTI-STOCK NEGATIVO en sucursal origen. Validamos
        -- ANTES de restar en branch_inventory.
        -- ================================================================
        select coalesce(stock, 0) into v_origin_before
        from public.branch_inventory
        where branch_id = p_from_branch_id and product_id = v_product_id;
        v_origin_before := coalesce(v_origin_before, 0);

        if v_req_qty > v_origin_before then
            raise exception 'Stock insuficiente en la sucursal origen para %: solicitadas %, disponibles %. (línea %).',
                coalesce(v_item.value ->> 'name', v_item.value ->> 'product_name', v_product_id::text),
                v_req_qty, v_origin_before, v_idx;
        end if;

        -- Insert con snapshots origin_before / origin_after (after al final).
        insert into public.inventory_transfer_items (
            transfer_id, product_id, quantity, cost_price,
            origin_stock_before, origin_stock_after
        ) values (
            v_transfer_id, v_product_id, v_req_qty::numeric(18,4), v_cost_price,
            v_origin_before, null
        );

        v_reason := 'TRASPASO ENVIADO A ' || v_folio || ' ' || v_dest_name;
        if p_notes is not null and length(btrim(p_notes)) > 0 then
            v_reason := v_reason || ' - ' || btrim(p_notes);
        end if;

        perform public._apply_inventory_delta(
            p_branch_id  => p_from_branch_id,
            p_product_id => v_product_id,
            p_delta      => (v_req_qty * -1)::numeric,
            p_cost_price => v_cost_price,
            p_sale_price => v_sale_price,
            p_reason     => v_reason,
            p_user_id    => p_user_id,
            p_created_at => v_database_ts
        );

        -- ===== SNAPSHOT: stock origen DESPUES del descuento =====
        select coalesce(stock, 0) into v_origin_after
        from public.branch_inventory
        where branch_id = p_from_branch_id and product_id = v_product_id;
        v_origin_after := coalesce(v_origin_after, 0);

        update public.inventory_transfer_items
           set origin_stock_after = v_origin_after
         where transfer_id = v_transfer_id and product_id = v_product_id;

    end loop;

    return jsonb_build_object(
        'success',      true,
        'transferId',   v_transfer_id,
        'folio',        v_folio,
        'itemsCount',   v_idx
    );

exception when others then
    raise exception 'create_transfer_order: % (SQLSTATE=%)', sqlerrm, sqlstate;
end;
$function$;

-- ============================================================================
-- Permisos: solo authenticated y service_role pueden ejecutar.
-- ============================================================================
revoke all on function public.create_transfer_order(
    p_from_branch_id uuid, p_to_branch_id uuid, p_user_id uuid,
    p_notes text, p_folio text, p_items jsonb
) from public;

revoke all on function public.create_transfer_order(
    p_from_branch_id uuid, p_to_branch_id uuid, p_user_id uuid,
    p_notes text, p_folio text, p_items jsonb
) from anon;

grant execute on function public.create_transfer_order(
    p_from_branch_id uuid, p_to_branch_id uuid, p_user_id uuid,
    p_notes text, p_folio text, p_items jsonb
) to authenticated;

grant execute on function public.create_transfer_order(
    p_from_branch_id uuid, p_to_branch_id uuid, p_user_id uuid,
    p_notes text, p_folio text, p_items jsonb
) to service_role;