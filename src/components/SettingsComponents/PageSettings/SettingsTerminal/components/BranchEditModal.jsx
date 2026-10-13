import { useEffect, useState } from "react";
import styles from "../SettingsTerminal.module.css";

const BranchEditModal = ({ isOpen, branchProfile, onClose, onSave, saving }) => {
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    if (isOpen && branchProfile) {
      setFormData({
        phone: branchProfile.phone || "",
        email: branchProfile.email || "",
        address: branchProfile.address || "",
      });
    }
  }, [isOpen, branchProfile]);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="branch-edit-modal-title">
      <div className={styles.modal}>
        <header className={styles.modalHeader}>
          <h3 id="branch-edit-modal-title" className={styles.modalTitle}>
            Editar datos de contacto
          </h3>
          <button type="button" className={styles.buttonGhost} onClick={onClose} aria-label="Cerrar modal">
            Cerrar
          </button>
        </header>
        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label htmlFor="phone" className={styles.formLabel}>
                Teléfono comercial
              </label>
              <input
                id="phone"
                type="tel"
                className={styles.input}
                value={formData.phone}
                onChange={handleChange("phone")}
                placeholder="Ej. 999 999 9999"
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="email" className={styles.formLabel}>
                Correo de contacto
              </label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="contacto@sucursal.com"
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="address" className={styles.formLabel}>
                Dirección comercial
              </label>
              <textarea
                id="address"
                className={styles.textarea}
                value={formData.address}
                onChange={handleChange("address")}
                placeholder="Dirección completa de la sucursal"
                rows={3}
              />
            </div>
          </div>
          <footer className={styles.modalFooter}>
            <button type="button" className={styles.buttonSecondary} onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className={styles.button} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default BranchEditModal;
