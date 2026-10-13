import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSettingsPrinters } from "./useSettingsPrinters";

vi.mock("../../../../../utils/ticketPrinter", async () => {
  const actual = await vi.importActual("../../../../../utils/ticketPrinter");
  return {
    ...actual,
    getAvailablePrinters: vi.fn(async () => ({ success: true, printers: [] })),
    printTicket: vi.fn(async () => ({ success: true, message: "ok" })),
    hasElectronBridge: vi.fn(() => true),
  };
});

describe("useSettingsPrinters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    if (typeof window !== "undefined") {
      window.electronAPI = {
        invoke: vi.fn(async (channel) => {
          if (channel === "open-cash-drawer")
            return { success: true, message: "drawer" };
          if (channel === "get-printers") return [];
          if (channel === "print-ticket")
            return { success: true, message: "ok" };
          return { success: true };
        }),
      };
    }
  });

  it("Inicialización, detección de impresoras y sincronización con el contexto de sucursal.", async () => {
    let hookResult;
    await act(async () => {
      hookResult = renderHook(() => useSettingsPrinters({ branchId: null }));
    });
    expect(hookResult.result.current.widthMm).toBe(58);
    expect(hookResult.result.current.printMode).toBe("auto");
  });

  it("Mutación de preferencias de hardware y guardado de plantilla comercial.", async () => {
    const { result } = renderHook(() =>
      useSettingsPrinters({ branchId: null })
    );
    await act(async () => {
      result.current.handleCopiesChange(2);
      result.current.handleFeedLinesChange(3);
      result.current.handleTemplateChange(
        "footerLine1",
        "Gracias por su compra"
      );
      await result.current.handleSaveTemplate();
    });
    expect(result.current.copies).toBe(2);
    expect(result.current.feedLines).toBe(3);
  });

  it("Manejo de flujo de impresión de prueba y apertura de cajón.", async () => {
    const { result } = renderHook(() =>
      useSettingsPrinters({ branchId: null })
    );
    await act(async () => {
      await result.current.handleTestPrint();
      await result.current.handleOpenDrawer();
    });
    expect(result.current.printFeedback?.type).toBe("success");
    expect(result.current.drawerFeedback?.type).toBe("success");
  });

  it("restablece la plantilla a sus valores por defecto con handleResetTemplate", async () => {
    const { result } = renderHook(() =>
      useSettingsPrinters({ branchId: null })
    );
    await act(async () => {
      result.current.handleTemplateChange(
        "headerSlogan",
        "Mi Eslogan Modificado"
      );
    });
    expect(result.current.template.headerSlogan).toBe("Mi Eslogan Modificado");

    await act(async () => {
      result.current.handleResetTemplate();
    });
    expect(result.current.template.headerSlogan).toBe(
      "¡Todo para consentir a tu mascota!"
    );
  });
});
