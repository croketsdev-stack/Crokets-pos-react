import styles from "./ScopeBadge.module.css";

const SCOPE_CONFIG = {
  branch: {
    label: "Aplica a toda la sucursal",
    hint: "Configuración sincronizada en la nube para todas las cajas de la tienda.",
    variantClass: styles.branch,
  },
  device: {
    label: "Solo este equipo",
    hint: "Preferencia local y hardware físico exclusivo de esta máquina.",
    variantClass: styles.device,
  },
  status: {
    label: "Estado del sistema",
    hint: "Información de diagnóstico en tiempo real de esta terminal.",
    variantClass: styles.status,
  },
};

const ScopeBadge = ({ scope = "branch" }) => {
  const config = SCOPE_CONFIG[scope] || SCOPE_CONFIG.branch;

  return (
    <span
      className={`${styles.badge} ${config.variantClass}`}
      title={config.hint}
    >
      {config.label}
    </span>
  );
};

export default ScopeBadge;
