import displayIcon from "../../../../../assets/icons/display-solid-full.svg";
import warningIcon from "../../../../../assets/icons/triangle-exclamation-solid-full.svg";
import styles from "../SettingsTerminal.module.css";
import { formatResolution, formatDpr } from "../utils/terminalFormatters";

const DisplaySettingsCard = ({
  zoomFactor,
  zoomChips,
  zoomFeedback,
  fullscreen,
  fullscreenFeedback,
  screenInfo,
  onZoomChange,
  onZoomSet,
  onZoomReset,
  onToggleFullscreen,
}) => {
  const zoomPercent = Math.round(zoomFactor * 100);

  return (
    <article className={styles.card} aria-labelledby="display-title">
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardHeaderIconBadge} aria-hidden="true">
              <img src={displayIcon} alt="" />
            </span>
            <div className={styles.cardHeading}>
              <h2 id="display-title" className={styles.cardTitle}>
                Preferencias visuales y pantalla
              </h2>
              <p className={styles.cardDescription}>
                Control de zoom, escalas rápidas y modo pantalla completa
              </p>
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="zoom-controls-title">
        <h3 id="zoom-controls-title" className={styles.sectionTitle}>
          Zoom de la ventana
        </h3>
        <div className={styles.zoomControlRow}>
          <div
            className={styles.zoomStepper}
            role="group"
            aria-label="Control de zoom"
          >
            <button
              type="button"
              className={styles.zoomStepperButton}
              onClick={() => onZoomChange(-1)}
              aria-label="Alejar vista"
            >
              -
            </button>
            <span className={styles.zoomStepperValue} aria-live="polite">
              {zoomPercent}%
            </span>
            <button
              type="button"
              className={styles.zoomStepperButton}
              onClick={() => onZoomChange(1)}
              aria-label="Acercar vista"
            >
              +
            </button>
          </div>
          <button
            type="button"
            className={styles.buttonGhost}
            onClick={onZoomReset}
            aria-label="Restablecer vista"
          >
            Restablecer
          </button>
        </div>

        <div className={styles.chipGroup}>
          {zoomChips.map((chip) => {
            const isActive = Math.round(chip * 100) === zoomPercent;
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

        <p className={`${styles.hint} ${styles.zoomHint}`}>
          Zoom actual: {zoomPercent}%
        </p>

        {zoomFeedback?.type === "success" && (
          <p role="status" className={styles.statusMessage}>
            {zoomFeedback.message}
          </p>
        )}
        {zoomFeedback?.type === "error" && (
          <p role="alert" className={styles.errorMessage}>
            {zoomFeedback.message}
          </p>
        )}
      </section>

      <section aria-labelledby="display-metrics-title">
        <h3 id="display-metrics-title" className={styles.sectionTitle}>
          Pantalla actual
        </h3>
        <div className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Resolución nativa</span>
            <span className={styles.metricValue}>
              {formatResolution(screenInfo.width, screenInfo.height)}
            </span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Viewport útil</span>
            <span className={styles.metricValue}>
              {formatResolution(screenInfo.innerWidth, screenInfo.innerHeight)}
            </span>
          </div>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>DPR</span>
            <span className={styles.metricValue}>
              {formatDpr(screenInfo.dpr)}
            </span>
          </div>
        </div>
      </section>

      <div className={styles.buttonRow}>
        <button
          type="button"
          className={styles.button}
          onClick={onToggleFullscreen}
        >
          {fullscreen
            ? "Salir de pantalla completa"
            : "Activar pantalla completa"}
        </button>
      </div>

      {fullscreenFeedback?.type === "error" && (
        <div role="alert" className={styles.feedbackAlert}>
          <img
            src={warningIcon}
            alt=""
            aria-hidden="true"
            className={styles.feedbackAlertIcon}
          />
          <p className={styles.feedbackAlertText}>
            {fullscreenFeedback.message}
          </p>
        </div>
      )}
    </article>
  );
};

export default DisplaySettingsCard;
