import { describe, it, expect } from "vitest";
import { ZOOM_STEPS, findNextZoomStep } from "./terminalHelpers";

describe("terminalHelpers.findNextZoomStep", () => {
  it("sube al siguiente paso entero y salta decimales incomodos", () => {
    expect(findNextZoomStep(0.98, 1)).toBe(1.0);
    expect(findNextZoomStep(1.0, 1)).toBe(1.1);
    expect(findNextZoomStep(1.1, 1)).toBe(1.2);
  });

  it("baja al paso anterior", () => {
    expect(findNextZoomStep(1.0, -1)).toBe(0.9);
    expect(findNextZoomStep(0.98, -1)).toBe(0.9);
  });

  it("respeta los limites de la escala", () => {
    expect(findNextZoomStep(ZOOM_STEPS[0], -1)).toBe(ZOOM_STEPS[0]);
    expect(findNextZoomStep(ZOOM_STEPS[ZOOM_STEPS.length - 1], 1)).toBe(
      ZOOM_STEPS[ZOOM_STEPS.length - 1]
    );
  });

  it("tolera un valor actual invalido", () => {
    expect(findNextZoomStep(NaN, 1)).toBe(1.1);
    expect(findNextZoomStep(undefined, -1)).toBe(0.9);
  });
});
