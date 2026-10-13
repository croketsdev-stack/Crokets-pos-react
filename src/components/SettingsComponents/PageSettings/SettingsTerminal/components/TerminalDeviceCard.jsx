import displayIcon from "../../../../../assets/icons/display-solid-full.svg";
import styles from "../SettingsTerminal.module.css";

const TerminalDeviceCard = ({
  device,
  alias,
  aliasLoading,
  aliasSaving,
  aliasFeedback,
  copyFeedback,
  cashSession,
  posDevicesActive,
  onSaveAlias,
  onCopyDeviceCode,
}) => {
  const handleAliasSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newAlias = formData.get("alias");
    if (newAlias) {
      onSaveAlias(newAlias);
      e.target.reset();
    }
  };

  return (
    <article className={styles.card} aria-labelledby="terminal-device-title">
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h2 id="terminal-device-title" className={styles.cardTitle}>
            Identidad del terminal
          </h2>
          <img src={displayIcon} alt="" aria-hidden="true" className={styles.icon} width="24" height="24" />
        </div>
        <p className={styles.cardDescription}>
          Identificación del puesto de trabajo y registro POS
        </p>
      </header>

      <dl className={styles.definitionList}>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Alias del puesto</dt>
          <dd className={styles.definitionValue}>
            {alias || "Sin alias configurado"}
            {aliasLoading && " (cargando...)"}
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Código del dispositivo</dt>
          <dd className={styles.definitionValue}>
            <div className={styles.codeBlock}>
              <span className={styles.codeText}>
                {device.status === "loading"
                  ? "Cargando..."
                  : device.status === "ready" && device.code
                    ? device.code
                    : "No disponible"}
              </span>
              {device.status === "ready" && device.code && (
                <button
                  type="button"
                  className={styles.buttonSecondary}
                  onClick={onCopyDeviceCode}
                  aria-label="Copiar código del dispositivo"
                >
                  Copiar código
                </button>
              )}
            </div>
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Estado del dispositivo (pos_devices)</dt>
          <dd className={styles.definitionValue}>
            <span className={`${styles.badge} ${styles.badgeOk}`}>
              Activo
            </span>
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Estado de caja registradora</dt>
          <dd className={styles.definitionValue}>
            {cashSession ? (
              <span className={`${styles.badge} ${styles.badgeOk}`}>
                Caja abierta
              </span>
            ) : (
              <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                Sin caja abierta
              </span>
            )}
          </dd>
        </div>
      </dl>

      <form onSubmit={handleAliasSubmit} className={styles.buttonRow}>
        <div className={styles.formField} style={{ flex: 1, minWidth: "250px" }}>
          <label htmlFor="alias-input" className={styles.formLabel}>
            Alias del puesto
          </label>
          <input
            id="alias-input"
            name="alias"
            type="text"
            className={styles.input}
            placeholder="Ej. Caja 1 - Mostrador Principal"
            defaultValue={alias || ""}
          />
        </div>
        <button type="submit" className={styles.button} disabled={aliasSaving || device.status !== "ready"}>
          {aliasSaving ? "Guardando..." : "Guardar alias"}
        </button>
      </form>

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
      {aliasFeedback?.type === "success" && (
        <p role="status" className={styles.statusMessage}>
          {aliasFeedback.message}
        </p>
      )}
      {aliasFeedback?.type === "error" && (
        <p role="alert" className={styles.errorMessage}>
          {aliasFeedback.message}
        </p>
      )}
    </article>
  );
};

export default TerminalDeviceCard;
