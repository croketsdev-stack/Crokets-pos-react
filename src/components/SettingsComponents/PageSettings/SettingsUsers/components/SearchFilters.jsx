import styles from "../SettingsUsers.module.css";
import searchIcon from "../../../../../assets/icons/searchIcon.svg";
import rotateIcon from "../../../../../assets/icons/rotate-solid-full.svg";
import plusIcon from "../../../../../assets/icons/plus-solid-full.svg";

const SearchFilters = ({
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  roleOptions,
  statusFilter,
  onStatusFilterChange,
  statusOptions,
  onReload,
  onNewUser,
  loading,
}) => (
  <div className={styles.filtersBar}>
    <div className={styles.searchField}>
      <img
        src={searchIcon}
        alt=""
        aria-hidden="true"
        className={styles.searchIcon}
      />
      <label htmlFor="settings-users-search" className={styles.visuallyHidden}>
        Buscar usuario
      </label>
      <input
        id="settings-users-search"
        type="search"
        className={styles.searchInput}
        placeholder="Buscar por nombre, @usuario o correo"
        value={searchTerm}
        onChange={(event) => onSearchChange(event.target.value)}
      />
    </div>

    <div className={styles.filterGroup}>
      <label htmlFor="settings-users-role" className={styles.visuallyHidden}>
        Filtrar por rol
      </label>
      <select
        id="settings-users-role"
        className={styles.select}
        value={roleFilter}
        onChange={(event) => onRoleFilterChange(event.target.value)}
      >
        {roleOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label htmlFor="settings-users-status" className={styles.visuallyHidden}>
        Filtrar por estado
      </label>
      <select
        id="settings-users-status"
        className={styles.select}
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value)}
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    <div className={styles.filterActions}>
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onReload}
        disabled={loading}
      >
        <img
          src={rotateIcon}
          alt=""
          aria-hidden="true"
          className={styles.buttonIcon}
        />
        {loading ? "Cargando..." : "Recargar"}
      </button>

      <button
        type="button"
        className={styles.primaryButton}
        onClick={onNewUser}
      >
        <img
          src={plusIcon}
          alt=""
          aria-hidden="true"
          className={styles.buttonIcon}
        />
        Nuevo Usuario
      </button>
    </div>
  </div>
);

export default SearchFilters;
