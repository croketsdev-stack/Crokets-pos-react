import styles from "../SettingsPrinters.module.css";
import rotateIcon from "../../../../../assets/icons/rotate-solid-full.svg";
import infoIcon from "../../../../../assets/icons/circle-info-solid-full.svg";
import warningIcon from "../../../../../assets/icons/triangle-exclamation-solid-full.svg";

const PrinterDeviceCard = ({
  printers = [],
  selectedPrinter = "",
  onSelectPrinter,
  printersLoading = false,
  printersError = null,
  refreshPrinters,
  isElectron = false,
}) => {
  const getFriendlyError = (error) => {
    if (!error) return null;
    const msg = String(error);
    if (msg.includes("Channel get-printers is not allowed for invoke")) {
      return "Para activar la detección de impresoras del sistema, reinicie la aplicación de escritorio. Actualmente se usará la impresora predeterminada.";
    }
    return msg;
  };
  const friendlyError = getFriendlyError(printersError);
  const isChannelError =
    friendlyError && friendlyError.includes("reinicie la aplicación");

  return (
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>Impresora física del sistema</h2>
      <p className={styles.cardDescription}>
        Compatible con cualquier impresora térmica instalada en el equipo
        (Epson, Xprinter, EC-Line, Star, Bixolon, POS-58/80 por USB, red
        Ethernet o Bluetooth).
      </p>

      {isElectron ? (
        <div className={styles.printerRow}>
          <label htmlFor="printer-select" className={styles.label}>
            Dispositivo
          </label>
          <select
            id="printer-select"
            className={styles.input}
            value={selectedPrinter}
            onChange={(e) => onSelectPrinter(e.target.value)}
            disabled={printersLoading}
          >
            <option value="">Usar impresora predeterminada</option>
            {printers.map((printer) => {
              const name = printer?.name || printer?.deviceName || "";
              const displayName = printer?.displayName || name;
              const isDefault = printer?.isDefault;
              return (
                <option key={name} value={name}>
                  {isDefault
                    ? `[Predeterminada del sistema] ${displayName}`
                    : displayName}
                </option>
              );
            })}
          </select>
          <button
            type="button"
            className={styles.buttonSecondary}
            onClick={refreshPrinters}
            disabled={printersLoading}
          >
            <img
              src={rotateIcon}
              alt=""
              className={styles.buttonIcon}
              aria-hidden="true"
            />
            {printersLoading ? "Actualizando..." : "Actualizar lista"}
          </button>
        </div>
      ) : (
        <p className={styles.description}>
          La detección de impresoras solo está disponible en la aplicación de
          escritorio.
        </p>
      )}

      {friendlyError ? (
        <div
          className={`${styles.infoBanner} ${isChannelError ? styles.infoBannerBlue : styles.errorMessage}`}
          role="alert"
        >
          <img
            src={isChannelError ? infoIcon : warningIcon}
            alt=""
            className={styles.bannerIcon}
            aria-hidden="true"
          />
          <span>{friendlyError}</span>
        </div>
      ) : null}
    </article>
  );
};

export default PrinterDeviceCard;
