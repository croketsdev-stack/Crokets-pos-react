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
