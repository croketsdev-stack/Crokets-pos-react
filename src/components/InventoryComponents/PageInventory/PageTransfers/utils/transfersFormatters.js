// Formateadores y presentacion: fechas, folio, estado, texto.

export const normalizeText = (value, fallback = "") => {
  return String(value ?? "").trim() || fallback;
};

export const parseTransferDate = (value) => {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const raw = String(value).trim();

  if (!raw) return null;

  if (/^\d+$/.test(raw)) {
    const date = new Date(Number(raw));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const hasExplicitTimezone =
    raw.endsWith("Z") ||
    (raw.includes("T") && /[+-]\d{2}(?::\d{2}|\d{2})$/.test(raw));

  if (hasExplicitTimezone) {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const date = new Date(`${raw}Z`);
  if (!Number.isNaN(date.getTime())) return date;

  const fallbackDate = new Date(raw);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
};

export const TRANSFER_META_SEPARATOR = "\n\n##TRANSFER_META##";

export const getTransferMetaSeparator = () => TRANSFER_META_SEPARATOR;

const getDetectedSystemTimeZone = () => {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (typeof detected === "string" && detected.trim() !== "") {
      return detected.trim();
    }
  } catch {
    // Intl falla en entornos headless/legacy sin locale data; devolvemos undefined
    // y getAppTimeZone() usa el fallback por default.
  }
  return undefined;
};

export const getAppTimeZone = () => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const configured = import.meta.env.VITE_APP_TIMEZONE;
    if (typeof configured === "string" && configured.trim() !== "") {
      return configured.trim();
    }
  }
  return getDetectedSystemTimeZone();
};

const getAppTimezoneParts = (date) => {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: getAppTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = dtf.formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});

  return {
    year: String(parts.year ?? "").slice(-2),
    month: String(parts.month ?? ""),
    day: String(parts.day ?? ""),
    hour: parts.hour === "24" ? "00" : String(parts.hour ?? ""),
    minute: String(parts.minute ?? ""),
    second: String(parts.second ?? ""),
  };
};

const formatDatePart = (date) => {
  const parts = getAppTimezoneParts(date);
  return `${parts.day}${parts.month}${parts.year}`;
};

const formatTimePart = (date) => {
  const parts = getAppTimezoneParts(date);
  return `${parts.hour}${parts.minute}${parts.second}`;
};

export const createTransferFolio = (date = new Date()) => {
  const referenceDate =
    (date instanceof Date && !Number.isNaN(date.getTime())
      ? date
      : parseTransferDate(date)) ?? new Date();

  return `TR-${formatDatePart(referenceDate)}-${formatTimePart(referenceDate)}`;
};

export const getTransferStatusMeta = (status) => {
  const normalizedStatus = normalizeText(status, "pending_receipt");

  if (normalizedStatus === "cancelled") {
    return {
      label: "Cancelado",
      tone: "cancelled",
    };
  }

  if (normalizedStatus === "received_complete") {
    return {
      label: "Recibido completo",
      tone: "success",
    };
  }

  if (normalizedStatus === "received_with_difference") {
    return {
      label: "Recibido con diferencia",
      tone: "warning",
    };
  }

  return {
    label: "Pendiente de recepción",
    tone: "pending",
  };
};

export const getTransferStatusMetaForBranch = (
  order = {},
  currentBranchId = ""
) => {
  const baseMeta = getTransferStatusMeta(order?.status);
  const normalizedStatus = normalizeText(order?.status, "pending_receipt");
  const normalizedCurrentBranchId = normalizeText(currentBranchId);

  if (!normalizedCurrentBranchId) {
    return baseMeta;
  }

  const isOriginBranch =
    normalizeText(order?.originBranchId) === normalizedCurrentBranchId;
  const isDestinationBranch =
    normalizeText(order?.destinationBranchId) === normalizedCurrentBranchId;

  if (normalizedStatus === "received_complete") {
    if (isOriginBranch) {
      return { ...baseMeta, label: "Enviado completo" };
    }

    if (isDestinationBranch) {
      return { ...baseMeta, label: "Recibido completo" };
    }

    return baseMeta;
  }

  if (normalizedStatus === "received_with_difference") {
    if (isOriginBranch) {
      return { ...baseMeta, label: "Enviado con diferencia" };
    }

    if (isDestinationBranch) {
      return { ...baseMeta, label: "Recibido con diferencia" };
    }

    return baseMeta;
  }

  return baseMeta;
};

export const formatTransferDateTime = (value) => {
  const date = parseTransferDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-MX", {
    timeZone: getAppTimeZone(),
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};
