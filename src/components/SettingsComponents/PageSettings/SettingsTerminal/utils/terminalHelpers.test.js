import { describe, it, expect } from "vitest";
import {
  ZOOM_STEPS,
  findNextZoomStep,
  isProtectedStorageKey,
} from "./terminalHelpers";

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

describe("terminalHelpers.isProtectedStorageKey", () => {
  it("protege llaves criticas exactas", () => {
    expect(isProtectedStorageKey("currentBranch")).toBe(true);
    expect(isProtectedStorageKey("sb-crokets-pos-auth-token")).toBe(true);
    expect(isProtectedStorageKey("cash_operation_settings")).toBe(true);
    expect(isProtectedStorageKey("ticket_customization")).toBe(true);
  });

  it("protege llaves por prefijo", () => {
    expect(isProtectedStorageKey("sales_draft_b1_u1")).toBe(true);
    expect(isProtectedStorageKey("shift_cut_done")).toBe(true);
    expect(isProtectedStorageKey("device_code")).toBe(true);
  });

  it("permite borrar llaves temporales de la vista", () => {
    expect(isProtectedStorageKey("table_columns_sales")).toBe(false);
    expect(isProtectedStorageKey("reports_filter_temp")).toBe(false);
  });
});
