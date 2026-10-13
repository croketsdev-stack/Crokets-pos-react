import { supabase } from "../../../../../lib/supabaseClient";

const STORAGE_KEY_PREFIX = "terminal_alias_";

const getStorageKey = (deviceCode) => {
  if (!deviceCode) return null;
  return `${STORAGE_KEY_PREFIX}${deviceCode}`;
};

export const getTerminalAlias = async (deviceCode) => {
  if (!deviceCode) {
    return {
      success: false,
      alias: null,
      error: "No se recibió el código del dispositivo.",
      source: null,
    };
  }

  try {
    const { data, error } = await supabase
      .from("system_settings")
      .select("value, value_type")
      .eq("setting_key", `terminal_alias_${deviceCode}`)
      .maybeSingle();

    if (error) throw error;

    if (data?.value) {
      let alias = data.value;
      if (data.value_type === "json" && typeof data.value === "object") {
        alias = data.value.alias || data.value.name || String(data.value);
      } else if (typeof data.value === "object") {
        alias = data.value.alias || data.value.name || null;
      }

      return {
        success: true,
        alias: alias ? String(alias) : null,
        error: null,
        source: "supabase",
      };
    }
  } catch (error) {
    console.error("Error obteniendo alias del terminal:", error);
  }

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const key = getStorageKey(deviceCode);
      if (key) {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          return {
            success: true,
            alias: stored,
            error: null,
            source: "localStorage",
          };
        }
      }
    }
  } catch (error) {
    console.error("Error leyendo alias desde localStorage:", error);
  }

  return {
    success: true,
    alias: null,
    error: null,
    source: null,
  };
};

export const saveTerminalAlias = async (deviceCode, alias) => {
  if (!deviceCode) {
    return {
      success: false,
      alias: null,
      error: "No se recibió el código del dispositivo.",
      source: null,
    };
  }

  if (!alias || !String(alias).trim()) {
    return {
      success: false,
      alias: null,
      error: "El alias no puede estar vacío.",
      source: null,
    };
  }

  const aliasTrimmed = String(alias).trim();

  let savedToSupabase = false;
  try {
    const { error } = await supabase.from("system_settings").upsert(
      {
        setting_key: `terminal_alias_${deviceCode}`,
        value: { alias: aliasTrimmed },
        value_type: "json",
      },
      { onConflict: "setting_key" }
    );

    if (error) throw error;
    savedToSupabase = true;
  } catch (error) {
    console.error("Error guardando alias en Supabase:", error);
  }

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const key = getStorageKey(deviceCode);
      if (key) {
        window.localStorage.setItem(key, aliasTrimmed);
      }
    }
  } catch (error) {
    console.error("Error guardando alias en localStorage:", error);
  }

  return {
    success: savedToSupabase,
    alias: aliasTrimmed,
    error: savedToSupabase ? null : "No se pudo guardar en Supabase, se usó respaldo local",
    source: savedToSupabase ? "supabase" : "localStorage",
  };
};

export const deleteTerminalAlias = async (deviceCode) => {
  if (!deviceCode) {
    return { success: false, error: "No se recibió el código del dispositivo." };
  }

  try {
    const { error } = await supabase
      .from("system_settings")
      .delete()
      .eq("setting_key", `terminal_alias_${deviceCode}`);

    if (error) throw error;
  } catch (error) {
    console.error("Error eliminando alias de Supabase:", error);
  }

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const key = getStorageKey(deviceCode);
      if (key) {
        window.localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Error eliminando alias de localStorage:", error);
  }

  return { success: true, error: null };
};
