import { useEffect } from "react";

import styles from "../SettingsUsers.module.css";
import xmarkIcon from "../../../../../assets/icons/xmark-solid-full.svg";
import lockIcon from "../../../../../assets/icons/lock-solid-full.svg";
import circleCheckIcon from "../../../../../assets/icons/circle-check-solid-full.svg";
import { getUserDisplayName, getUserInitials } from "../utils/usersFormatters";

const UserStatusModal = ({ isOpen, user, saving, onConfirm, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, saving, onClose]);

  if (!isOpen || !user) return null;

  const isActive = user.status === true;
  const actionLabel = isActive ? "Desactivar" : "Activar";
  const displayName = getUserDisplayName(user);

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget && !saving) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onMouseDown={handleOverlayMouseDown}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-users-status-title"
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 id="settings-users-status-title" className={styles.modalTitle}>
              {actionLabel} usuario
            </h2>
            <p className={styles.modalSubtitle}>
              Confirma el cambio de estado de esta cuenta.
            </p>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            disabled={saving}
            aria-label="Cerrar"
          >
            <img
              src={xmarkIcon}
              alt=""
              aria-hidden="true"
              className={styles.actionIcon}
            />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.statusSummary}>
            <span className={styles.avatar} aria-hidden="true">
              {getUserInitials(user.name, user.username)}
            </span>
            <div className={styles.statusUser}>
              <span className={styles.statusUserText}>{displayName}</span>
              <span className={styles.userHandle}>
                @{user.username || "n/a"}
              </span>
            </div>
          </div>

          <div
            className={[
              styles.notice,
              isActive ? styles.noticeDanger : styles.noticeInfo,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <img
              src={isActive ? lockIcon : circleCheckIcon}
              alt=""
              aria-hidden="true"
              className={styles.noticeIcon}
            />
            <span>
              {isActive
                ? "Al desactivar la cuenta, el usuario no podrá iniciar sesión hasta que sea reactivada."
                : "Al activar la cuenta, el usuario podrá iniciar sesión con sus credenciales actuales."}
            </span>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? "Guardando..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStatusModal;
