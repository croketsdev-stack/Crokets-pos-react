import styles from "../SettingsPrinters.module.css";

const TicketContentCard = ({
  template = {},
  handleTemplateChange,
  handleToggleChange,
  handleResetTemplate,
  handleSaveTemplate,
  savingTemplate = false,
  templateFeedback,
}) => (
  <article className={styles.card}>
    <h2 className={styles.cardTitle}>Plantilla comercial del ticket</h2>
    <p className={styles.cardDescription}>
      Personaliza encabezado, pie de página y políticas. Se guarda por sucursal.
    </p>

    <div className={styles.formGrid}>
      <div>
        <label htmlFor="headerSlogan" className={styles.label}>
          Eslogan de cabecera
        </label>
        <input
          id="headerSlogan"
          type="text"
          className={styles.input}
          value={template.headerSlogan || ""}
          onChange={(e) => handleTemplateChange("headerSlogan", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="fiscalInfo" className={styles.label}>
          Información fiscal / RFC
        </label>
        <input
          id="fiscalInfo"
          type="text"
          className={styles.input}
          value={template.fiscalInfo || ""}
          onChange={(e) => handleTemplateChange("fiscalInfo", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="footerLine1" className={styles.label}>
          Línea 1 de agradecimiento
        </label>
        <input
          id="footerLine1"
          type="text"
          className={styles.input}
          value={template.footerLine1 || ""}
          onChange={(e) => handleTemplateChange("footerLine1", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="footerLine2" className={styles.label}>
          Línea 2 de promoción / citas
        </label>
        <input
          id="footerLine2"
          type="text"
          className={styles.input}
          value={template.footerLine2 || ""}
          onChange={(e) => handleTemplateChange("footerLine2", e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="footerPhone" className={styles.label}>
          Teléfono / WhatsApp de atención
        </label>
        <input
          id="footerPhone"
          type="text"
          className={styles.input}
          value={template.footerPhone || ""}
          onChange={(e) => handleTemplateChange("footerPhone", e.target.value)}
        />
      </div>
      <div className={styles.spanFull}>
        <label htmlFor="returnPolicy" className={styles.label}>
          Política de cambios y devoluciones
        </label>
        <textarea
          id="returnPolicy"
          className={styles.textarea}
          rows={4}
          value={template.returnPolicy || ""}
          onChange={(e) => handleTemplateChange("returnPolicy", e.target.value)}
        />
      </div>
    </div>

    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>Elementos a mostrar</legend>
      <div className={styles.checkboxGrid}>
        <label className={styles.checkboxCard}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={Boolean(template.showCustomerPoints)}
            onChange={(e) =>
              handleToggleChange("showCustomerPoints", e.target.checked)
            }
          />
          <span className={styles.checkboxLabel}>
            Mostrar puntos de cliente
          </span>
        </label>
        <label className={styles.checkboxCard}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={Boolean(template.showCashierName)}
            onChange={(e) =>
              handleToggleChange("showCashierName", e.target.checked)
            }
          />
          <span className={styles.checkboxLabel}>Mostrar nombre de cajero</span>
        </label>
        <label className={styles.checkboxCard}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={Boolean(template.showSaleNotes)}
            onChange={(e) =>
              handleToggleChange("showSaleNotes", e.target.checked)
            }
          />
          <span className={styles.checkboxLabel}>Mostrar notas de venta</span>
        </label>
        <label className={styles.checkboxCard}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={Boolean(template.showBranchAddress)}
            onChange={(e) =>
              handleToggleChange("showBranchAddress", e.target.checked)
            }
          />
          <span className={styles.checkboxLabel}>
            Mostrar dirección de sucursal
          </span>
        </label>
        <label className={styles.checkboxCard}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={Boolean(template.showBranchPhone)}
            onChange={(e) =>
              handleToggleChange("showBranchPhone", e.target.checked)
            }
          />
          <span className={styles.checkboxLabel}>
            Mostrar teléfono de sucursal
          </span>
        </label>
      </div>
    </fieldset>

    <div className={styles.buttonRow}>
      <button
        type="button"
        className={styles.buttonSecondary}
        onClick={handleResetTemplate}
      >
        Restablecer valores predeterminados
      </button>
      <button
        type="button"
        className={styles.buttonPrimary}
        onClick={handleSaveTemplate}
        disabled={savingTemplate}
      >
        {savingTemplate ? "Guardando..." : "Guardar plantilla de sucursal"}
      </button>
    </div>

    {templateFeedback?.type === "error" ? (
      <p role="alert" className={styles.errorMessage}>
        {templateFeedback.message}
      </p>
    ) : null}
    {templateFeedback?.type === "success" ? (
      <p role="status" className={styles.statusMessage}>
        {templateFeedback.message}
      </p>
    ) : null}
  </article>
);

export default TicketContentCard;
