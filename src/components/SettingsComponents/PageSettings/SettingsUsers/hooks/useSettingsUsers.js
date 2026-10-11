import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../../../contexts/AuthContext";
import { useRequestStatus } from "../../../../../hooks/useRequestStatus";
import {
  calculateUserMetrics,
  filterUsers,
} from "../services/usersCalculationService";
import {
  createUser,
  fetchRoles,
  fetchUsers,
  updateUser,
  updateUserStatus,
} from "../services/usersDataService";

const SETTINGS_USERS_REQUEST = "settings:users";

export const ROLE_OPTIONS = [
  { value: "all", label: "Todos los roles" },
  { value: "admin", label: "Administradores" },
  { value: "cajero", label: "Cajeros" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

const buildRoleMap = (roles) => {
  const map = {};

  for (const role of Array.isArray(roles) ? roles : []) {
    if (role?.name) {
      map[role.name] = role.id;
    }
  }

  return map;
};

/**
 * Estado y ciclo de vida de "Usuarios y Permisos".
 *
 * Concentra la carga de usuarios y roles, los filtros derivados, las metricas
 * y las escrituras (edicion, cambio de estado y alta), de modo que la vista
 * quede como orquestacion pura de componentes.
 */
const useSettingsUsers = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reloadCount, setReloadCount] = useState(0);

  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    user: null,
  });
  const [statusModal, setStatusModal] = useState({ isOpen: false, user: null });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const requestKey = `${SETTINGS_USERS_REQUEST}|${reloadCount}`;
  const {
    isLoading: loading,
    isStale,
    markSettled,
  } = useRequestStatus(requestKey);
  const visibleError = isStale ? "" : error;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [usersResult, rolesResult] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
      ]);

      if (cancelled) return;

      if (usersResult.success) {
        setUsers(usersResult.data);
        setError("");
      } else {
        setUsers([]);
        setError(usersResult.error || "No se pudieron cargar los usuarios.");
      }

      if (rolesResult.success) {
        setRoles(rolesResult.data);
      }

      markSettled();
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [requestKey, markSettled]);

  const filteredUsers = useMemo(
    () => filterUsers(users, { searchTerm, roleFilter, statusFilter }),
    [users, searchTerm, roleFilter, statusFilter]
  );

  const metrics = useMemo(() => calculateUserMetrics(users), [users]);

  const roleMap = useMemo(() => buildRoleMap(roles), [roles]);

  const reload = useCallback(() => {
    setReloadCount((count) => count + 1);
  }, []);

  const openCreateModal = useCallback(() => {
    setFeedback(null);
    setFormModal({ isOpen: true, mode: "create", user: null });
  }, []);

  const openEditModal = useCallback((user) => {
    setFeedback(null);
    setFormModal({ isOpen: true, mode: "edit", user });
  }, []);

  const closeFormModal = useCallback(() => {
    setFormModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openStatusModal = useCallback((user) => {
    setFeedback(null);
    setStatusModal({ isOpen: true, user });
  }, []);

  const closeStatusModal = useCallback(() => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const clearFeedback = useCallback(() => setFeedback(null), []);

  const submitForm = useCallback(
    async (form) => {
      if (!formModal.isOpen || saving) return;

      setSaving(true);
      setFeedback(null);

      const roleId = roleMap[form.role] || null;

      if (!roleId) {
        setSaving(false);
        setFeedback({
          type: "error",
          message: "No se pudo resolver el rol seleccionado.",
        });
        return;
      }

      const result =
        formModal.mode === "edit"
          ? await updateUser({
              id: formModal.user?.id,
              name: form.name,
              roleId,
            })
          : await createUser({
              name: form.name,
              username: form.username,
              email: form.email,
              roleId,
              password: form.password,
            });

      setSaving(false);

      if (!result.success) {
        setFeedback({ type: "error", message: result.error });
        return;
      }

      let message = "Usuario actualizado.";

      if (formModal.mode === "create") {
        message = result.requiresConfirmation
          ? "Usuario creado. Debe confirmar su correo antes de iniciar sesión."
          : "Usuario creado. Ya puede iniciar sesión con sus credenciales iniciales.";
      }

      setFormModal((prev) => ({ ...prev, isOpen: false }));
      setFeedback({ type: "success", message });
      setReloadCount((count) => count + 1);
    },
    [formModal, roleMap, saving]
  );

  const confirmStatus = useCallback(async () => {
    const target = statusModal.user;

    if (!target || saving) return;

    const nextStatus = target.status !== true;

    setSaving(true);
    setFeedback(null);

    const result = await updateUserStatus({
      id: target.id,
      status: nextStatus,
    });

    setSaving(false);

    if (!result.success) {
      setFeedback({ type: "error", message: result.error });
      return;
    }

    setStatusModal({ isOpen: false, user: null });
    setFeedback({
      type: "success",
      message: nextStatus
        ? "Usuario reactivado. Ya puede iniciar sesión."
        : "Usuario desactivado. No podrá iniciar sesión.",
    });
    setReloadCount((count) => count + 1);
  }, [statusModal.user, saving]);

  const currentUserId = currentUser?.id || null;

  return {
    closeFormModal,
    closeStatusModal,
    confirmStatus,
    currentUserId,
    error: visibleError,
    feedback,
    filteredUsers,
    formModal,
    loading,
    metrics,
    openCreateModal,
    openEditModal,
    openStatusModal,
    roleFilter,
    roleOptions: ROLE_OPTIONS,
    saving,
    searchTerm,
    setRoleFilter,
    setSearchTerm,
    setStatusFilter,
    statusFilter,
    statusModal,
    statusOptions: STATUS_OPTIONS,
    submitForm,
    users,
    clearFeedback,
    reload,
  };
};

export default useSettingsUsers;
