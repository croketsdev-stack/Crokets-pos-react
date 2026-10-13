import displayIcon from "../../../../../assets/icons/display-solid-full.svg";
import styles from "../SettingsTerminal.module.css";

const TerminalDeviceCard = ({
  device,
  copyFeedback,
  cashSession,
  onCopyDeviceCode,
}) => {
  const deviceCode =
    device.status === "loading"
      ? "Cargando..."
      : device.status === "ready" && device.code
        ? device.code
        : "No disponible";

  const posRegistered = device.status === "ready";

  return (
    <article className={styles.card} aria-labelledby="terminal-device-title">
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardHeaderIconBadge} aria-hidden="true">
              <img src={displayIcon} alt="" />
            </span>
            <div className={styles.cardHeading}>
              <h2 id="terminal-device-title" className={styles.cardTitle}>
                Identidad del terminal
              </h2>
              <p className={styles.cardDescription}>
                Identificación del puesto de trabajo y registro POS
              </p>
            </div>
          </div>
        </div>
      </header>

      <dl className={styles.definitionList}>
        <div
          className={`${styles.definitionItem} ${styles.definitionItemWide}`}
        >
          <dt className={styles.definitionTerm}>Código del dispositivo</dt>
          <dd className={styles.definitionValue}>
            <div className={styles.codeBlock}>
              <span className={styles.codeText}>{deviceCode}</span>
              {device.status === "ready" && device.code && (
                <button
                  type="button"
                  className={styles.codeCopyButton}
                  onClick={onCopyDeviceCode}
                  aria-label="Copiar código del dispositivo"
                >
                  Copiar código
                </button>
              )}
            </div>
          </dd>
        </div>
      </dl>

      <div className={styles.statusRow}>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Dispositivo POS</span>
          <span
            className={`${styles.badge} ${posRegistered ? styles.badgeOk : styles.badgeNeutral}`}
          >
            {posRegistered ? "Activo" : "Inactivo"}
          </span>
        </div>
        <div className={styles.statusItem}>
          <span className={styles.statusLabel}>Estado de caja</span>
          {cashSession ? (
            <span className={`${styles.badge} ${styles.badgeOk}`}>
              Caja abierta
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
              Sin caja abierta
            </span>
          )}
        </div>
      </div>

      {copyFeedback?.type === "success" && (
        <p role="status" className={styles.statusMessage}>
          {copyFeedback.message}
        </p>
      )}
      {copyFeedback?.type === "error" && (
        <p role="alert" className={styles.errorMessage}>
          {copyFeedback.message}
        </p>
      )}
    </article>
  );
};

export default TerminalDeviceCard;
