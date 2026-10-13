import { useEffect } from "react";

import styles from "./SettingsUsers.module.css";
import PaginationBar from "../../../PaginationBar/PaginationBar";
import { usePagination } from "../../../../hooks/usePagination";
import useSettingsUsers from "./hooks/useSettingsUsers";
import KpiGrid from "./components/KpiGrid";
import SearchFilters from "./components/SearchFilters";
import UsersTable from "./components/UsersTable";
import UserFormModal from "./components/UserFormModal";
import UserStatusModal from "./components/UserStatusModal";
import circleCheckIcon from "../../../../assets/icons/circle-check-solid-full.svg";
import circleInfoIcon from "../../../../assets/icons/circle-info-solid-full.svg";

const FEEDBACK_TIMEOUT = 5000;
const PAGE_SIZE_OPTIONS = [10, 25, 50];
const PAGE_SIZE_STORAGE_KEY = "settings:users:pageSize";

const SettingsUsers = () => {
  const {
    clearFilters,
    clearFeedback,
    closeFormModal,
    closeStatusModal,
    confirmStatus,
    currentUserId,
    error,
    feedback,
    filteredUsers,
    formModal,
    hasActiveFilters,
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

  const {
    currentPage,
    totalPages,
    pageSize,
    startIndex,
    endIndex,
    pageItems,
    resetPagination,
    handlePageChange,
    handlePageSizeChange,
  } = usePagination({
    totalItems: filteredUsers.length,
    defaultPageSize: PAGE_SIZE_OPTIONS[0],
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    storageKey: PAGE_SIZE_STORAGE_KEY,
  });

  useEffect(() => {
    if (!feedback) return undefined;

    const timeout = window.setTimeout(clearFeedback, FEEDBACK_TIMEOUT);

    return () => window.clearTimeout(timeout);
  }, [feedback, clearFeedback]);

  useEffect(() => {
    resetPagination();
  }, [searchTerm, roleFilter, statusFilter, resetPagination]);

  const paginatedUsers = pageItems(filteredUsers);

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
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onReload={reload}
        onNewUser={openCreateModal}
        loading={loading}
      />

      <UsersTable
        users={paginatedUsers}
        totalCount={users.length}
        loading={loading}
        error={error}
        currentUserId={currentUserId}
        hasActiveFilters={hasActiveFilters}
        onEdit={openEditModal}
        onToggleStatus={openStatusModal}
        onClearFilters={clearFilters}
        footer={
          filteredUsers.length > 0 ? (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              totalItems={filteredUsers.length}
              startIndex={startIndex}
              endIndex={endIndex}
              itemsNoun="usuarios"
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          ) : null
        }
      />

      <UserFormModal
        key={`user-form-${formModal.mode}-${
          formModal.user?.id || "new"
        }-${formModal.isOpen ? "open" : "closed"}`}
        isOpen={formModal.isOpen}
        mode={formModal.mode}
        user={formModal.user}
        saving={saving}
        isCurrentUser={
          formModal.mode === "edit" && formModal.user?.id === currentUserId
        }
        existingUsers={users}
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
