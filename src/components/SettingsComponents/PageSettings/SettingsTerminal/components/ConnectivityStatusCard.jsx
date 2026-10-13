import rotateIcon from "../../../../../assets/icons/rotate-solid-full.svg";
import checkIcon from "../../../../../assets/icons/circle-check-solid-full.svg";
import warningIcon from "../../../../../assets/icons/triangle-exclamation-solid-full.svg";
import styles from "../SettingsTerminal.module.css";
import { formatMilliseconds, getLatencyLevel } from "../utils/terminalFormatters";

const getBadgeClass = (level) => {
  switch (level) {
    case "excellent":
      return `${styles.badge} ${styles.badgeExcellent}`;
    case "acceptable":
      return `${styles.badge} ${styles.badgeAcceptable}`;
    case "slow":
      return `${styles.badge} ${styles.badgeSlow}`;
    default:
      return `${styles.badge} ${styles.badgeDisconnected}`;
  }
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case "ok":
      return `${styles.badge} ${styles.badgeOk}`;
    case "warning":
      return `${styles.badge} ${styles.badgeWarning}`;
    case "error":
      return `${styles.badge} ${styles.badgeError}`;
    default:
      return `${styles.badge} ${styles.badgeNeutral}`;
  }
};

const getIcon = (status) => {
  if (status === "ok") {
    return <img src={checkIcon} alt="" aria-hidden="true" className={styles.icon} />;
  }
  return <img src={warningIcon} alt="" aria-hidden="true" className={styles.icon} />;
};

const ConnectivityStatusCard = ({
  isOnline,
  diagnostics,
  diagnosticsLoading,
  connection,
  onRunDiagnostics,
}) => {
  const latencyMs = diagnostics?.latencyMs || null;
  const latencyLevel = getLatencyLevel(latencyMs);

  return (
    <article className={styles.card} aria-labelledby="connectivity-title">
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h2 id="connectivity-title" className={styles.cardTitle}>
            Monitor de conectividad y salud
          </h2>
          <img src={rotateIcon} alt="" aria-hidden="true" className={styles.icon} width="24" height="24" />
        </div>
        <p className={styles.cardDescription}>
          Estado de red, latencia y verificación de servicios
        </p>
      </header>

      <dl className={styles.definitionList}>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Estado de red local</dt>
          <dd className={styles.definitionValue}>
            <span className={isOnline ? `${styles.badge} ${styles.badgeOk}` : `${styles.badge} ${styles.badgeError}`}>
              {isOnline ? "Conectado" : "Sin conexión"}
            </span>
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Latencia con Supabase</dt>
          <dd className={styles.definitionValue}>
            <span className={getBadgeClass(latencyLevel)}>
              {formatMilliseconds(latencyMs)}
            </span>
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Estado general</dt>
          <dd className={styles.definitionValue}>
            <span role="status">{connection === "online" ? "Conectado a Supabase" : connection === "checking" ? "Verificando conexión..." : "Sin conexión con Supabase"}</span>
          </dd>
        </div>
      </dl>

      <section aria-labelledby="services-checklist-title">
        <h3 id="services-checklist-title" className={styles.cardTitle} style={{ fontSize: "1rem" }}>
          Checklist de servicios
        </h3>
        <ul className={styles.checklist}>
          {diagnostics?.services?.map((service) => (
            <li key={service.id} className={styles.checklistItem}>
              <span className={styles.iconWrapper}>{getIcon(service.status)}</span>
              <div className={styles.checklistContent}>
                <span className={styles.checklistLabel}>{service.label}</span>
                <span className={styles.checklistMessage}>{service.message}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.buttonRow}>
        <button type="button" className={styles.button} onClick={onRunDiagnostics} disabled={diagnosticsLoading}>
          {diagnosticsLoading ? "Ejecutando..." : "Ejecutar diagnóstico"}
        </button>
      </div>
    </article>
  );
};

export default ConnectivityStatusCard;
