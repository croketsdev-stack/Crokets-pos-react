export const ZOOM_STEPS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.5];

export const findNextZoomStep = (current, direction) => {
  const safeCurrent = Number.isFinite(current) ? current : 1;
  const exactIndex = ZOOM_STEPS.findIndex(
    (step) => Math.abs(step - safeCurrent) < 0.001
  );

  if (exactIndex === -1) {
    if (direction > 0) {
      return (
        ZOOM_STEPS.find((step) => step > safeCurrent) ??
        ZOOM_STEPS[ZOOM_STEPS.length - 1]
      );
    }
    return (
      [...ZOOM_STEPS].reverse().find((step) => step < safeCurrent) ??
      ZOOM_STEPS[0]
    );
  }

  const nextIndex = Math.min(
    ZOOM_STEPS.length - 1,
    Math.max(0, exactIndex + (direction > 0 ? 1 : -1))
  );
  return ZOOM_STEPS[nextIndex];
};

export const PROTECTED_STORAGE_KEYS = [
  "currentBranch",
  "supabase.auth.token",
  "sb-crokets-pos-auth-token",
  "user_session_token",
  "cachedUsername",
  "cashAmount",
  "cashRegistered",
  "isLocked",
  "settings_selected_printer",
  "settings_ticket_copies",
  "settings_ticket_feed_lines",
  "cash_operation_settings",
  "ticket_customization",
];

export const PROTECTED_STORAGE_KEY_PREFIXES = [
  "sales_draft_",
  "shift_cut_done",
  "device_code",
];

export const isProtectedStorageKey = (key) =>
  PROTECTED_STORAGE_KEYS.includes(key) ||
  PROTECTED_STORAGE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));

export const getLocalStorageSize = () => {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  let total = 0;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    const value = key ? window.localStorage.getItem(key) : "";
    total += (key?.length || 0) + (value?.length || 0);
  }
  return total;
};
