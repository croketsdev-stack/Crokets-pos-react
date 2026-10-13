import displayIcon from "../../../../../assets/icons/display-solid-full.svg";
import styles from "../SettingsTerminal.module.css";
import { formatResolution, formatDpr } from "../utils/terminalFormatters";

const DisplaySettingsCard = ({
  zoomFactor,
  zoomChips,
  zoomFeedback,
  fullscreen,
  screenInfo,
  hasElectronBridge,
  onZoomChange,
  onZoomSet,
  onZoomReset,
  onToggleFullscreen,
}) => {
  return (
    <article className={styles.card} aria-labelledby="display-title">
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h2 id="display-title" className={styles.cardTitle}>
            Preferencias visuales y pantalla
          </h2>
          <img src={displayIcon} alt="" aria-hidden="true" className={styles.icon} width="24" height="24" />
        </div>
        <p className={styles.cardDescription}>
          Control de zoom, escalas rápidas y modo pantalla completa
        </p>
      </header>

      <section aria-labelledby="zoom-controls-title">
        <h3 id="zoom-controls-title" className={styles.cardTitle} style={{ fontSize: "1rem" }}>
          Zoom de la ventana
        </h3>
        <div className={styles.buttonRow}>
          <button type="button" className={styles.buttonSecondary} onClick={() => onZoomChange(-0.1)}>
            Alejar vista (-10%)
          </button>
          <button type="button" className={styles.buttonSecondary} onClick={() => onZoomChange(0.1)}>
            Acercar vista (+10%)
          </button>
          <button type="button" className={styles.buttonSecondary} onClick={onZoomReset}>
            Restablecer vista
          </button>
        </div>

        <div className={styles.chipGroup}>
          {zoomChips.map((chip) => {
            const isActive = Math.abs(zoomFactor - chip) < 0.01;
            return (
              <button
                key={chip}
                type="button"
                className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                onClick={() => onZoomSet(chip)}
                aria-pressed={isActive}
              >
                {Math.round(chip * 100)}%
              </button>
            );
          })}
        </div>

        <p className={styles.hint}>Zoom actual: {Math.round(zoomFactor * 100)}%</p>

        {zoomFeedback?.type === "error" && (
          <p role="alert" className={styles.errorMessage}>
            {zoomFeedback.message}
          </p>
        )}
        {zoomFeedback?.type === "success" && (
          <p role="status" className={styles.statusMessage}>
            {zoomFeedback.message}
          </p>
        )}
      </section>

      <section aria-labelledby="screen-info-title">
        <h3 id="screen-info-title" className={styles.cardTitle} style={{ fontSize: "1rem" }}>
          Información de pantalla
        </h3>
        <dl className={styles.definitionList}>
          <div className={styles.definitionItem}>
            <dt className={styles.definitionTerm}>Resolución nativa</dt>
            <dd className={styles.definitionValue}>
              {formatResolution(screenInfo.width, screenInfo.height)}
            </dd>
          </div>
          <div className={styles.definitionItem}>
            <dt className={styles.definitionTerm}>Viewport útil</dt>
            <dd className={styles.definitionValue}>
              {formatResolution(screenInfo.innerWidth, screenInfo.innerHeight)}
            </dd>
          </div>
          <div className={styles.definitionItem}>
            <dt className={styles.definitionTerm}>DPR</dt>
            <dd className={styles.definitionValue}>{formatDpr(screenInfo.dpr)}</dd>
          </div>
        </dl>
      </section>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.button}
          onClick={onToggleFullscreen}
          style={{ minHeight: "44px", minWidth: "44px" }}
        >
          {fullscreen ? "Salir de pantalla completa" : "Activar pantalla completa"}
        </button>
      </div>
    </article>
  );
};

export default DisplaySettingsCard;
