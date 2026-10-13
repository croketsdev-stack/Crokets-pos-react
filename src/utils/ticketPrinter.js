/**
 * Puente de impresion entre el renderer y el proceso principal de Electron.
 */

const PRINT_TICKET_CHANNEL = "print-ticket";

const DEFAULT_FAILURE_MESSAGE = "No se pudo imprimir el ticket.";
const DEFAULT_UNKNOWN_ERROR = "UNKNOWN_PRINT_ERROR";

const SIMULATED_MESSAGE =
  "Ticket generado correctamente. La impresion no esta disponible fuera de Electron.";

export function hasElectronBridge() {
  return (
    typeof window !== "undefined" &&
    typeof window.electronAPI?.invoke === "function"
  );
}

export const printTicket = async (ticketText, options = {}) => {
  if (!hasElectronBridge()) {
    return { success: true, simulated: true, message: SIMULATED_MESSAGE };
  }

  try {
    const result = await window.electronAPI.invoke(PRINT_TICKET_CHANNEL, {
      ticketText,
      options,
    });

    if (!result?.success) {
      return {
        success: false,
        simulated: false,
        message: result?.message || DEFAULT_FAILURE_MESSAGE,
        error: result?.error || DEFAULT_UNKNOWN_ERROR,
      };
    }

    return {
      success: true,
      simulated: false,
      message: result.message || "Ticket impreso correctamente.",
    };
  } catch (error) {
    return {
      success: false,
      simulated: false,
      message: DEFAULT_FAILURE_MESSAGE,
      error: error?.message || DEFAULT_UNKNOWN_ERROR,
    };
  }
};

export const getAvailablePrinters = async () => {
  if (!hasElectronBridge()) {
    return {
      success: true,
      printers: [],
      simulated: true,
    };
  }

  try {
    const printers = await window.electronAPI.invoke("get-printers");
    if (!Array.isArray(printers)) {
      return { success: true, printers: [], simulated: false };
    }
    return { success: true, printers, simulated: false };
  } catch (error) {
    return {
      success: false,
      printers: [],
      simulated: false,
      error: error?.message || DEFAULT_UNKNOWN_ERROR,
    };
  }
};

export const openCashDrawerBridge = async ({ printerDeviceName } = {}) => {
  if (!hasElectronBridge()) {
    return {
      success: false,
      message:
        "La apertura de cajón solo está disponible en la aplicación de escritorio.",
      simulated: true,
    };
  }

  try {
    return await window.electronAPI.invoke("open-cash-drawer", {
      deviceName: printerDeviceName,
    });
  } catch (error) {
    return {
      success: false,
      message: "No se pudo abrir el cajón de dinero.",
      error: error?.message || DEFAULT_UNKNOWN_ERROR,
    };
  }
};
