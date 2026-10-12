// Consultas a profundidad (detalle) de traspasos.

import { supabase } from "../../../../../lib/supabaseClient";
import { normalizeTransferOrder } from "../utils/transfersUtils";

export const TRANSFER_SELECT = `
  id,
  from_branch_id,
  to_branch_id,
  user_id,
  status,
  notes,
  created_at,
  approved_at,
  completed_at,
  from_branch:branches!inventory_transfers_from_branch_id_fkey (
    id,
    name,
    code
  ),
  to_branch:branches!inventory_transfers_to_branch_id_fkey (
    id,
    name,
    code
  ),
  user:users!inventory_transfers_user_id_fkey (
    id,
    username,
    email
  ),
  inventory_transfer_items (
    id,
    product_id,
    quantity,
    cost_price,
    origin_stock_before,
    origin_stock_after,
    destination_stock_before,
    destination_stock_after,
    received_qty,
    returned_qty,
    product:products!inventory_transfer_items_product_id_fkey (
      id,
      name,
      barcode
    )
  )
`;

export const fetchTransferOrderById = async (transferOrderId) => {
  const { data, error } = await supabase
    .from("inventory_transfers")
    .select(TRANSFER_SELECT)
    .eq("id", transferOrderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return normalizeTransferOrder(data);
};
