export const ROLE_ADMIN = "admin";
export const ROLE_CASHIER = "cajero";

export const getRoleBadgeVariant = (roleName) => {
  const normalized = String(roleName || "")
    .trim()
    .toLowerCase();

  if (normalized === ROLE_ADMIN) return "admin";
  if (normalized === ROLE_CASHIER) return "cashier";
  return "unknown";
};

export const getStatusBadgeVariant = (status) => {
  if (status === true) return "active";
  if (status === false) return "inactive";
  return "unknown";
};

export const getRoleLabel = (roleName) => {
  const variant = getRoleBadgeVariant(roleName);

  if (variant === "admin") return "ADMIN";
  if (variant === "cashier") return "CAJERO";
  return "SIN ROL";
};

export const getStatusLabel = (status) => {
  const variant = getStatusBadgeVariant(status);

  if (variant === "active") return "ACTIVO";
  if (variant === "inactive") return "INACTIVO";
  return "SIN ESTADO";
};

export const getUserInitials = (name, username) => {
  const source = String(name || "").trim() || String(username || "").trim();

  if (!source) return "?";

  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length > 1) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
};

export const getUserDisplayName = (user) => {
  const name = String(user?.name || "").trim();

  if (name) return name;

  const username = String(user?.username || "").trim();

  return username || "SIN USUARIO";
};

export const formatUserDate = (dateString) => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Fecha no válida";

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const resolveBadgeClass = (styles, base, variant) => {
  if (!styles) return "";

  const key = `${base}${variant.charAt(0).toUpperCase()}${variant.slice(1)}`;

  return styles[key] || "";
};

export const getRoleBadgeClass = (roleName, styles) =>
  resolveBadgeClass(styles, "roleBadge", getRoleBadgeVariant(roleName));

export const getStatusBadgeClass = (status, styles) =>
  resolveBadgeClass(styles, "statusBadge", getStatusBadgeVariant(status));
