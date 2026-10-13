import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BranchProvider, useBranch } from "./BranchContext";

const Consumer = () => {
  const { branch, setBranch } = useBranch();
  return (
    <div>
      <span data-testid="branch-name">{branch?.name || "sin-sucursal"}</span>
      <button
        type="button"
        onClick={() => setBranch({ id: "b1", name: "Torres" })}
      >
        set
      </button>
      <button type="button" onClick={() => setBranch(null)}>
        clear
      </button>
    </div>
  );
};

describe("BranchContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("expone el valor nulo cuando no hay sucursal en cache", () => {
    render(
      <BranchProvider>
        <Consumer />
      </BranchProvider>
    );

    expect(screen.getByTestId("branch-name").textContent).toBe("sin-sucursal");
  });

  it("persiste la sucursal en localStorage al establecerla", () => {
    render(
      <BranchProvider>
        <Consumer />
      </BranchProvider>
    );

    fireEvent.click(screen.getByText("set"));

    expect(screen.getByTestId("branch-name").textContent).toBe("Torres");
    expect(JSON.parse(localStorage.getItem("currentBranch")).name).toBe(
      "Torres"
    );
  });

  it("elimina la sucursal de localStorage al limpiarla", () => {
    localStorage.setItem(
      "currentBranch",
      JSON.stringify({ id: "b1", name: "Torres" })
    );

    render(
      <BranchProvider>
        <Consumer />
      </BranchProvider>
    );

    expect(screen.getByTestId("branch-name").textContent).toBe("Torres");

    fireEvent.click(screen.getByText("clear"));

    expect(screen.getByTestId("branch-name").textContent).toBe("sin-sucursal");
    expect(localStorage.getItem("currentBranch")).toBeNull();
  });

  it("restaura la sucursal desde localStorage al montar", () => {
    localStorage.setItem(
      "currentBranch",
      JSON.stringify({ id: "b9", name: "Sucursal Cacheada" })
    );

    render(
      <BranchProvider>
        <Consumer />
      </BranchProvider>
    );

    expect(screen.getByTestId("branch-name").textContent).toBe(
      "Sucursal Cacheada"
    );
  });

  it("tolera un JSON corrupto en cache", () => {
    localStorage.setItem("currentBranch", "{no-es-json");

    render(
      <BranchProvider>
        <Consumer />
      </BranchProvider>
    );

    expect(screen.getByTestId("branch-name").textContent).toBe("sin-sucursal");
  });

  it("lanza error si useBranch se usa fuera del provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      "useBranch debe usarse dentro de <BranchProvider />"
    );
    spy.mockRestore();
  });
});
