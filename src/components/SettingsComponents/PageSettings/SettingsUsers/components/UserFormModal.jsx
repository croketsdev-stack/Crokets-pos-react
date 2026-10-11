import { useEffect } from "react";

import styles from "../SettingsUsers.module.css";
import xmarkIcon from "../../../../../assets/icons/xmark-solid-full.svg";
import circleInfoIcon from "../../../../../assets/icons/circle-info-solid-full.svg";
import useUserForm, { USER_FORM_EDIT } from "../hooks/useUserForm";
import { ROLE_OPTIONS } from "../hooks/useSettingsUsers";

const UserFormModal = ({ isOpen, mode, user, saving, onSubmit, onClose }) => {
  const isEdit = mode === USER_FORM_EDIT;

  const { values, getFieldError, handleBlur, handleChange, handleSubmit } =
    useUserForm({ mode, user, onSubmit });

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

  if (!isOpen) return null;

  const handleOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget && !saving) {
      onClose();
    }
  };

  const nameError = getFieldError("name");
  const usernameError = getFieldError("username");
  const emailError = getFieldError("email");
  const passwordError = getFieldError("password");
  const confirmPasswordError = getFieldError("confirmPassword");

  return (
    <div className={styles.modalOverlay} onMouseDown={handleOverlayMouseDown}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-users-form-title"
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 id="settings-users-form-title" className={styles.modalTitle}>
              {isEdit ? "Editar usuario" : "Nuevo usuario"}
            </h2>
            <p className={styles.modalSubtitle}>
              {isEdit
                ? "Actualiza el nombre y el rol de la cuenta."
                : "Crea una cuenta de acceso al sistema."}
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

        <form className={styles.modalBody} onSubmit={handleSubmit} noValidate>
          {isEdit ? (
            <div
              className={[styles.notice, styles.noticeInfo]
                .filter(Boolean)
                .join(" ")}
            >
              <img
                src={circleInfoIcon}
                alt=""
                aria-hidden="true"
                className={styles.noticeIcon}
              />
              <span>
                El nombre de usuario y el correo no se pueden modificar. La
                contrasena se gestiona desde la cuenta del usuario.
              </span>
            </div>
          ) : null}

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="settings-users-name">
              Nombre completo
            </label>
            <input
              id="settings-users-name"
              type="text"
              className={[
                styles.formInput,
                nameError ? styles.fieldInvalid : "",
              ]
                .filter(Boolean)
                .join(" ")}
              value={values.name}
              onChange={(event) => handleChange("name", event.target.value)}
              onBlur={() => handleBlur("name")}
              disabled={saving}
              aria-invalid={nameError ? "true" : undefined}
              aria-describedby={
                nameError ? "settings-users-name-error" : undefined
              }
            />
            {nameError ? (
              <span
                id="settings-users-name-error"
                className={styles.fieldError}
              >
                {nameError}
              </span>
            ) : null}
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="settings-users-username"
              className={styles.formLabel}
            >
              Usuario
            </label>
            <input
              id="settings-users-username"
              type="text"
              className={[
                styles.formInput,
                usernameError ? styles.fieldInvalid : "",
              ]
                .filter(Boolean)
                .join(" ")}
              value={values.username}
              onChange={(event) => handleChange("username", event.target.value)}
              onBlur={() => handleBlur("username")}
              disabled={isEdit || saving}
              autoComplete="off"
            />
            {usernameError ? (
              <span className={styles.fieldError}>{usernameError}</span>
            ) : (
              !isEdit && (
                <span className={styles.fieldHint}>
                  Solo letras, números, punto, guion y guion bajo. Sin espacios.
                </span>
              )
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="settings-users-email" className={styles.formLabel}>
              Correo electrónico
            </label>
            <input
              id="settings-users-email"
              type="email"
              className={[
                styles.formInput,
                emailError ? styles.fieldInvalid : "",
              ]
                .filter(Boolean)
                .join(" ")}
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              onBlur={() => handleBlur("email")}
              disabled={isEdit || saving}
              autoComplete="off"
            />
            {emailError ? (
              <span className={styles.fieldError}>{emailError}</span>
            ) : null}
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="settings-users-form-role"
              className={styles.formLabel}
            >
              Rol
            </label>
            <select
              id="settings-users-form-role"
              className={styles.formSelect}
              value={values.role}
              onChange={(event) => handleChange("role", event.target.value)}
              disabled={saving}
            >
              {ROLE_OPTIONS.filter((option) => option.value !== "all").map(
                (option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          {!isEdit ? (
            <>
              <div className={styles.formGroup}>
                <label
                  htmlFor="settings-users-password"
                  className={styles.formLabel}
                >
                  Contraseña inicial
                </label>
                <input
                  id="settings-users-password"
                  type="password"
                  className={[
                    styles.formInput,
                    passwordError ? styles.fieldInvalid : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  value={values.password}
                  onChange={(event) =>
                    handleChange("password", event.target.value)
                  }
                  onBlur={() => handleBlur("password")}
                  disabled={saving}
                  autoComplete="new-password"
                />
                {passwordError ? (
                  <span className={styles.fieldError}>{passwordError}</span>
                ) : (
                  <span className={styles.fieldHint}>Minimo 6 caracteres.</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label
                  htmlFor="settings-users-confirm-password"
                  className={styles.formLabel}
                >
                  Confirmar contraseña
                </label>
                <input
                  id="settings-users-confirm-password"
                  type="password"
                  className={[
                    styles.formInput,
                    confirmPasswordError ? styles.fieldInvalid : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  value={values.confirmPassword}
                  onChange={(event) =>
                    handleChange("confirmPassword", event.target.value)
                  }
                  onBlur={() => handleBlur("confirmPassword")}
                  disabled={saving}
                  autoComplete="off"
                />
                {confirmPasswordError ? (
                  <span className={styles.fieldError}>
                    {confirmPasswordError}
                  </span>
                ) : null}
              </div>
            </>
          ) : null}

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
              type="submit"
              className={styles.primaryButton}
              disabled={saving}
            >
              {saving
                ? "Guardando..."
                : isEdit
                  ? "Guardar cambios"
                  : "Crear usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
