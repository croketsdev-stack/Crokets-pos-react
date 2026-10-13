import { useMemo, useState } from "react";
import { buildTicketText } from "../../../../../utils/ticket/ticketBuilder";
import { buildCashCutText } from "../../../../../utils/cashCutBuilder";
import { wrapText, centerText } from "../../../../../utils/ticket/ticketLayoutFormatters";
import styles from "../SettingsPrinters.module.css";
import receiptIcon from "../../../../../assets/icons/receipt-solid-full.svg";

const TicketLivePreview = ({
  widthMm = 58,
  viewMode = "venta",
  setViewMode,
  template = {},
  branch = null,
  user = null,
}) => {
  const [copied, setCopied] = useState(false);
  const columns = widthMm === 80 ? 42 : 32;
  const widthClass = widthMm === 80 ? styles.preview80 : styles.preview58;

  const ticketText = useMemo(() => {
    if (viewMode === "corte") {
      const now = new Date();
      const openedAt = new Date(now.getTime() - 8 * 3600 * 1000);
      const cashCutData = {
        branchName: branch?.name || "SUCURSAL CANCÚN CENTRO",
        username: user?.username || user?.email || "GAEL",
        sessionId: "TURNO-01",
        openedAt,
        closedAt: now,
        cutCreatedAt: now,
        openingAmount: 500.0,
        ventasTotales: 770.0,
        ventasEfectivo: 420.0,
        ventasTerminal: 350.0,
        dineroCaja: 920.0,
        expectedAmount: 920.0,
        countedAmount: 920.0,
        difference: 0,
        ventasPorMetodo: [
          { method_name: "EFECTIVO", total: 420.0, count: 2 },
          { method_name: "TARJETA", total: 350.0, count: 1 },
        ],
      };
      return buildCashCutText(cashCutData);
    }

    const activeBranch = {
      name: branch?.name || "SUCURSAL CANCÚN CENTRO",
      address: template.showBranchAddress !== false ? (branch?.address || "Av. Tulum SM 20 MZ 1") : "",
      city: template.showBranchAddress !== false ? (branch?.city || "Cancún") : "",
      state: template.showBranchAddress !== false ? (branch?.state || "Q. Roo") : "",
      postal_code: template.showBranchAddress !== false ? (branch?.postal_code || "77500") : "",
      phone: template.showBranchPhone !== false ? (branch?.phone || "998 884 1234") : "",
    };

    const sampleSale = {
      folio: "V-08492",
      created_at: new Date(),
      subtotal: 420.0,
      tax: 0,
      discount_total: 0,
      total: 420.0,
      amount_received: 500.0,
      change_amount: 80.0,
      payment_method: "EFECTIVO",
      payments: [{ method_name: "EFECTIVO", amount: 500.0 }],
      status: "completed",
      cashier_name: template.showCashierName !== false ? (user?.username || user?.email || "GAEL") : "",
      customer_name: "PÚBLICO EN GENERAL",
      customer_points_balance: template.showCustomerPoints !== false ? 150 : null,
      points_earned: template.showCustomerPoints !== false ? 42 : 0,
      notes: template.showSaleNotes !== false ? "Entregar en mostrador" : "",
    };
    const sampleItems = [
      { product_name: "NUPEC ADULTO 2KG", quantity: 1, unit_price: 350.0, total_price: 350.0 },
      { product_name: "PREMIO DENTAL BONE", quantity: 1, unit_price: 70.0, total_price: 70.0 },
    ];
    const footer = {
      line1: template.footerLine1 || "Gracias por su compra",
      line2: template.footerLine2 || "",
      phone: template.footerPhone || "",
      returnPolicy: template.returnPolicy || "",
    };
    let text = buildTicketText({
      branch: activeBranch,
      sale: sampleSale,
      items: sampleItems,
      cashierName: template.showCashierName !== false ? (user?.username || user?.email || "GAEL") : "",
      footer,
      isReprint: false,
    });

    const headerLines = [];
    if (template.headerSlogan) {
      const slogan = String(template.headerSlogan).trim();
      if (slogan) {
        const wrappedSlogan = wrapText(slogan, columns);
        wrappedSlogan.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) headerLines.push(centerText(trimmed, columns));
        });
      }
    }
    if (template.fiscalInfo) {
      const fiscal = String(template.fiscalInfo).trim();
      if (fiscal) {
        const wrappedFiscal = wrapText(fiscal, columns);
        wrappedFiscal.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed) headerLines.push(centerText(trimmed, columns));
        });
      }
    }
    if (headerLines.length > 0) {
      const lines = text.split("\n");
      if (lines.length >= 2) {
        lines.splice(2, 0, ...headerLines);
        text = lines.join("\n");
      } else {
        text = headerLines.join("\n") + "\n" + text;
      }
    }
    return text;
  }, [branch, template, user, viewMode]);

  const handleViewVenta = () => {
    if (setViewMode) setViewMode("venta");
  };
  const handleViewCorte = () => {
    if (setViewMode) setViewMode("corte");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <aside className={styles.previewSticky}>
      <div className={styles.previewHeaderAlt}>
        <div className={styles.previewHeaderLeft}>
          <div className={styles.previewIconWrapper}>
            <img src={receiptIcon} alt="" className={styles.previewIcon} aria-hidden="true" />
          </div>
          <div>
            <h3 className={styles.previewTitleAlt}>Simulador Térmico en Vivo</h3>
            <p className={styles.previewSubtitle}>Previsualización a escala real según los parámetros de la sucursal</p>
          </div>
        </div>
        <span className={styles.widthBadge}>
          {widthMm} mm · {columns} columnas
        </span>
      </div>

      <div className={styles.segmentedControl}>
        <button
          type="button"
          className={viewMode === "venta" ? styles.segmentedButtonActive : styles.segmentedButton}
          onClick={handleViewVenta}
        >
          Ticket de Venta
        </button>
        <button
          type="button"
          className={viewMode === "corte" ? styles.segmentedButtonActive : styles.segmentedButton}
          onClick={handleViewCorte}
        >
          Corte de Caja
        </button>
      </div>

      <div className={`${styles.previewBox} ${widthClass}`}>
        <pre className={styles.ticketPre}>{ticketText}</pre>
      </div>
      <div className={styles.previewMetaRow}>
        <span>Ancho: {widthMm} mm · {columns} columnas aprox.</span>
        <button type="button" className={styles.buttonSecondarySmall} onClick={handleCopy}>
          {copied ? "¡Copiado!" : "Copiar texto"}
        </button>
      </div>
    </aside>
  );
};

export default TicketLivePreview;
