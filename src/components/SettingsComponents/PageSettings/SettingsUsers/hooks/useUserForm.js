import { useMemo, useState } from "react";

export const USER_FORM_CREATE = "create";
export const USER_FORM_EDIT = "edit";

const USERNAME_PATTERN = /^[a-zA-Z0-9_.-]+$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const resolveRoleName = (roleName) => {
  const normalized = String(roleName || "")
    .trim()
    .toLowerCase();

  if (normalized === "admin" || normalized === "cajero") {
    return normalized;
  }

  return "cajero";
};

const buildInitialValues = (mode, user) => ({
  name: user?.name || user?.username || "",
  username: user?.username || "",
  email: user?.email || "",
  role: resolveRoleName(user?.roleName),
  password: "",
  confirmPassword: "",
});

export const validateUserForm = (values, mode) => {
  const errors = {};
  const name = String(values.name || "").trim();

  if (!name) {
    errors.name = "El nombre completo es obligatorio.";
  } else if (name.length < 2) {
    errors.name = "El nombre debe tener al menos 2 caracteres.";
  }

  if (!values.role) {
    errors.role = "Selecciona un rol.";
  }

  if (mode === USER_FORM_CREATE) {
    const username = String(values.username || "").trim();

    if (!username) {
      errors.username = "El nombre de usuario es obligatorio.";
    } else if (username.length < 3) {
      errors.username = "Debe tener al menos 3 caracteres.";
    } else if (!USERNAME_PATTERN.test(username)) {
      errors.username =
        "Solo puede contener letras, números, guiones y guiones bajos.";
    }

    const email = String(values.email || "").trim();

    if (!email) {
      errors.email = "El correo es obligatorio.";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "Ingresa un correo válido.";
    }

    if (!values.password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (values.password.length < 6) {
      errors.password = "Debe tener al menos 6 caracteres.";
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }
  } else {
    const password = String(values.password || "");

    if (password.length > 0) {
      if (password.length < 6) {
        errors.password = "Debe tener al menos 6 caracteres.";
      }

      if (password !== values.confirmPassword) {
        errors.confirmPassword = "Las contraseñas no coinciden.";
      }
    }
  }

  return errors;
};

/**
 * Estado y validación en vivo del formulario de usuario.
 *
 * No persiste nada: la vista del modal decide que hacer con `values` al
 * enviar. Se usa una `key` en el componente para reinitializar el formulario
 * cuando cambia el usuario objetivo.
 */
const useUserForm = ({ mode = USER_FORM_CREATE, user = null, onSubmit }) => {
  const [values, setValues] = useState(() => buildInitialValues(mode, user));
  const [touched, setTouched] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const errors = useMemo(() => validateUserForm(values, mode), [values, mode]);

  const handleChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const getFieldError = (field) => {
    if (!touched[field] && !submitAttempted) return "";

    return errors[field] || "";
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitAttempted(true);

    if (Object.keys(errors).length > 0) return;

    onSubmit(values);
  };

  return {
    errors,
    getFieldError,
    handleBlur,
    handleChange,
    handleSubmit,
    isEdit: mode === USER_FORM_EDIT,
    submitAttempted,
    values,
  };
};

export default useUserForm;
