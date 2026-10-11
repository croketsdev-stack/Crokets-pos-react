export const ROLE_FILTER_ALL = "all";
export const ROLE_FILTER_ADMIN = "admin";
export const ROLE_FILTER_CASHIER = "cajero";

export const STATUS_FILTER_ALL = "all";
export const STATUS_FILTER_ACTIVE = "active";
export const STATUS_FILTER_INACTIVE = "inactive";

const toSafeUsers = (users) => (Array.isArray(users) ? users : []);

const ROLE_SORT_RANK = {
  [ROLE_FILTER_ADMIN]: 0,
  [ROLE_FILTER_CASHIER]: 1,
};

const getRoleSortRank = (roleName) => {
  const normalized = String(roleName || "")
    .trim()
    .toLowerCase();

  return normalized in ROLE_SORT_RANK ? ROLE_SORT_RANK[normalized] : 2;
};

const getStatusSortRank = (status) => (status === true ? 0 : 1);

const getUserSortName = (user) =>
  String(user?.name || "").trim() || String(user?.username || "").trim();

/**
 * Ordena usuarios jerarquicamente: primero por rol (admin, cajero, otros),
 * luego por estado (activos primero) y, por ultimo, por nombre de forma
 * alfabetica y case-insensitive.
 */
export const sortUsers = (users) =>
  [...toSafeUsers(users)].sort((a, b) => {
    const roleDiff =
      getRoleSortRank(a?.roleName) - getRoleSortRank(b?.roleName);

    if (roleDiff !== 0) return roleDiff;

    const statusDiff =
      getStatusSortRank(a?.status) - getStatusSortRank(b?.status);

    if (statusDiff !== 0) return statusDiff;

    return getUserSortName(a).localeCompare(getUserSortName(b), "es", {
      sensitivity: "base",
    });
  });

export const calculateUserMetrics = (users) => {
  const list = toSafeUsers(users);

  let active = 0;
  let inactive = 0;
  let admins = 0;
  let cashiers = 0;

  for (const user of list) {
    if (user?.status === true) {
      active += 1;
    } else if (user?.status === false) {
      inactive += 1;
    }

    if (user?.roleName === ROLE_FILTER_ADMIN) {
      admins += 1;
    } else if (user?.roleName === ROLE_FILTER_CASHIER) {
      cashiers += 1;
    }
  }

  return { total: list.length, active, inactive, admins, cashiers };
};

const matchesSearchTerm = (user, searchTerm) => {
  const needle = String(searchTerm || "")
    .trim()
    .toLowerCase();

  if (!needle) return true;

  return [user?.name, user?.username, user?.email, user?.id]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle));
};

const matchesRoleFilter = (user, roleFilter) => {
  if (!roleFilter || roleFilter === ROLE_FILTER_ALL) return true;

  return user?.roleName === roleFilter;
};

const matchesStatusFilter = (user, statusFilter) => {
  if (!statusFilter || statusFilter === STATUS_FILTER_ALL) return true;
  if (statusFilter === STATUS_FILTER_ACTIVE) return user?.status === true;
  if (statusFilter === STATUS_FILTER_INACTIVE) return user?.status === false;

  return true;
};

export const filterUsers = (users, filters = {}) => {
  const {
    searchTerm = "",
    roleFilter = ROLE_FILTER_ALL,
    statusFilter = STATUS_FILTER_ALL,
  } = filters || {};

  const filtered = toSafeUsers(users).filter(
    (user) =>
      matchesSearchTerm(user, searchTerm) &&
      matchesRoleFilter(user, roleFilter) &&
      matchesStatusFilter(user, statusFilter)
  );

  return sortUsers(filtered);
};
