import styles from "../SettingsPrinters.module.css";
import printIcon from "../../../../../assets/icons/print-solid-full.svg";
import moneyIcon from "../../../../../assets/icons/money-bill-wave-solid-full.svg";

const TicketDiagnosticCard = ({
  widthMm = 58,
  printing = false,
  handleTestPrint,
  printFeedback,
  drawerFeedback,
  handleOpenDrawer,
  isElectron = false,
}) => (
  <article className={styles.card}>
    <h2 className={styles.cardTitle}>Diagnóstico de hardware</h2>

    <div className={styles.diagnosticBlock}>
      <div className={styles.diagnosticHeader}>
        <img
          src={printIcon}
          alt=""
          className={styles.diagnosticIcon}
          aria-hidden="true"
        />
        <div>
          <h3 className={styles.diagnosticTitle}>
            Prueba de Impresión Térmica
          </h3>
          <p className={styles.diagnosticDesc}>
            Envía un ticket completo a la impresora configurada con el ancho
            seleccionado ({widthMm} mm). Permite verificar la nitidez del
            cabezal térmico, la alineación de columnas y el corte de papel.
          </p>
        </div>
      </div>
      <button
        type="button"
        className={styles.buttonPrimary}
        onClick={handleTestPrint}
        disabled={printing}
      >
        {printing ? "Imprimiendo..." : "Imprimir ticket de prueba"}
      </button>
      {printFeedback?.type === "error" ? (
        <p role="alert" className={styles.errorMessage}>
          {printFeedback.message}
        </p>
      ) : null}
      {printFeedback?.type === "success" ? (
        <p role="status" className={styles.statusMessage}>
          {printFeedback.message}
        </p>
      ) : null}
    </div>

    <div className={styles.diagnosticDivider} />

    <div className={styles.diagnosticBlock}>
      <div className={styles.diagnosticHeader}>
        <img
          src={moneyIcon}
          alt=""
          className={styles.diagnosticIcon}
          aria-hidden="true"
        />
        <div>
          <h3 className={styles.diagnosticTitle}>
            Apertura de Cajón Registrador (Drawer Kick)
          </h3>
          <p className={styles.diagnosticDesc}>
            Envía el pulso eléctrico a través del puerto RJ11 de la impresora
            térmica para abrir la gaveta de efectivo. Permite validar la
            conexión del cable RJ11 para el cobro en efectivo.
          </p>
        </div>
      </div>
      <button
        type="button"
        className={styles.buttonSecondary}
        onClick={handleOpenDrawer}
        disabled={!isElectron}
      >
        Probar apertura del cajón
      </button>
      {drawerFeedback?.type === "error" ? (
        <p role="alert" className={styles.errorMessage}>
          {drawerFeedback.message}
        </p>
      ) : null}
      {drawerFeedback?.type === "success" ? (
        <p role="status" className={styles.statusMessage}>
          {drawerFeedback.message}
        </p>
      ) : null}
    </div>
  </article>
);

export default TicketDiagnosticCard;
