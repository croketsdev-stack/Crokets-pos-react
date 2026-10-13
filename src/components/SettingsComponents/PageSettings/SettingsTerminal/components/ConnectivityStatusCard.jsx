import rotateIcon from "../../../../../assets/icons/rotate-solid-full.svg";
import checkIcon from "../../../../../assets/icons/circle-check-solid-full.svg";
import warningIcon from "../../../../../assets/icons/triangle-exclamation-solid-full.svg";
import styles from "../SettingsTerminal.module.css";
import {
  formatMilliseconds,
  getLatencyLevel,
} from "../utils/terminalFormatters";

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

const getIcon = (status) => {
  if (status === "ok") {
    return (
      <img
        src={checkIcon}
        alt=""
        aria-hidden="true"
        className={`${styles.icon} ${styles.iconSuccess}`}
      />
    );
  }
  return (
    <img
      src={warningIcon}
      alt=""
      aria-hidden="true"
      className={`${styles.icon} ${styles.iconWarning}`}
    />
  );
};

const ConnectivityStatusCard = ({
  isOnline,
  diagnostics,
  diagnosticsLoading,
  connection,
  onRunDiagnostics,
}) => {
  const latencyMs = diagnostics?.latencyMs ?? null;
  const latencyLevel = getLatencyLevel(latencyMs);
  const isConnected = connection === "online";
  const isChecking = connection === "checking";

  const generalStatusText = isConnected
    ? "Conectado a Supabase"
    : isChecking
      ? "Verificando conexión..."
      : "Sin conexión con Supabase";

  const generalStatusClass = isConnected
    ? styles.badgeOk
    : isChecking
      ? styles.badgeWarning
      : styles.badgeError;

  return (
    <article className={styles.card} aria-labelledby="connectivity-title">
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardHeaderIconBadge} aria-hidden="true">
              <img src={rotateIcon} alt="" />
            </span>
            <div className={styles.cardHeading}>
              <h2 id="connectivity-title" className={styles.cardTitle}>
                Monitor de conectividad y salud
              </h2>
              <p className={styles.cardDescription}>
                Estado de red, latencia y verificación de servicios
              </p>
            </div>
          </div>
        </div>
      </header>

      <dl className={styles.definitionList}>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Estado de red local</dt>
          <dd className={styles.definitionValue}>
            <span
              className={
                isOnline
                  ? `${styles.badge} ${styles.badgeOk}`
                  : `${styles.badge} ${styles.badgeError}`
              }
            >
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
            <span
              role="status"
              className={`${styles.badge} ${generalStatusClass}`}
            >
              {generalStatusText}
            </span>
          </dd>
        </div>
      </dl>

      <section aria-labelledby="services-checklist-title">
        <h3 id="services-checklist-title" className={styles.sectionTitle}>
          Checklist de servicios
        </h3>
        <ul className={styles.checklist}>
          {diagnostics?.services?.map((service) => (
            <li key={service.id} className={styles.checklistItem}>
              <span className={styles.iconWrapper}>
                {getIcon(service.status)}
              </span>
              <div className={styles.checklistContent}>
                <span className={styles.checklistLabel}>{service.label}</span>
                <span className={styles.checklistMessage}>
                  {service.message}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.buttonSecondary}
          onClick={onRunDiagnostics}
          disabled={diagnosticsLoading}
        >
          <img
            src={rotateIcon}
            alt=""
            aria-hidden="true"
            className={styles.buttonIcon}
          />
          {diagnosticsLoading ? "Ejecutando..." : "Ejecutar diagnóstico"}
        </button>
      </div>
    </article>
  );
};

export default ConnectivityStatusCard;
