import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../../../../../AppModal/AppModal", () => ({
  default: ({ children, title }) => (
    <div data-testid="app-modal">
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

import TransferDetailModal from "./TransferDetailModal";

const order = {
  id: "t1",
  folio: "TR-010126-000001",
  originBranchId: "b1",
  destinationBranchId: "b2",
  originBranchName: "Sucursal Centro",
  destinationBranchName: "Sucursal Norte",
  status: "pending_receipt",
  createdAt: "2026-10-01T10:00:00Z",
  receivedAt: null,
  createdByUsername: "admin",
  notes: "Urgente",
  items: [
    {
      productId: "p1",
      name: "Croquetas",
      barcode: "CROC-01",
      requestedQty: 10,
      receivedQty: 0,
      returnedQty: 0,
      origin_stock_before: 20,
      origin_stock_after: 10,
    },
  ],
};

const defaultProps = {
  order,
  branch: { id: "b1" },
  products: [{ id: "p1", existencia: 15 }],
  onClose: vi.fn(),
};

describe("TransferDetailModal", () => {
  it("no renderiza si no hay orden", () => {
    const { container } = render(
      <TransferDetailModal {...defaultProps} order={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza el titulo con el folio", () => {
    render(<TransferDetailModal {...defaultProps} />);
    expect(
      screen.getByText("Detalle del traspaso TR-010126-000001")
    ).toBeTruthy();
  });

  it("muestra origen y destino", () => {
    render(<TransferDetailModal {...defaultProps} />);
    expect(screen.getByText("Sucursal Centro")).toBeTruthy();
    expect(screen.getByText("Sucursal Norte")).toBeTruthy();
  });

  it("muestra las notas de la orden", () => {
    render(<TransferDetailModal {...defaultProps} />);
    expect(screen.getByText("Urgente")).toBeTruthy();
  });

  it("renderiza los items del traspaso", () => {
    render(<TransferDetailModal {...defaultProps} />);
    expect(screen.getByText("Croquetas")).toBeTruthy();
    // requestedQty: 10 y origin_stock_after: 10 => 2 ocurrencias de "10"
    expect(screen.getAllByText("10").length).toBe(2);
  });

  it("muestra snapshots de inventario para sucursal origen", () => {
    render(<TransferDetailModal {...defaultProps} />);
    // origin_stock_before: 20 (unico)
    expect(screen.getByText("20")).toBeTruthy();
    // origin_stock_after: 10 + requestedQty: 10 => 2 ocurrencias
    expect(screen.getAllByText("10").length).toBe(2);
  });

  it("no muestra snapshots para sucursal no participante", () => {
    render(<TransferDetailModal {...defaultProps} branch={{ id: "b99" }} />);
    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
  });

  it("no muestra snapshots si la orden esta cancelada", () => {
    const cancelledOrder = { ...order, status: "cancelled" };
    render(<TransferDetailModal {...defaultProps} order={cancelledOrder} />);
    expect(screen.queryByText("20")).toBeNull();
  });

  it("muestra mensaje vacio si no hay items", () => {
    const emptyOrder = { ...order, items: [] };
    render(<TransferDetailModal {...defaultProps} order={emptyOrder} />);
    expect(
      screen.getByText("Este traspaso no tiene productos registrados.")
    ).toBeTruthy();
  });
});
