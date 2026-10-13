import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SettingsPrinters from "./SettingsPrinters";

vi.mock("../../../../contexts/BranchContext", () => ({
  useBranch: () => ({ branch: { id: 1, name: "Sucursal" } }),
}));

vi.mock("../../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { username: "admin" } }),
}));

vi.mock("./hooks/useSettingsPrinters", () => ({
  useSettingsPrinters: () => ({
    widthMm: 58,
    printMode: "auto",
    preferencesFeedback: null,
    printing: false,
    printFeedback: null,
    drawerFeedback: null,
    copies: 1,
    feedLines: 2,
    template: { footerLine1: "Gracias" },
    templateFeedback: null,
    savingTemplate: false,
    printers: [],
    selectedPrinter: "",
    setSelectedPrinter: vi.fn(),
    printersLoading: false,
    printersError: null,
    viewMode: "venta",
    setViewMode: vi.fn(),
    isElectron: false,
    refreshPrinters: vi.fn(),
    handleWidthChange: vi.fn(),
    handlePrintModeChange: vi.fn(),
    handleCopiesChange: vi.fn(),
    handleFeedLinesChange: vi.fn(),
    handleTemplateChange: vi.fn(),
    handleToggleChange: vi.fn(),
    handleSaveTemplate: vi.fn(),
    handleTestPrint: vi.fn(),
    handleOpenDrawer: vi.fn(),
    previewData: { footerLine1: "Gracias" },
  }),
}));

describe("SettingsPrinters", () => {
  it("Renderizado completo del layout a dos columnas.", () => {
    render(<SettingsPrinters />);
    expect(screen.getByText("Impresión y Tickets")).toBeTruthy();
    expect(screen.getByText("Simulador Térmico en Vivo")).toBeTruthy();
    expect(screen.getByText("Ticket de Venta")).toBeTruthy();
    expect(screen.getByText("Corte de Caja")).toBeTruthy();
  });
});
