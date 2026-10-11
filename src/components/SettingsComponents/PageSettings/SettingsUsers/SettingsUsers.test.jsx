import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import SettingsUsers from "./SettingsUsers";

const {
  fetchUsers,
  fetchRoles,
  updateUser,
  updateUserStatus,
  createUser,
  updateUserPassword,
} = vi.hoisted(() => ({
  fetchUsers: vi.fn(),
  fetchRoles: vi.fn(),
  updateUser: vi.fn(),
  updateUserStatus: vi.fn(),
  createUser: vi.fn(),
  updateUserPassword: vi.fn(),
}));

vi.mock("./services/usersDataService", () => ({
  fetchUsers,
  fetchRoles,
  updateUser,
  updateUserStatus,
  createUser,
  updateUserPassword,
}));

vi.mock("../../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "current-user" } }),
}));

const ROLES = [
  { id: "role-admin", name: "admin" },
  { id: "role-cashier", name: "cajero" },
];

const USERS = [
  {
    id: "u1",
    name: "Ana Torres",
    username: "ana",
    email: "ana@crokets.test",
    status: true,
    roleId: "role-admin",
    roleName: "admin",
    createdAt: "2026-01-05T10:00:00.000Z",
  },
  {
    id: "u2",
    name: "Luis Ponce",
    username: "luis",
    email: "luis@crokets.test",
    status: false,
    roleId: "role-cashier",
    roleName: "cajero",
    createdAt: "2026-02-10T12:00:00.000Z",
  },
];

const mockLoadSuccess = () => {
  fetchUsers.mockResolvedValue({ success: true, data: USERS, error: null });
  fetchRoles.mockResolvedValue({ success: true, data: ROLES, error: null });
};

