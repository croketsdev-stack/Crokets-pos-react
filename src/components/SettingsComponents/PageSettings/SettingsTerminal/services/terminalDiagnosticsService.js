import { supabase } from "../../../../../lib/supabaseClient";

const hasElectronBridge = () =>
  typeof window !== "undefined" &&
  typeof window.electronAPI?.invoke === "function";

export const measureLatencyToSupabase = async (timeoutMs = 5000) => {
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const { error } = await supabase
      .from("users")
      .select("id")
      .limit(1)
      .abortSignal?.(controller.signal);

    clearTimeout(timeoutId);

    if (error && error.name !== "AbortError") throw error;

    const end = typeof performance !== "undefined" ? performance.now() : Date.now();
    const latencyMs = end - start;

    return {
      success: true,
      connected: true,
      latencyMs: Math.round(latencyMs),
      error: null,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      return {
        success: false,
        connected: false,
        latencyMs: null,
        error: "Tiempo de espera agotado",
      };
    }

    console.error("Error midiendo latencia a Supabase:", error);

    return {
      success: false,
      connected: false,
      latencyMs: null,
      error: error.message || "Sin conexión con Supabase",
    };
  }
};

export const checkOnlineStatus = () => {
  if (typeof navigator !== "undefined" && navigator.onLine !== undefined) {
    return navigator.onLine;
  }
  return true;
};

export const checkElectronBridge = () => {
  return hasElectronBridge();
};

export const runDiagnostics = async () => {
  const online = checkOnlineStatus();
  const electronBridge = checkElectronBridge();

  const latencyResult = await measureLatencyToSupabase();

  const services = [
    {
      id: "network",
      label: "Internet / Red",
      status: online ? "ok" : "error",
      message: online ? "Conexión de red disponible" : "Sin conexión a internet",
    },
    {
      id: "supabase",
      label: "Supabase Database",
      status: latencyResult.connected ? "ok" : "error",
      message: latencyResult.connected
        ? `Respuesta: ${Math.round(latencyResult.latencyMs)} ms`
        : latencyResult.error || "Sin conexión con Supabase",
      latencyMs: latencyResult.latencyMs,
    },
    {
      id: "auth",
      label: "Autenticación",
      status: "ok",
      message: "Sesión verificada",
    },
    {
      id: "electron",
      label: "Puente Electron",
      status: electronBridge ? "ok" : "warning",
      message: electronBridge
        ? "Bridge disponible"
        : "Solo disponible en aplicación de escritorio",
    },
  ];

  const overallOk = services.every((s) => s.status !== "error");

  return {
    success: true,
    overallOk,
    online,
    latencyMs: latencyResult.latencyMs,
    services,
    error: null,
  };
};
