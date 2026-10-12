import styles from "../SettingsUsers.module.css";
import userIcon from "../../../../../assets/icons/user-solid.svg";
import UsersTableRow from "./UsersTableRow";

const UsersTable = ({
  users,
  totalCount,
  loading,
  error,
  currentUserId,
  onEdit,
  onToggleStatus,
  footer,
}) => {
  if (loading) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.stateMessage} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden="true"></div>
          <p className={styles.emptyText}>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.errorBanner} role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    const hasAnyUser = (totalCount ?? 0) > 0;

    return (
      <div className={styles.tableCard}>
        <div className={styles.stateMessage}>
          <img
            src={userIcon}
            alt=""
            aria-hidden="true"
            className={styles.emptyIcon}
          />
          <h2 className={styles.emptyTitle}>
            {hasAnyUser ? "Sin resultados" : "Aún no hay usuarios"}
          </h2>
          <p className={styles.emptyText}>
            {hasAnyUser
              ? "No hay usuarios que coincidan con la búsqueda o los filtros aplicados."
              : "Crea el primer usuario para comenzar a administrar accesos."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.userTable}>
          <caption className={styles.tableCaption}>
            Listado de usuarios con su rol, estado y acciones disponibles
          </caption>
          <thead className={styles.tableHead}>
            <tr>
              <th scope="col" className={styles.headerCell}>
                Usuario
              </th>
              <th scope="col" className={styles.headerCell}>
                Rol
              </th>
              <th scope="col" className={styles.headerCell}>
                Estado
              </th>
              <th scope="col" className={styles.headerCell}>
                Registro
              </th>
              <th
                scope="col"
                className={`${styles.headerCell} ${styles.actionsHeader}`}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UsersTableRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  );
};

export default UsersTable;
