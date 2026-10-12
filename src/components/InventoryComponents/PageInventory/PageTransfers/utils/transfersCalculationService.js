// Calculos puros: agregaciones, conteos, filtros, ordenamiento.

import { parseTransferDate, normalizeText } from "./transfersFormatters";

export const normalizeInteger = (value, fallback = 0) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(0, Math.floor(parsedValue));
};

export const buildTransferTotals = (items = []) => {
  return (Array.isArray(items) ? items : []).reduce(
    (summary, item) => {
      summary.requestedUnits += normalizeInteger(item?.requestedQty);
      summary.receivedUnits += normalizeInteger(item?.receivedQty);
      summary.returnedUnits += normalizeInteger(item?.returnedQty);
      summary.lineCount += 1;
      return summary;
    },
    {
      requestedUnits: 0,
      receivedUnits: 0,
      returnedUnits: 0,
      lineCount: 0,
    }
  );
};

export const sortTransfersByDate = (orders = []) => {
  return [...(Array.isArray(orders) ? orders : [])].sort((a, b) => {
    const dateA = parseTransferDate(a?.createdAt)?.getTime() ?? 0;
    const dateB = parseTransferDate(b?.createdAt)?.getTime() ?? 0;
    return dateB - dateA;
  });
};

export const getPendingReceiptsCount = ({
  orders = [],
  currentBranchId = "",
}) => {
  return orders.filter(
    (order) =>
      order.destinationBranchId === currentBranchId &&
      order.status === "pending_receipt"
  ).length;
};

export const getPendingReceiptOrders = ({
  orders = [],
  currentBranchId = "",
}) => {
  return sortTransfersByDate(orders).filter(
    (order) =>
      order.destinationBranchId === currentBranchId &&
      order.status === "pending_receipt"
  );
};

export const getTransfersHistory = ({ orders = [], currentBranchId = "" }) => {
  return sortTransfersByDate(orders).filter(
    (order) =>
      order.originBranchId === currentBranchId ||
      order.destinationBranchId === currentBranchId
  );
};

export const filterTransferProducts = ({ products = [], searchTerm = "" }) => {
  const normalizedTerm = normalizeText(searchTerm).toUpperCase();

  const sendableProducts = (Array.isArray(products) ? products : [])
    .filter((product) => product?.tracks_inventory)
    .filter((product) => Number(product?.existencia ?? 0) > 0)
    .sort((a, b) =>
      String(a?.descripcion || "").localeCompare(
        String(b?.descripcion || ""),
        "es",
        {
          sensitivity: "base",
          numeric: true,
        }
      )
    );

  if (!normalizedTerm) {
    return sendableProducts;
  }

  return sendableProducts.filter((product) => {
    const description = String(product?.descripcion || "").toUpperCase();
    const barcode = String(product?.codigo || "").toUpperCase();

    return (
      description.includes(normalizedTerm) || barcode.includes(normalizedTerm)
    );
  });
};

export const getTransferMetrics = ({ orders = [], currentBranchId = "" }) => {
  const currentBranch = String(currentBranchId || "");

  return orders.reduce(
    (summary, order) => {
      const isOrigin = String(order?.originBranchId || "") === currentBranch;
      const isDestination =
        String(order?.destinationBranchId || "") === currentBranch;
      const participates = isOrigin || isDestination;

      if (order.status === "cancelled" && participates) {
        summary.cancelled += 1;
      }

      if (isOrigin) {
        summary.sent += 1;
      }

      if (isDestination && order.status === "pending_receipt") {
        summary.pendingReceipts += 1;
      }

      if (isDestination && order.status !== "pending_receipt") {
        summary.completedReceipts += 1;
      }

      if (participates && order.status === "pending_receipt") {
        const requested = Number(order?.totals?.requestedUnits ?? 0) || 0;
        const received = Number(order?.totals?.receivedUnits ?? 0) || 0;
        const returned = Number(order?.totals?.returnedUnits ?? 0) || 0;
        const remaining = requested - received - returned;
        if (Number.isFinite(remaining) && remaining > 0) {
          summary.unitsInTransit += remaining;
        }
      }

      return summary;
    },
    {
      sent: 0,
      pendingReceipts: 0,
      completedReceipts: 0,
      cancelled: 0,
      unitsInTransit: 0,
    }
  );
};
