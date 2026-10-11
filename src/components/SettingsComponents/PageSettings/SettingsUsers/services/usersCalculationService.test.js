import { describe, it, expect } from "vitest";
import {
  calculateUserMetrics,
  filterUsers,
  ROLE_FILTER_ADMIN,
} from "./usersCalculationService";

const USERS = [
  {
    id: "u1",
    name: "Ana Maria Lopez",
    username: "ana",
    email: "ana@crokets.test",
    status: true,
    roleName: "admin",
  },
  {
    id: "u2",
    name: "Luis Perez",
    username: "luis",
    email: "luis@crokets.test",
    status: false,
    roleName: "cajero",
  },
  {
    id: "u3",
    name: "",
    username: "kari",
    email: "kari@crokets.test",
    status: true,
    roleName: "cajero",
  },
  {
    id: "u4",
    name: "Sin Rol",
    username: "sinrol",
    email: "sinrol@crokets.test",
    status: null,
    roleName: "SIN ROL",
  },
];

describe("usersCalculationService", () => {
  describe("calculateUserMetrics", () => {
    it("agrega totales, estados y distribucion por rol", () => {
      expect(calculateUserMetrics(USERS)).toEqual({
        total: 4,
        active: 2,
        inactive: 1,
        admins: 1,
        cashiers: 2,
      });
    });

    it("solo cuenta estados booleanos y roles conocidos", () => {
      const metrics = calculateUserMetrics([
        { status: null, roleName: "gerente" },
        { status: true, roleName: "admin" },
      ]);

      expect(metrics).toEqual({
        total: 2,
        active: 1,
        inactive: 0,
        admins: 1,
        cashiers: 0,
      });
    });

    it("tolera entradas no arreglo", () => {
      expect(calculateUserMetrics(null)).toEqual({
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
        cashiers: 0,
      });
    });
  });

  describe("filterUsers", () => {
    it("sin filtros devuelve el conjunto completo", () => {
      expect(filterUsers(USERS, {})).toHaveLength(4);
    });

    it("busca por nombre, username y correo sin distinguir mayusculas", () => {
      expect(filterUsers(USERS, { searchTerm: "maria" })).toHaveLength(1);
      expect(filterUsers(USERS, { searchTerm: "LUIS" })).toHaveLength(1);
      expect(filterUsers(USERS, { searchTerm: "kari@" })).toHaveLength(1);
    });

    it("ignora espacios en el termino de busqueda", () => {
      expect(filterUsers(USERS, { searchTerm: "   " })).toHaveLength(4);
      expect(filterUsers(USERS, { searchTerm: "  ana  " })).toHaveLength(1);
    });

    it("filtra por rol", () => {
      expect(
        filterUsers(USERS, { roleFilter: ROLE_FILTER_ADMIN })
      ).toHaveLength(1);
      expect(filterUsers(USERS, { roleFilter: "cajero" })).toHaveLength(2);
    });

    it("filtra por estado", () => {
      expect(filterUsers(USERS, { statusFilter: "active" })).toHaveLength(2);
      expect(filterUsers(USERS, { statusFilter: "inactive" })).toHaveLength(1);
    });

    it("combina busqueda, rol y estado", () => {
      const result = filterUsers(USERS, {
        searchTerm: "kari",
        roleFilter: "cajero",
        statusFilter: "active",
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("u3");
    });

    it("devuelve arreglo vacio si nada coincide", () => {
      expect(filterUsers(USERS, { searchTerm: "inexistente" })).toEqual([]);
    });

    it("tolera entradas no arreglo", () => {
      expect(filterUsers(null, { searchTerm: "x" })).toEqual([]);
    });
  });
});
