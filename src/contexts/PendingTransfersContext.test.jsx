import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

vi.mock(
  "../components/InventoryComponents/PageInventory/PageTransfers/services/transfersService",
  () => ({
    loadTransferOrders: vi.fn(),
  })
);

vi.mock(
  "../components/InventoryComponents/PageInventory/PageTransfers/utils/transfersUtils",
  () => ({
    getPendingReceiptsCount: vi.fn(),
  })
);

let mockBranch = { id: "branch-1" };

vi.mock("./BranchContext", () => ({
  useBranch: () => ({ branch: mockBranch }),
  BranchProvider: ({ children }) => <>{children}</>,
}));

import { loadTransferOrders } from "../components/InventoryComponents/PageInventory/PageTransfers/services/transfersService";
import { getPendingReceiptsCount } from "../components/InventoryComponents/PageInventory/PageTransfers/utils/transfersUtils";
import {
  PendingTransfersProvider,
  usePendingTransfers,
} from "./PendingTransfersContext";

const Consumer = () => {
  const { pendingReceiptsCount, isLoading, lastRefreshAt } =
    usePendingTransfers();
  return (
    <div>
      <span data-testid="count">{pendingReceiptsCount}</span>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="last-refresh">{lastRefreshAt ? "set" : "null"}</span>
    </div>
  );
};

const renderProvider = () =>
  render(
    <PendingTransfersProvider>
      <Consumer />
    </PendingTransfersProvider>
  );

describe("PendingTransfersContext - refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBranch = { id: "branch-1" };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("no hace fetch y mantiene pendingReceiptsCount en 0 cuando branch.id esta vacio", async () => {
    mockBranch = { id: "" };

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(loadTransferOrders).not.toHaveBeenCalled();
    expect(getPendingReceiptsCount).not.toHaveBeenCalled();
    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("last-refresh").textContent).toBe("null");
  });

  it("asigna pendingReceiptsCount al conteo real (no 0 fijo) tras cargar ordenes", async () => {
    const orders = [{ id: "t1" }, { id: "t2" }];
    loadTransferOrders.mockResolvedValue(orders);
    getPendingReceiptsCount.mockReturnValue(2);

    renderProvider();

    await waitFor(() => {
      expect(loadTransferOrders).toHaveBeenCalledTimes(1);
    });

    expect(getPendingReceiptsCount).toHaveBeenCalledWith({
      orders,
      currentBranchId: "branch-1",
    });
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("last-refresh").textContent).toBe("set");
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("actualiza el conteo cuando getPendingReceiptsCount devuelve un valor distinto de 0", async () => {
    loadTransferOrders.mockResolvedValue([{ id: "t1" }]);
    getPendingReceiptsCount.mockReturnValue(5);

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId("count").textContent).toBe("5");
    });
  });

  it("no resetea el conteo a 0 mientras un refresh esta en vuelo (evita parpadeo del badge)", async () => {
    loadTransferOrders.mockResolvedValue([{ id: "t1" }]);
    getPendingReceiptsCount.mockReturnValue(3);

    let resolveSecond;
    const secondCall = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    const RefreshConsumer = () => {
      const { pendingReceiptsCount, refreshPendingTransfers } =
        usePendingTransfers();
      return (
        <div>
          <span data-testid="count">{pendingReceiptsCount}</span>
          <button type="button" onClick={() => void refreshPendingTransfers()}>
            refresh
          </button>
        </div>
      );
    };

    render(
      <PendingTransfersProvider>
        <RefreshConsumer />
      </PendingTransfersProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("count").textContent).toBe("3");
    });

    loadTransferOrders.mockReturnValue(secondCall);
    getPendingReceiptsCount.mockReturnValue(7);

    fireEvent.click(screen.getByRole("button", { name: "refresh" }));

    expect(screen.getByTestId("count").textContent).toBe("3");

    resolveSecond([{ id: "t1" }, { id: "t2" }]);
    await waitFor(() => {
      expect(screen.getByTestId("count").textContent).toBe("7");
    });
  });

  it("mantiene pendingReceiptsCount en 0 y registra console.error si el servicio falla", async () => {
    loadTransferOrders.mockRejectedValue(new Error("boom"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderProvider();

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(
        "Error al refrescar recepciones pendientes:",
        expect.any(Error)
      );
    });

    expect(screen.getByTestId("count").textContent).toBe("0");
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(getPendingReceiptsCount).not.toHaveBeenCalled();
  });
});
