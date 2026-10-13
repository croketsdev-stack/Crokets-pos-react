import broomIcon from "../../../../../assets/icons/broom-solid-full.svg";
import styles from "../SettingsTerminal.module.css";
import { formatBytes } from "../utils/terminalFormatters";

const TerminalMaintenanceCard = ({
  localStorageSize,
  hasElectronBridge,
  onClearLocalStorage,
  onReload,
  onCloseApp,
}) => {
  const handleClear = () => {
    onClearLocalStorage();
  };

  const handleReloadClick = () => {
    onReload();
  };

  const handleClose = () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar la aplicación?")) {
      onCloseApp();
    }
  };

  return (
    <article
      className={`${styles.card} ${styles.cardMaintenance}`}
      aria-labelledby="maintenance-title"
    >
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardHeaderIconBadge} aria-hidden="true">
              <img src={broomIcon} alt="" />
            </span>
            <div className={styles.cardHeading}>
              <h2 id="maintenance-title" className={styles.cardTitle}>
                Mantenimiento y rendimiento local
              </h2>
              <p className={styles.cardDescription}>
                Limpieza de caché, recarga e interfaz de mantenimiento
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.maintenanceContent}>
        <div className={styles.maintenanceInfo}>
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Espacio en localStorage</span>
            <span className={styles.metricValue}>
              {formatBytes(localStorageSize)}
            </span>
          </div>
          <p className={styles.hint}>
            Esta acción restablece datos temporales y tablas en caché. Tu
            sesión, tu sucursal, la configuración de la impresora y los datos de
            caja no se verán afectados.
          </p>
        </div>

        <div className={styles.maintenanceActions}>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={handleClear}
          >
            Limpiar datos temporales
          </button>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={handleReloadClick}
          >
            Recargar
          </button>
          {hasElectronBridge && (
            <button
              type="button"
              className={styles.buttonDanger}
              onClick={handleClose}
            >
              Cerrar aplicación
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default TerminalMaintenanceCard;