describe("SettingsUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carga usuarios y roles y muestra KPIs y cabeceras accesibles", async () => {
    mockLoadSuccess();

    render(<SettingsUsers />);

    expect(await screen.findByText("Ana Torres")).toBeTruthy();
    expect(screen.getByText("@luis · luis@crokets.test")).toBeTruthy();

    const kpis = within(
      screen.getByRole("region", { name: "Resumen de usuarios" })
    );
    expect(
      kpis.getByText("Total de usuarios").previousSibling.textContent
    ).toBe("2");
    expect(kpis.getByText("Activos").previousSibling.textContent).toBe("1");
    expect(kpis.getByText("Inactivos").previousSibling.textContent).toBe("1");
    expect(
      kpis.getByText("Administradores / Cajeros").previousSibling.textContent
    ).toBe("1 / 1");

    const headers = screen.getAllByRole("columnheader");
    expect(headers.map((th) => th.textContent)).toEqual([
      "Usuario",
      "Rol",
      "Estado",
      "Registro",
      "Acciones",
    ]);
    headers.forEach((th) => expect(th.getAttribute("scope")).toBe("col"));
  });

  it("filtra los usuarios por termino de busqueda", async () => {
    mockLoadSuccess();

    render(<SettingsUsers />);

    await screen.findByText("Ana Torres");

    fireEvent.change(screen.getByLabelText("Buscar usuario"), {
      target: { value: "luis" },
    });

    expect(screen.queryByText("Ana Torres")).toBeNull();
    expect(screen.getByText("Luis Ponce")).toBeTruthy();
  });

  it("recarga la lista al pulsar Recargar", async () => {
    mockLoadSuccess();

    render(<SettingsUsers />);

    await screen.findByText("Ana Torres");

    fetchUsers.mockClear();
    fetchUsers.mockResolvedValue({
      success: true,
      data: [USERS[0]],
      error: null,
    });

    fireEvent.click(screen.getByRole("button", { name: "Recargar" }));

    await waitFor(() => expect(fetchUsers).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText("Luis Ponce")).toBeNull());
  });

  it("muestra el error de carga en un contenedor role=alert", async () => {
    fetchUsers.mockResolvedValue({
      success: false,
      data: [],
      error: "red caida",
    });
    fetchRoles.mockResolvedValue({ success: true, data: ROLES, error: null });

    render(<SettingsUsers />);

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("red caida");
  });

  it("cambia el estado del usuario desde el modal de confirmacion", async () => {
    mockLoadSuccess();
    updateUserStatus.mockResolvedValue({
      success: true,
      data: null,
      error: null,
    });

    render(<SettingsUsers />);

    await screen.findByText("Ana Torres");

    fireEvent.click(
      screen.getByRole("button", { name: "Desactivar a Ana Torres" })
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Desactivar usuario");

    fireEvent.click(screen.getByRole("button", { name: "Desactivar" }));

    await waitFor(() =>
      expect(updateUserStatus).toHaveBeenCalledWith({
        id: "u1",
        status: false,
      })
    );
  });

  it("crea un usuario desde el modal de alta", async () => {
    mockLoadSuccess();
    createUser.mockResolvedValue({
      success: true,
      data: { id: "u3" },
      requiresConfirmation: true,
      error: null,
    });

    render(<SettingsUsers />);

    await screen.findByText("Ana Torres");

    fireEvent.click(screen.getByRole("button", { name: "Nuevo Usuario" }));

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Nuevo Cajero" },
    });
    fireEvent.change(screen.getByLabelText("Usuario"), {
      target: { value: "nuevo" },
    });
    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "nuevo@crokets.test" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña inicial"), {
      target: { value: "secreto123" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "secreto123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

    await waitFor(() =>
      expect(createUser).toHaveBeenCalledWith({
        name: "Nuevo Cajero",
        username: "nuevo",
        email: "nuevo@crokets.test",
        roleId: "role-cashier",
        password: "secreto123",
      })
    );
  });

  it("muestra los datos de solo lectura al editar", async () => {
    mockLoadSuccess();

    render(<SettingsUsers />);

    await screen.findByText("Ana Torres");

    fireEvent.click(
      screen.getByRole("button", { name: "Editar a Ana Torres" })
    );

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("@ana")).toBeTruthy();
    expect(within(dialog).getByText("ana@crokets.test")).toBeTruthy();
    expect(within(dialog).getByText("u1")).toBeTruthy();
    expect(dialog.querySelector("input#settings-users-username")).toBeNull();
    expect(dialog.querySelector("input#settings-users-email")).toBeNull();
  });

  it("actualiza datos y contrasena al editar con nueva clave", async () => {
    mockLoadSuccess();
    updateUser.mockResolvedValue({ success: true, data: null, error: null });
    updateUserPassword.mockResolvedValue({
      success: true,
      data: { id: "u1" },
      error: null,
    });

    render(<SettingsUsers />);

    await screen.findByText("Ana Torres");

    fireEvent.click(
      screen.getByRole("button", { name: "Editar a Ana Torres" })
    );

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Ana Actualizada" },
    });
    fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
      target: { value: "nuevaClave1" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar nueva contraseña"), {
      target: { value: "nuevaClave1" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({
        id: "u1",
        name: "Ana Actualizada",
        roleId: "role-admin",
      })
    );
    await waitFor(() =>
      expect(updateUserPassword).toHaveBeenCalledWith({
        id: "u1",
        password: "nuevaClave1",
      })
    );
  });

  it("no restablece la contrasena al editar sin nueva clave", async () => {
    mockLoadSuccess();
    updateUser.mockResolvedValue({ success: true, data: null, error: null });

    render(<SettingsUsers />);

    await screen.findByText("Ana Torres");

    fireEvent.click(
      screen.getByRole("button", { name: "Editar a Ana Torres" })
    );

    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Ana Actualizada" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => expect(updateUser).toHaveBeenCalledTimes(1));
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it("restablece el estado de copiado al cerrar el modal", async () => {
    mockLoadSuccess();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<SettingsUsers />);

    await screen.findByText("Ana Torres");

    fireEvent.click(
      screen.getByRole("button", { name: "Editar a Ana Torres" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copiado" })).toBeTruthy()
    );
    expect(writeText).toHaveBeenCalledWith("u1");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Editar a Ana Torres" })
    );

    expect(screen.getByRole("button", { name: "Copiar" })).toBeTruthy();
  });
});
