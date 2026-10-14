import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../services/inventoryBranchStocksDetailService", () => ({
  fetchOtherBranchStocks: vi.fn(),
}));

import { fetchOtherBranchStocks } from "../services/inventoryBranchStocksDetailService";
import useInventoryBranchDetails from "./useInventoryBranchDetails";

describe("useInventoryBranchDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inicializa estados vacios", () => {
    const { result } = renderHook(() => useInventoryBranchDetails("b1"));
    expect(result.current.expandedProductId).toBeNull();
    expect(result.current.otherStocksByProduct).toEqual({});
    expect(result.current.loadingDetailsByProduct).toEqual({});
    expect(result.current.detailsErrorByProduct).toEqual({});
  });

  it("handleToggleOtherStocks: no hace nada sin productId o branch", async () => {
    const { result } = renderHook(() => useInventoryBranchDetails(""));
    await act(async () => {
      await result.current.handleToggleOtherStocks("p1");
    });
    expect(fetchOtherBranchStocks).not.toHaveBeenCalled();
  });

  it("handleToggleOtherStocks: cierra el producto expandido", async () => {
    const { result } = renderHook(() => useInventoryBranchDetails("b1"));
    await act(async () => {
      await result.current.handleToggleOtherStocks("p1");
    });
    expect(result.current.expandedProductId).toBe("p1");
    await act(async () => {
      await result.current.handleToggleOtherStocks("p1");
    });
    expect(result.current.expandedProductId).toBeNull();
  });

  it("handleToggleOtherStocks: carga stocks de otras sucursales", async () => {
    fetchOtherBranchStocks.mockResolvedValueOnce([
      { branch_id: "b2", stock: 5 },
      { branch_id: "b3", stock: 3 },
    ]);
    const { result } = renderHook(() => useInventoryBranchDetails("b1"));
    await act(async () => {
      await result.current.handleToggleOtherStocks("p1");
    });
    expect(fetchOtherBranchStocks).toHaveBeenCalledWith({
      productId: "p1",
      selectedBranchId: "b1",
    });
    expect(result.current.otherStocksByProduct.p1).toHaveLength(2);
    expect(result.current.loadingDetailsByProduct.p1).toBe(false);
  });

  it("handleToggleOtherStocks: maneja error cargando detalles", async () => {
    fetchOtherBranchStocks.mockRejectedValueOnce(new Error("RLS"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useInventoryBranchDetails("b1"));
    await act(async () => {
      await result.current.handleToggleOtherStocks("p1");
    });
    expect(result.current.otherStocksByProduct.p1).toEqual([]);
    expect(result.current.detailsErrorByProduct.p1).toBe(
      "No se pudo cargar stock de otras sucursales."
    );
    errorSpy.mockRestore();
  });

  it("clearExpandedProduct cierra el producto expandido", () => {
    const { result } = renderHook(() => useInventoryBranchDetails("b1"));
    act(() => {
      result.current.handleToggleOtherStocks("p1");
    });
    expect(result.current.expandedProductId).toBe("p1");
    act(() => {
      result.current.clearExpandedProduct();
    });
    expect(result.current.expandedProductId).toBeNull();
  });
});
