export const ROLE_FILTER_ALL = "all";
export const ROLE_FILTER_ADMIN = "admin";
export const ROLE_FILTER_CASHIER = "cajero";

export const STATUS_FILTER_ALL = "all";
export const STATUS_FILTER_ACTIVE = "active";
export const STATUS_FILTER_INACTIVE = "inactive";

const toSafeUsers = (users) => (Array.isArray(users) ? users : []);

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

  return [user?.name, user?.username, user?.email]
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

  return toSafeUsers(users).filter(
    (user) =>
      matchesSearchTerm(user, searchTerm) &&
      matchesRoleFilter(user, roleFilter) &&
      matchesStatusFilter(user, statusFilter)
  );
};
