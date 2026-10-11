import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useUserForm, {
  USER_FORM_CREATE,
  USER_FORM_EDIT,
  validateUserForm,
} from "./useUserForm";

const USERS_FIXTURE = {
  id: "u1",
  name: "Ana Torres",
  username: "ana",
  email: "ana@crokets.test",
  roleName: "admin",
};

describe("validateUserForm", () => {
  it("exige todos los campos al crear", () => {
    const errors = validateUserForm(
      {
        name: "",
        username: "",
        email: "",
        role: "",
        password: "",
        confirmPassword: "",
      },
      USER_FORM_CREATE
    );

    expect(errors.name).toBeTruthy();
    expect(errors.username).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.password).toBeTruthy();
  });

  it("valida el formato de usuario y correo al crear", () => {
    const errors = validateUserForm(
      {
        name: "Nuevo Cajero",
        username: "usuario con espacios",
        email: "no-es-correo",
        role: "cajero",
        password: "secreto123",
        confirmPassword: "secreto123",
      },
      USER_FORM_CREATE
    );

    expect(errors.username).toBeTruthy();
    expect(errors.email).toBeTruthy();
  });

  it("exige coincidencia de contrasena al crear", () => {
    const errors = validateUserForm(
      {
        name: "Nuevo Cajero",
        username: "nuevo",
        email: "nuevo@crokets.test",
        role: "cajero",
        password: "secreto123",
        confirmPassword: "otraClave1",
      },
      USER_FORM_CREATE
    );

    expect(errors.confirmPassword).toBe("Las contraseñas no coinciden.");
  });

  it("no exige contrasena al editar si queda en blanco", () => {
    const errors = validateUserForm(
      { name: "Ana", role: "admin", password: "", confirmPassword: "" },
      USER_FORM_EDIT
    );

    expect(errors.password).toBeUndefined();
    expect(errors.confirmPassword).toBeUndefined();
  });

  it("valida minimo y coincidencia de contrasena al editar con valor", () => {
    const tooShort = validateUserForm(
      { name: "Ana", role: "admin", password: "123", confirmPassword: "123" },
      USER_FORM_EDIT
    );
    expect(tooShort.password).toBe("Debe tener al menos 6 caracteres.");

    const mismatch = validateUserForm(
      {
        name: "Ana",
        role: "admin",
        password: "nuevaClave1",
        confirmPassword: "nuevaClave2",
      },
      USER_FORM_EDIT
    );
    expect(mismatch.confirmPassword).toBe("Las contraseñas no coinciden.");
  });
});

describe("useUserForm", () => {
  it("parte de los datos del usuario en modo edicion", () => {
    const { result } = renderHook(() =>
      useUserForm({
        mode: USER_FORM_EDIT,
        user: USERS_FIXTURE,
        onSubmit: vi.fn(),
      })
    );

    expect(result.current.isEdit).toBe(true);
    expect(result.current.values.name).toBe("Ana Torres");
    expect(result.current.values.username).toBe("ana");
    expect(result.current.values.email).toBe("ana@crokets.test");
    expect(result.current.values.role).toBe("admin");
    expect(result.current.values.password).toBe("");
  });

  it("expone errores solo tras blur o intento de envio", () => {
    const { result } = renderHook(() =>
      useUserForm({ mode: USER_FORM_CREATE, onSubmit: vi.fn() })
    );

    expect(result.current.getFieldError("name")).toBe("");

    act(() => result.current.handleBlur("name"));

    expect(result.current.getFieldError("name")).toBeTruthy();
  });

  it("no envia el formulario si hay errores", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useUserForm({ mode: USER_FORM_CREATE, onSubmit })
    );

    act(() => result.current.handleSubmit({ preventDefault: vi.fn() }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("envia los valores cuando el formulario es valido en edicion", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useUserForm({ mode: USER_FORM_EDIT, user: USERS_FIXTURE, onSubmit })
    );

    act(() => result.current.handleSubmit({ preventDefault: vi.fn() }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].name).toBe("Ana Torres");
  });
});
