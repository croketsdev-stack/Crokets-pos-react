import { useMemo, useState } from "react";
import xmarkIcon from "../../../../../assets/icons/xmark-solid-full.svg";
import styles from "../SettingsTerminal.module.css";

export const BRANCH_TIMEZONE_OPTIONS = [
  {
    value: "America/Cancun",
    label: "America/Cancun (Quintana Roo / Sureste - UTC-5)",
  },
  {
    value: "America/Mexico_City",
    label: "America/Mexico_City (Zona Centro / CDMX - UTC-6)",
  },
  {
    value: "America/Tijuana",
    label: "America/Tijuana (Zona Noroeste / Baja California)",
  },
  {
    value: "America/Hermosillo",
    label: "America/Hermosillo (Zona Pacífico / Sonora)",
  },
];

export const DEFAULT_TIMEZONE = "America/Cancun";

const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const buildBranchForm = (branchProfile, branch) => ({
  name: branchProfile?.name || branch?.name || "",
  city: branchProfile?.city || "",
  phone: branchProfile?.phone || "",
  email: branchProfile?.email || "",
  address: branchProfile?.address || "",
  timezone: branchProfile?.timezone || DEFAULT_TIMEZONE,
});

export const validateBranchForm = (form) => {
  const errors = {};

  const name = (form.name || "").trim();
  if (name.length < 3 || name.length > 100) {
    errors.name = "El nombre debe tener entre 3 y 100 caracteres.";
  }

  const city = (form.city || "").trim();
  if (city.length < 2 || city.length > 50) {
    errors.city = "La ciudad debe tener entre 2 y 50 caracteres.";
  }

  const phone = (form.phone || "").trim();
  if (!phone) {
    errors.phone = "El teléfono comercial es obligatorio.";
  } else if (!PHONE_REGEX.test(phone)) {
    errors.phone =
      "El teléfono debe contener exactamente 10 dígitos numéricos.";
  }

  const email = (form.email || "").trim();
  if (!email) {
    errors.email = "El correo de contacto es obligatorio.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "El correo no tiene un formato válido.";
  }

  const address = (form.address || "").trim();
  if (address.length < 10 || address.length > 250) {
    errors.address = "La dirección debe tener entre 10 y 250 caracteres.";
  }

  if (!form.timezone) {
    errors.timezone = "Selecciona una zona horaria.";
  }

  return errors;
};

const BranchEditModal = ({
  isOpen,
  branchProfile,
  branch,
  onClose,
  onSave,
  saving,
}) => {
  const [formData, setFormData] = useState(() =>
    buildBranchForm(branchProfile, branch)
  );
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setFormData(buildBranchForm(branchProfile, branch));
    }
  }

  const errors = useMemo(() => validateBranchForm(formData), [formData]);
  const hasErrors = Object.keys(errors).length > 0;

  const handleChange = (field) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (hasErrors) return;
    onSave({
      name: formData.name.trim(),
      city: formData.city.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      timezone: formData.timezone,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="branch-edit-modal-title"
    >
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h3 id="branch-edit-modal-title" className={styles.modalTitle}>
            Editar datos de la sucursal
          </h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <img src={xmarkIcon} alt="" aria-hidden="true" />
          </button>
        </header>
        <form onSubmit={handleSubmit} className={styles.modalBody} noValidate>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="branch-name" className={styles.formLabel}>
                Nombre de sucursal{" "}
                <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="branch-name"
                type="text"
                className={styles.input}
                value={formData.name}
                onChange={handleChange("name")}
                placeholder="Ej. Sucursal Torres"
                maxLength={100}
              />
              {errors.name && (
                <p role="alert" className={styles.fieldError}>
                  {errors.name}
                </p>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="branch-city" className={styles.formLabel}>
                Ciudad <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="branch-city"
                type="text"
                className={styles.input}
                value={formData.city}
                onChange={handleChange("city")}
                placeholder="Ej. Cancún"
                maxLength={50}
              />
              {errors.city && (
                <p role="alert" className={styles.fieldError}>
                  {errors.city}
                </p>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="branch-phone" className={styles.formLabel}>
                Teléfono comercial{" "}
                <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="branch-phone"
                type="tel"
                inputMode="numeric"
                className={styles.input}
                value={formData.phone}
                onChange={handleChange("phone")}
                placeholder="Ej. 9999999999"
                maxLength={10}
              />
              {errors.phone && (
                <p role="alert" className={styles.fieldError}>
                  {errors.phone}
                </p>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="branch-email" className={styles.formLabel}>
                Correo de contacto{" "}
                <span className={styles.requiredMark}>*</span>
              </label>
              <input
                id="branch-email"
                type="email"
                className={styles.input}
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="contacto@sucursal.com"
              />
              {errors.email && (
                <p role="alert" className={styles.fieldError}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className={`${styles.formField} ${styles.formFieldFull}`}>
              <label htmlFor="branch-address" className={styles.formLabel}>
                Dirección comercial{" "}
                <span className={styles.requiredMark}>*</span>
              </label>
              <textarea
                id="branch-address"
                className={styles.textarea}
                value={formData.address}
                onChange={handleChange("address")}
                placeholder="Dirección completa de la sucursal"
                rows={3}
                maxLength={250}
              />
              {errors.address && (
                <p role="alert" className={styles.fieldError}>
                  {errors.address}
                </p>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="branch-timezone" className={styles.formLabel}>
                Zona horaria <span className={styles.requiredMark}>*</span>
              </label>
              <select
                id="branch-timezone"
                className={styles.select}
                value={formData.timezone}
                onChange={handleChange("timezone")}
              >
                {BRANCH_TIMEZONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.timezone && (
                <p role="alert" className={styles.fieldError}>
                  {errors.timezone}
                </p>
              )}
            </div>

            <div className={styles.formField}>
              <label htmlFor="branch-code" className={styles.formLabel}>
                Código oficial
              </label>
              <input
                id="branch-code"
                type="text"
                className={styles.inputDisabled}
                value={branchProfile?.code || branch?.code || ""}
                disabled
                readOnly
              />
              <p className={styles.fieldHint}>
                El código oficial no es editable para preservar folios y series
                fiscales.
              </p>
            </div>
          </div>

          <footer className={styles.modalFooter}>
            <button
              type="button"
              className={styles.buttonSecondary}
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.button}
              disabled={saving || hasErrors}
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default BranchEditModal;
