import { useEffect } from "react";

import styles from "./SettingsUsers.module.css";
import useSettingsUsers from "./hooks/useSettingsUsers";
import KpiGrid from "./components/KpiGrid";
import SearchFilters from "./components/SearchFilters";
import UsersTable from "./components/UsersTable";
import UserFormModal from "./components/UserFormModal";
import UserStatusModal from "./components/UserStatusModal";
import circleCheckIcon from "../../../../assets/icons/circle-check-solid-full.svg";
import circleInfoIcon from "../../../../assets/icons/circle-info-solid-full.svg";

const FEEDBACK_TIMEOUT = 5000;

const SettingsUsers = () => {
  const {
    clearFeedback,
    closeFormModal,
    closeStatusModal,
    confirmStatus,
    currentUserId,
    error,
    feedback,
    filteredUsers,
    formModal,
    loading,
    metrics,
    openCreateModal,
    openEditModal,
    openStatusModal,
    reload,
    roleFilter,
    roleOptions,
    saving,
    searchTerm,
    setRoleFilter,
    setSearchTerm,
    setStatusFilter,
    statusFilter,
    statusModal,
    statusOptions,
    submitForm,
    users,
  } = useSettingsUsers();

  useEffect(() => {
    if (!feedback) return undefined;

    const timeout = window.setTimeout(clearFeedback, FEEDBACK_TIMEOUT);

    return () => window.clearTimeout(timeout);
  }, [feedback, clearFeedback]);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Usuarios y Permisos</h1>
        <p className={styles.pageSubtitle}>
          Administra las cuentas, los roles y el acceso al sistema.
        </p>
      </header>

      {feedback ? (
        <div
          className={[
            styles.feedback,
            feedback.type === "success"
              ? styles.feedbackSuccess
              : styles.feedbackError,
          ]
            .filter(Boolean)
            .join(" ")}
          role={feedback.type === "error" ? "alert" : "status"}
          aria-live={feedback.type === "error" ? "assertive" : "polite"}
        >
          <img
            src={feedback.type === "error" ? circleInfoIcon : circleCheckIcon}
            alt=""
            aria-hidden="true"
            className={styles.feedbackIcon}
          />
          <span>{feedback.message}</span>
        </div>
      ) : null}

      <KpiGrid metrics={metrics} />

      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        roleOptions={roleOptions}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onReload={reload}
        onNewUser={openCreateModal}
        loading={loading}
      />

      <UsersTable
        users={filteredUsers}
        totalCount={users.length}
        loading={loading}
        error={error}
        currentUserId={currentUserId}
        onEdit={openEditModal}
        onToggleStatus={openStatusModal}
      />

      <UserFormModal
        key={`user-form-${formModal.mode}-${
          formModal.user?.id || "new"
        }-${formModal.isOpen ? "open" : "closed"}`}
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        user={formModal.user}
        saving={saving}
        onSubmit={submitForm}
        onClose={closeFormModal}
      />

      <UserStatusModal
        isOpen={statusModal.isOpen}
        user={statusModal.user}
        saving={saving}
        onConfirm={confirmStatus}
        onClose={closeStatusModal}
      />
    </div>
  );
};

export default SettingsUsers;
