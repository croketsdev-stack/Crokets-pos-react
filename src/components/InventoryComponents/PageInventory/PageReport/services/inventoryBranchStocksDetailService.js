// Consulta de stocks de otras sucursales para un producto (detalle expandible).

import { supabase } from "../../../../../lib/supabaseClient";

const OTHER_STOCKS_SELECT_CANDIDATES = [
  `
    id,
    branch_id,
    stock,
    min_stock,
    max_stock,
    is_active,
    branches:branch_id(
      id,
      name,
      code
    )
  `,
  `
    id,
    branch_id,
    stock,
    min_stock,
    max_stock,
    is_active,
    branches(
      id,
      name,
      code
    )
  `,
];

export const fetchOtherBranchStocks = async ({
  productId,
  selectedBranchId,
}) => {
  if (!productId || !selectedBranchId) {
    return [];
  }

  let detailRows = [];
  let lastError = null;

  for (const selectClause of OTHER_STOCKS_SELECT_CANDIDATES) {
    const { data, error } = await supabase
      .from("branch_inventory")
      .select(selectClause)
      .eq("product_id", productId)
      .neq("branch_id", selectedBranchId)
      .or("is_active.eq.true,has_been_stocked.eq.true,stock.gt.0")
      .order("created_at", { ascending: false });

    if (error) {
      lastError = error;
      continue;
    }

    detailRows = data ?? [];
    lastError = null;
    break;
  }

  if (lastError) {
    throw lastError;
  }

  return detailRows;
};
