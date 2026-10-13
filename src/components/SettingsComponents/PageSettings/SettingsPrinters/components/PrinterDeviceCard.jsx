import shared from "../../PageSettings.module.css";
import styles from "../SettingsPrinters.module.css";


const PrinterDeviceCard = ({
  printers = [],
  selectedPrinter = "",
  setSelectedPrinter,
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
  const isChannelError = friendlyError && friendlyError.includes("reinicie la aplicación");

  return (
    <article className={styles.card}>
      <h2 className={styles.cardTitle}>Impresora física del sistema</h2>
      <p className={styles.cardDescription}>
        Compatible con cualquier impresora térmica instalada en el equipo (Epson, Xprinter, EC-Line, Star, Bixolon, POS-58/80 por USB, red Ethernet o Bluetooth).
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
            onChange={(e) => setSelectedPrinter(e.target.value)}
            disabled={printersLoading}
          >
            <option value="">Usar impresora predeterminada</option>
            {printers.map((printer) => {
              const name = printer?.name || printer?.deviceName || "";
              const displayName = printer?.displayName || name;
              const isDefault = printer?.isDefault;
              return (
                <option key={name} value={name}>
                  {isDefault ? `[Predeterminada del sistema] ${displayName}` : displayName}
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
            
            {printersLoading ? "Actualizando..." : "Actualizar lista"}
          </button>
        </div>
      ) : (
        <p className={styles.description}>La detección de impresoras solo está disponible en la aplicación de escritorio.</p>
      )}

      {friendlyError ? (
        <div className={`${styles.infoBanner} ${isChannelError ? styles.infoBannerBlue : styles.errorMessage}`} role="alert">
          
          <span>{friendlyError}</span>
        </div>
      ) : null}
    </article>
  );
};

export default PrinterDeviceCard;
