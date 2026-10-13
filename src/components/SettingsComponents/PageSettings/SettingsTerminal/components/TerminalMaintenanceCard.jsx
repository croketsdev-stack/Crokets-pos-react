import broomIcon from "../../../../../assets/icons/broom-solid-full.svg";
import styles from "../SettingsTerminal.module.css";
import { formatBytes } from "../utils/terminalFormatters";

const PROTECTED_KEYS = [
  "supabase.auth.token",
  "device_code",
  "cashAmount",
  "isLocked",
  "cashRegistered",
  "cachedUsername",
  "sb-crokets-pos-auth-token",
];

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
    <article className={styles.card} aria-labelledby="maintenance-title">
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <h2 id="maintenance-title" className={styles.cardTitle}>
            Mantenimiento y rendimiento local
          </h2>
          <img src={broomIcon} alt="" aria-hidden="true" className={styles.icon} width="24" height="24" />
        </div>
        <p className={styles.cardDescription}>
          Limpieza de caché, recarga e interfaz de mantenimiento
        </p>
      </header>

      <dl className={styles.definitionList}>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Espacio en localStorage</dt>
          <dd className={styles.definitionValue}>{formatBytes(localStorageSize)}</dd>
        </div>
      </dl>

      <div className={styles.buttonRow}>
        <button type="button" className={styles.buttonSecondary} onClick={handleClear}>
          Limpiar datos temporales / caché
        </button>
        <button type="button" className={styles.buttonSecondary} onClick={handleReloadClick}>
          Recargar interfaz
        </button>
        {hasElectronBridge && (
          <button type="button" className={styles.buttonDanger} onClick={handleClose}>
            Cerrar aplicación
          </button>
        )}
      </div>

      <p className={styles.hint}>
        Al limpiar caché se preservan credenciales, tokens de sesión, device_code y datos críticos.
      </p>
    </article>
  );
};

export default TerminalMaintenanceCard;
