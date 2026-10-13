/**
 * Preferencias locales de impresión de tickets.
 *
 * El ancho del rollo (58 mm / 80 mm) se traduce al perfil de papel que ya
 * entiende el proceso principal de Electron (`TICKET_PRINT_PROFILES` en
 * `electron/ticketPrintService.js`), de modo que las tres rutas de impresión
 * (venta, reimpresión y corte de caja) envían el mismo perfil.
 *
 * El modo de impresión decide el flujo de cobro:
 * - `auto`: la venta imprime el ticket directamente al cobrar.
 * - `confirm`: antes de imprimir se pide una confirmación explícita.
 *
 * Todo vive en `localStorage` porque es una preferencia por puesto de trabajo,
 * no un dato compartido en Supabase.
 */

const TICKET_WIDTH_KEY = "settings_ticket_width_mm";
const PRINT_MODE_KEY = "settings_print_mode";

export const TICKET_WIDTH_OPTIONS = [58, 80];
export const PRINT_MODE_AUTO = "auto";
export const PRINT_MODE_CONFIRM = "confirm";
export const PRINT_MODE_OPTIONS = [PRINT_MODE_AUTO, PRINT_MODE_CONFIRM];

const DEFAULT_TICKET_WIDTH_MM = 58;
const DEFAULT_PRINT_MODE = PRINT_MODE_AUTO;

const readStoredValue = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.error(`Error leyendo la preferencia ${key}:`, error);
    return null;
  }
};

const writeStoredValue = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error guardando la preferencia ${key}:`, error);
    return false;
  }
};

export const normalizeTicketWidth = (value) => {
  const parsed = Number(value);
  return TICKET_WIDTH_OPTIONS.includes(parsed)
    ? parsed
    : DEFAULT_TICKET_WIDTH_MM;
};

export const getTicketWidthMm = () =>
  normalizeTicketWidth(readStoredValue(TICKET_WIDTH_KEY));

export const saveTicketWidthMm = (value) => {
  const widthMm = Number(value);

  if (!TICKET_WIDTH_OPTIONS.includes(widthMm)) {
    return {
      success: false,
      widthMm: getTicketWidthMm(),
      error: "Ancho de ticket no válido. Use 58 mm u 80 mm.",
    };
  }

  if (!writeStoredValue(TICKET_WIDTH_KEY, String(widthMm))) {
    return {
      success: false,
      widthMm: getTicketWidthMm(),
      error: "No se pudo guardar el ancho del ticket.",
    };
  }

  return { success: true, widthMm, error: null };
};

/** Perfil de papel que espera el canal `print-ticket` de Electron. */
export const getTicketPrintProfile = () => `${getTicketWidthMm()}mm`;

export const normalizePrintMode = (value) =>
  PRINT_MODE_OPTIONS.includes(value) ? value : DEFAULT_PRINT_MODE;

export const getPrintMode = () =>
  normalizePrintMode(readStoredValue(PRINT_MODE_KEY));

export const savePrintMode = (value) => {
  const printMode = normalizePrintMode(value);

  if (!writeStoredValue(PRINT_MODE_KEY, printMode)) {
    return {
      success: false,
      printMode: getPrintMode(),
      error: "No se pudo guardar el modo de impresión.",
    };
  }

  return { success: true, printMode, error: null };
};

const SELECTED_PRINTER_KEY = "settings_selected_printer";
const TICKET_COPIES_KEY = "settings_ticket_copies";
const TICKET_FEED_LINES_KEY = "settings_ticket_feed_lines";

export const getSelectedPrinter = () => {
  try {
    return window.localStorage.getItem(SELECTED_PRINTER_KEY) || "";
  } catch {
    return "";
  }
};

export const saveSelectedPrinter = (value = "") => {
  try {
    window.localStorage.setItem(SELECTED_PRINTER_KEY, String(value || ""));
    return true;
  } catch {
    return false;
  }
};

export const getTicketCopies = () => {
  try {
    const v = window.localStorage.getItem(TICKET_COPIES_KEY);
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.min(5, Math.trunc(n)) : 1;
  } catch {
    return 1;
  }
};

export const saveTicketCopies = (value = 1) => {
  try {
    const n = Number(value);
    const valid = Number.isFinite(n) && n > 0 ? Math.min(5, Math.trunc(n)) : 1;
    window.localStorage.setItem(TICKET_COPIES_KEY, String(valid));
    return { success: true, copies: valid };
  } catch {
    return { success: false, copies: getTicketCopies() };
  }
};

export const getTicketFeedLines = () => {
  try {
    const v = window.localStorage.getItem(TICKET_FEED_LINES_KEY);
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.min(5, Math.trunc(n)) : 2;
  } catch {
    return 2;
  }
};

export const saveTicketFeedLines = (value = 2) => {
  try {
    const n = Number(value);
    const valid = Number.isFinite(n) && n > 0 ? Math.min(5, Math.trunc(n)) : 2;
    window.localStorage.setItem(TICKET_FEED_LINES_KEY, String(valid));
    return { success: true, feedLines: valid };
  } catch {
    return { success: false, feedLines: getTicketFeedLines() };
  }
};
