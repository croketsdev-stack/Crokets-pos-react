import { useEffect, useState } from "react";

import styles from "../SettingsUsers.module.css";
import useUserForm, { USER_FORM_EDIT } from "../hooks/useUserForm";
import { ROLE_FORM_OPTIONS } from "../hooks/useSettingsUsers";

const COPY_FEEDBACK_TIMEOUT = 1500;

const UserFormModal = ({ isOpen, mode, user, saving, onSubmit, onClose }) => {
  const isEdit = mode === USER_FORM_EDIT;

  const { values, getFieldError, handleBlur, handleChange, handleSubmit } =
    useUserForm({ mode, user, onSubmit });

  const [idCopied, setIdCopied] = useState(false);

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

  const handleCopyId = async () => {
    if (!user?.id) return;

    try {
      await navigator.clipboard.writeText(user.id);
      setIdCopied(true);
      window.setTimeout(() => setIdCopied(false), COPY_FEEDBACK_TIMEOUT);
    } catch (error) {
      console.error("No se pudo copiar el identificador del usuario:", error);
    }
  };

  const nameError = getFieldError("name");
  const usernameError = getFieldError("username");
  const emailError = getFieldError("email");
  const passwordError = getFieldError("password");
  const confirmPasswordError = getFieldError("confirmPassword");

  const passwordLabel = isEdit ? "Nueva contraseña" : "Contraseña inicial";
  const confirmPasswordLabel = isEdit
    ? "Confirmar nueva contraseña"
    : "Confirmar contraseña";
  const passwordPlaceholder = isEdit
    ? "Dejar en blanco para mantener la actual"
    : "";
  const passwordHint = isEdit
    ? "Opcional. Mínimo 6 caracteres si se define."
    : "Mínimo 6 caracteres.";

  return (
    <div className={styles.modalOverlay} onMouseDown={handleOverlayMouseDown}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-users-form-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="settings-users-form-title" className={styles.modalTitle}>
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <p className={styles.modalSubtitle}>
            {isEdit
              ? "Actualiza el nombre, el rol y, si lo necesitas, la contraseña."
              : "Crea una cuenta de acceso al sistema."}
          </p>
        </div>

        <form className={styles.modalBody} onSubmit={handleSubmit} noValidate>
          {isEdit ? (
            <dl className={styles.readonlyGrid}>
              <div className={styles.readonlyItem}>
                <dt className={styles.readonlyLabel}>Usuario</dt>
                <dd className={styles.readonlyValue}>
                  {values.username ? `@${values.username}` : "n/a"}
                </dd>
              </div>

              <div className={styles.readonlyItem}>
                <dt className={styles.readonlyLabel}>Correo electrónico</dt>
                <dd className={styles.readonlyValue}>
                  {values.email || "Sin correo"}
                </dd>
              </div>

              <div
                className={[styles.readonlyItem, styles.readonlyItemFull]
                  .filter(Boolean)
                  .join(" ")}
              >
                <dt className={styles.readonlyLabel}>Identificador</dt>
                <dd className={styles.readonlyValue}>
                  <code className={styles.readonlyCode}>
                    {user?.id || "n/a"}
                  </code>
                  <button
                    type="button"
                    className={styles.readonlyCopyButton}
                    onClick={handleCopyId}
                  >
                    {idCopied ? "Copiado" : "Copiar"}
                  </button>
                </dd>
              </div>
            </dl>
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

          {!isEdit ? (
            <>
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
                  onChange={(event) =>
                    handleChange("username", event.target.value)
                  }
                  onBlur={() => handleBlur("username")}
                  disabled={saving}
                  autoComplete="off"
                />
                {usernameError ? (
                  <span className={styles.fieldError}>{usernameError}</span>
                ) : (
                  <span className={styles.fieldHint}>
                    Solo letras, números, punto, guion y guion bajo. Sin
                    espacios.
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label
                  htmlFor="settings-users-email"
                  className={styles.formLabel}
                >
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
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  onBlur={() => handleBlur("email")}
                  disabled={saving}
                  autoComplete="off"
                />
                {emailError ? (
                  <span className={styles.fieldError}>{emailError}</span>
                ) : null}
              </div>
            </>
          ) : null}

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
              {ROLE_FORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="settings-users-password"
              className={styles.formLabel}
            >
              {passwordLabel}
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
              placeholder={passwordPlaceholder}
              onChange={(event) => handleChange("password", event.target.value)}
              onBlur={() => handleBlur("password")}
              disabled={saving}
              autoComplete="new-password"
            />
            {passwordError ? (
              <span className={styles.fieldError}>{passwordError}</span>
            ) : (
              <span className={styles.fieldHint}>{passwordHint}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label
              htmlFor="settings-users-confirm-password"
              className={styles.formLabel}
            >
              {confirmPasswordLabel}
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
              <span className={styles.fieldError}>{confirmPasswordError}</span>
            ) : null}
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
