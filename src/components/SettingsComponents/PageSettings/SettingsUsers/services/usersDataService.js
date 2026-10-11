import { supabase } from "../../../../../lib/supabaseClient";

export const USER_SELECT_CANDIDATES = [
  "id, name, username, email, status, role_id, created_at, roles ( name )",
  "id, name, username, email, status, role_id, created_at",
  "id, username, email, status, created_at, roles ( name )",
  "id, username, email, status, created_at",
];

export const normalizeRoleName = (rolesValue) => {
  if (Array.isArray(rolesValue)) {
    return rolesValue[0]?.name || null;
  }

  return rolesValue?.name || null;
};

export const normalizeUserRow = (row) => {
  const roleName = normalizeRoleName(row?.roles);
  const username = (row?.username || row?.email || "SIN USUARIO")
    .toString()
    .trim();

  return {
    id: row?.id || username,
    name: row?.name ? String(row.name).trim() : "",
    username,
    email: row?.email || "",
    status: typeof row?.status === "boolean" ? row.status : null,
    roleId: row?.role_id || null,
    roleName: roleName || "SIN ROL",
    createdAt: row?.created_at || null,
  };
};

export const fetchUsers = async () => {
  let lastError = null;

  for (const selectClause of USER_SELECT_CANDIDATES) {
    const { data, error } = await supabase
      .from("users")
      .select(selectClause)
      .order("created_at", { ascending: false });

    if (!error) {
      return {
        success: true,
        data: Array.isArray(data) ? data.map(normalizeUserRow) : [],
        error: null,
      };
    }

    lastError = error;
  }

  console.error("Error consultando usuarios:", lastError);

  return {
    success: false,
    data: [],
    error: lastError?.message || "No se pudieron consultar los usuarios.",
  };
};

export const fetchRoles = async () => {
  const { data, error } = await supabase
    .from("roles")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error consultando roles:", error);

    return {
      success: false,
      data: [],
      error: error.message || "No se pudieron consultar los roles.",
    };
  }

  return {
    success: true,
    data: Array.isArray(data) ? data : [],
    error: null,
  };
};

export const updateUser = async ({ id, name, roleId }) => {
  if (!id) {
    return {
      success: false,
      data: null,
      error: "Falta el identificador del usuario.",
    };
  }

  const payload = {};

  if (typeof name === "string") {
    payload.name = name.trim();
  }

  if (roleId) {
    payload.role_id = roleId;
  }

  if (Object.keys(payload).length === 0) {
    return { success: true, data: null, error: null };
  }

  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", id)
    .select("id, name, username, email, status, role_id, created_at")
    .maybeSingle();

  if (error) {
    console.error("Error actualizando usuario:", error);

    return {
      success: false,
      data: null,
      error: error.message || "No se pudo actualizar el usuario.",
    };
  }

  return {
    success: true,
    data: data ? normalizeUserRow(data) : null,
    error: null,
  };
};

export const updateUserStatus = async ({ id, status }) => {
  if (!id || typeof status !== "boolean") {
    return {
      success: false,
      data: null,
      error: "Datos insuficientes para cambiar el estado del usuario.",
    };
  }

  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", id)
    .select("id, name, username, email, status, role_id, created_at")
    .maybeSingle();

  if (error) {
    console.error("Error cambiando el estado del usuario:", error);

    return {
      success: false,
      data: null,
      error: error.message || "No se pudo cambiar el estado del usuario.",
    };
  }

  return {
    success: true,
    data: data ? normalizeUserRow(data) : null,
    error: null,
  };
};

/**
 * Registra un usuario nuevo.
 *
 * La cuenta de autenticacion se crea con `auth.signUp`; si el proyecto exige
 * confirmacion por correo, no se devuelve sesion y el usuario queda pendiente
 * de confirmar. Como `signUp` puede reemplazar la sesion activa del
 * administrador cuando la confirmacion esta desactivada, se restaura la sesion
 * previa si la llamada devolvio una nueva. El perfil en `public.users` se
 * escribe despues con el id devuelto por Auth.
 */
export const createUser = async ({
  name,
  username,
  email,
  roleId,
  password,
}) => {
  const cleanUsername = String(username || "").trim();
  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();
  const cleanName = String(name || "").trim();

  if (!cleanUsername || !cleanEmail || !roleId || !password) {
    return {
      success: false,
      data: null,
      error: "Completa nombre de usuario, correo, rol y contraseña.",
    };
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const previousSession = sessionData?.session ?? null;

  const { data, error } = await supabase.auth.signUp({
    email: cleanEmail,
    password,
    options: { data: { username: cleanUsername, name: cleanName } },
  });

  if (error) {
    console.error("Error creando la cuenta del usuario:", error);

    return {
      success: false,
      data: null,
      error: error.message || "No se pudo crear la cuenta del usuario.",
    };
  }

  if (previousSession && data?.session) {
    await supabase.auth.setSession({
      access_token: previousSession.access_token,
      refresh_token: previousSession.refresh_token,
    });
  }

  const authUserId = data?.user?.id;

  if (!authUserId) {
    return {
      success: false,
      data: null,
      error: "No se recibió el identificador del usuario creado.",
    };
  }

  const { error: profileError } = await supabase.from("users").insert({
    id: authUserId,
    name: cleanName,
    username: cleanUsername,
    email: cleanEmail,
    role_id: roleId,
    status: true,
  });

  if (profileError) {
    console.error("Error creando el perfil del usuario:", profileError);

    return {
      success: false,
      data: null,
      error:
        profileError.message ||
        "La cuenta se creó pero no se pudo guardar el perfil.",
    };
  }

  const requiresConfirmation = !data?.session;

  return {
    success: true,
    data: { id: authUserId },
    requiresConfirmation,
    error: null,
  };
};
