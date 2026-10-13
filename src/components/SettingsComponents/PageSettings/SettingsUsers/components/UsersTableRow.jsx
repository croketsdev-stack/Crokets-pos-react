import styles from "../SettingsUsers.module.css";
import pencilIcon from "../../../../../assets/icons/pencil-solid-full.svg";
import lockIcon from "../../../../../assets/icons/lock-solid-full.svg";
import circleCheckIcon from "../../../../../assets/icons/circle-check-solid-full.svg";
import {
  buildUserSecondaryLine,
  formatUserDate,
  getRoleBadgeClass,
  getRoleLabel,
  getStatusBadgeClass,
  getStatusLabel,
  getUserDisplayName,
  getUserInitials,
  toUpperText,
} from "../utils/usersFormatters";

const joinClassNames = (...names) => names.filter(Boolean).join(" ");

const UsersTableRow = ({ user, currentUserId, onEdit, onToggleStatus }) => {
  const isActive = user.status === true;
  const isCurrentUser = user.id === currentUserId;
  const displayName = getUserDisplayName(user);
  const visualName = toUpperText(displayName);

  return (
    <tr className={styles.tableRow}>
      <td className={styles.cell}>
        <div className={styles.userInfo}>
          <span className={styles.avatar} aria-hidden="true">
            {getUserInitials(user.name, user.username)}
          </span>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{visualName}</span>
            <span className={styles.userSecondary}>
              {buildUserSecondaryLine(user)}
            </span>
          </div>
        </div>
      </td>

      <td className={styles.cell}>
        <span
          className={joinClassNames(
            styles.roleBadge,
            getRoleBadgeClass(user.roleName, styles)
          )}
        >
          {getRoleLabel(user.roleName)}
        </span>
      </td>

      <td className={styles.cell}>
        <span
          className={joinClassNames(
            styles.statusBadge,
            getStatusBadgeClass(user.status, styles)
          )}
        >
          {getStatusLabel(user.status)}
        </span>
      </td>

      <td className={styles.cell}>
        <span className={styles.dateCell}>
          {formatUserDate(user.createdAt)}
        </span>
      </td>

      <td className={styles.actionsCell}>
        <div className={styles.actionsGroup}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onEdit(user)}
            aria-label={`Editar a ${displayName}`}
          >
            <img
              src={pencilIcon}
              alt=""
              aria-hidden="true"
              className={styles.actionIcon}
            />
          </button>

          <button
            type="button"
            className={styles.iconButton}
            onClick={() => onToggleStatus(user)}
            disabled={isCurrentUser}
            aria-label={
              isActive
                ? `Desactivar a ${displayName}`
                : `Activar a ${displayName}`
            }
            title={
              isCurrentUser
                ? "No puedes cambiar tu propio estado"
                : isActive
                  ? "Desactivar usuario"
                  : "Activar usuario"
            }
          >
            <img
              src={isActive ? lockIcon : circleCheckIcon}
              alt=""
              aria-hidden="true"
              className={joinClassNames(
                styles.actionIcon,
                isActive ? styles.actionIconDanger : ""
              )}
            />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UsersTableRow;
