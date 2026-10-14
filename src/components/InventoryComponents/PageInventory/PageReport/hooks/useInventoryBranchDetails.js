import { useEffect, useState } from "react";
import { useDidChange } from "../../../../../hooks/useDidChange";
import { fetchOtherBranchStocks } from "../services/inventoryBranchStocksDetailService";

const useInventoryBranchDetails = (selectedBranchId) => {
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [otherStocksByProduct, setOtherStocksByProduct] = useState({});
  const [loadingDetailsByProduct, setLoadingDetailsByProduct] = useState({});
  const [detailsErrorByProduct, setDetailsErrorByProduct] = useState({});

  // El detalle pertenece a una sucursal: al cambiarla se reinicia durante el
  // render, en lugar de disparar cuatro setState desde un efecto.
  if (useDidChange(selectedBranchId)) {
    setExpandedProductId(null);
    setOtherStocksByProduct({});
    setLoadingDetailsByProduct({});
    setDetailsErrorByProduct({});
  }

  const clearExpandedProduct = () => {
    setExpandedProductId(null);
  };

  const handleToggleOtherStocks = async (productId) => {
    if (!productId || !selectedBranchId) return;

    if (expandedProductId === productId) {
      setExpandedProductId(null);
      return;
    }

    setExpandedProductId(productId);

    if (
      Object.prototype.hasOwnProperty.call(otherStocksByProduct, productId) ||
      loadingDetailsByProduct[productId]
    ) {
      return;
    }

    setLoadingDetailsByProduct((previous) => ({
      ...previous,
      [productId]: true,
    }));

    setDetailsErrorByProduct((previous) => ({
      ...previous,
      [productId]: "",
    }));

    try {
      const detailRows = await fetchOtherBranchStocks({
        productId,
        selectedBranchId,
      });

      setOtherStocksByProduct((previous) => ({
        ...previous,
        [productId]: detailRows,
      }));
    } catch (detailsError) {
      console.error("Error cargando otras sucursales:", detailsError);

      setOtherStocksByProduct((previous) => ({
        ...previous,
        [productId]: [],
      }));

      setDetailsErrorByProduct((previous) => ({
        ...previous,
        [productId]: "No se pudo cargar stock de otras sucursales.",
      }));
    } finally {
      setLoadingDetailsByProduct((previous) => ({
        ...previous,
        [productId]: false,
      }));
    }
  };

  return {
    expandedProductId,
    otherStocksByProduct,
    loadingDetailsByProduct,
    detailsErrorByProduct,
    clearExpandedProduct,
    handleToggleOtherStocks,
  };
};

export default useInventoryBranchDetails;
