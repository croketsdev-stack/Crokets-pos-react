import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const resolveRoleName = (rolesValue) => {
  if (Array.isArray(rolesValue)) {
    return rolesValue[0]?.name || null;
  }

  return rolesValue?.name || null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, message: "Método no permitido." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return jsonResponse(
        { ok: false, message: "Faltan variables de entorno de Supabase." },
        500
      );
    }

    const authorization =
      req.headers.get("Authorization") || req.headers.get("authorization");

    if (!authorization) {
      return jsonResponse(
        { ok: false, message: "No se recibió la sesión del administrador." },
        401
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authorization } },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await supabaseUser.auth.getUser();

    if (callerError || !caller) {
      return jsonResponse(
        { ok: false, message: "La sesión del administrador no es válida." },
        401
      );
    }

    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("id, status, roles ( name )")
      .eq("id", caller.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error consultando al administrador:", profileError);

      return jsonResponse(
        { ok: false, message: "No se pudo validar al administrador." },
        500
      );
    }

    if (!callerProfile || callerProfile.status !== true) {
      return jsonResponse({
        ok: false,
        message: "El administrador no está activo.",
      });
    }

    if (resolveRoleName(callerProfile.roles) !== "admin") {
      return jsonResponse({
        ok: false,
        message: "Solo un administrador puede restablecer contraseñas.",
      });
    }

    const body = await req.json();
    const targetId = String(body?.targetId || "").trim();
    const newPassword = String(body?.newPassword || "");

    if (!targetId) {
      return jsonResponse({
        ok: false,
        message: "No se recibió el usuario a actualizar.",
      });
    }

    if (newPassword.length < 6) {
      return jsonResponse({
        ok: false,
        message: "La contraseña debe tener al menos 6 caracteres.",
      });
    }

    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(targetId, {
        password: newPassword,
      });

    if (updateError) {
      console.error("Error actualizando la contraseña del usuario:", updateError);

      return jsonResponse({
        ok: false,
        message: "No se pudo restablecer la contraseña del usuario.",
      });
    }

    return jsonResponse({ ok: true, targetId });
  } catch (error) {
    console.error("Error general en admin-reset-user-password:", error);

    return jsonResponse(
      { ok: false, message: "Ocurrió un error al restablecer la contraseña." },
      500
    );
  }
});
