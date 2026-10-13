import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import BranchEditModal, {
  BRANCH_TIMEZONE_OPTIONS,
  buildBranchForm,
  validateBranchForm,
  toTitleCase,
  normalizeAddress,
  sanitizeBranchForm,
} from "./BranchEditModal";

const fullBranchProfile = {
  id: "b1",
  code: "TOR",
  name: "Torres",
  city: "Cancún",
  phone: "9999999999",
  email: "contacto@torres.com",
  address: "Av. Principal 123, Cancún",
  timezone: "America/Cancun",
};

const renderModal = (props = {}) =>
  render(
    <BranchEditModal
      isOpen
      branchProfile={fullBranchProfile}
      branch={{ id: "b1", code: "TOR", name: "Torres" }}
      onClose={vi.fn()}
      onSave={vi.fn()}
      saving={false}
      {...props}
    />
  );

describe("BranchEditModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada cuando esta cerrado", () => {
    renderModal({ isOpen: false });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("cierra el modal al pulsar la tecla Escape", () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("no cierra el modal con otras teclas", () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.keyDown(window, { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("cierra el modal al pulsar el boton Cancelar", () => {
    const onClose = vi.fn();
    renderModal({ onClose });

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("no renderiza el boton de cierre con aria-label Cerrar modal", () => {
    renderModal();

    expect(screen.queryByRole("button", { name: "Cerrar modal" })).toBeNull();
  });

  it("precarga los datos del perfil y deshabilita el codigo oficial", () => {
    renderModal();

    expect(screen.getByLabelText(/Nombre de sucursal/).value).toBe("Torres");
    expect(screen.getByLabelText(/Ciudad/).value).toBe("Cancún");
    expect(screen.getByLabelText(/Dirección comercial/).value).toBe(
      "Av. Principal 123, Cancún"
    );

    const codeInput = screen.getByLabelText("Código oficial");
    expect(codeInput.value).toBe("TOR");
    expect(codeInput.disabled).toBe(true);
    expect(
      screen.getByText(
        "El código oficial no es editable para preservar folios y series fiscales."
      )
    ).toBeTruthy();
  });

  it("expone las zonas horarias oficiales", () => {
    renderModal();
    const select = screen.getByLabelText(/Zona horaria/);
    expect(select.options.length).toBe(BRANCH_TIMEZONE_OPTIONS.length);
    expect(select.value).toBe("America/Cancun");
  });

  it("permite guardar y envia los valores recortados", () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    const nameInput = screen.getByLabelText(/Nombre de sucursal/);
    fireEvent.change(nameInput, { target: { value: "  Torres Centro  " } });

    const saveButton = screen.getByRole("button", { name: "Guardar cambios" });
    expect(saveButton.disabled).toBe(false);

    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith({
      name: "Torres Centro",
      city: "Cancún",
      phone: "9999999999",
      email: "contacto@torres.com",
      address: "Av. Principal 123, Cancún",
      timezone: "America/Cancun",
    });
  });

  it("sanea los datos al guardar con valores desordenados", () => {
    const onSave = vi.fn();
    renderModal({ onSave });

    fireEvent.change(screen.getByLabelText(/Nombre de sucursal/), {
      target: { value: "  sucursal  torres   centro  " },
    });
    fireEvent.change(screen.getByLabelText(/Ciudad/), {
      target: { value: "cAnCun" },
    });
    fireEvent.change(screen.getByLabelText(/Correo de contacto/), {
      target: { value: "CONTACTO@SUCURSAL.COM" },
    });
    fireEvent.change(screen.getByLabelText(/Teléfono comercial/), {
      target: { value: "(998)-123-4567" },
    });
    fireEvent.change(screen.getByLabelText(/Dirección comercial/), {
      target: { value: "  calle 50   numero 123  " },
    });

    const saveButton = screen.getByRole("button", { name: "Guardar cambios" });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith({
      name: "Sucursal Torres Centro",
      city: "Cancun",
      email: "contacto@sucursal.com",
      phone: "9981234567",
      address: "Calle 50 numero 123",
      timezone: "America/Cancun",
    });
  });

  it("deshabilita guardar y muestra alertas con datos invalidos", () => {
    renderModal();

    fireEvent.change(screen.getByLabelText(/Teléfono comercial/), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByLabelText(/Correo de contacto/), {
      target: { value: "correo-invalido" },
    });

    const saveButton = screen.getByRole("button", { name: "Guardar cambios" });
    expect(saveButton.disabled).toBe(true);

    const alerts = screen.getAllByRole("alert").map((node) => node.textContent);
    expect(alerts.some((text) => text.includes("exactamente 10 dígitos"))).toBe(
      true
    );
    expect(alerts.some((text) => text.includes("formato válido"))).toBe(true);
  });
});

describe("validateBranchForm", () => {
  const validForm = {
    name: "Torres",
    city: "Cancún",
    phone: "9999999999",
    email: "a@b.com",
    address: "Direccion valida de prueba",
    timezone: "America/Cancun",
  };

  it("acepta un formulario valido", () => {
    expect(validateBranchForm(validForm)).toEqual({});
  });

  it("reporta campos fuera de rango", () => {
    const errors = validateBranchForm({
      ...validForm,
      name: "ab",
      city: "a",
      address: "corta",
    });
    expect(errors.name).toBeTruthy();
    expect(errors.city).toBeTruthy();
    expect(errors.address).toBeTruthy();
  });
});

describe("buildBranchForm", () => {
  it("prioriza el perfil sobre la sucursal y usa la zona por defecto", () => {
    expect(buildBranchForm(null, { name: "Desde contexto" }).name).toBe(
      "Desde contexto"
    );
    expect(buildBranchForm(null, {}).timezone).toBe("America/Cancun");
  });
});

describe("formatters and sanitizers", () => {
  it("toTitleCase transforma correctamente", () => {
    expect(toTitleCase("sUcuRsal tOrRes")).toBe("Sucursal Torres");
    expect(toTitleCase("SUCURSAL CENTRO")).toBe("Sucursal Centro");
    expect(toTitleCase("  plaza   las   americas  ")).toBe("Plaza Las Americas");
  });

  it("normalizeAddress normaliza la direccion correctamente", () => {
    expect(normalizeAddress("  av. nichupte   sm 51  ")).toBe("Av. nichupte sm 51");
  });

  it("sanitizeBranchForm sanea el objeto completo", () => {
    const form = {
      name: "  sucursal  torres   sur  ",
      city: "cAnCun",
      email: "CONTACTO@SUCURSAL.COM",
      phone: "998-123-4567",
      address: "  calle 50   numero 123  ",
      timezone: "America/Cancun",
    };
    expect(sanitizeBranchForm(form)).toEqual({
      name: "Sucursal Torres Sur",
      city: "Cancun",
      email: "contacto@sucursal.com",
      phone: "9981234567",
      address: "Calle 50 numero 123",
      timezone: "America/Cancun",
    });
  });
});
