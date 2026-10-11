import { describe, it, expect } from "vitest";
import {
  formatUserDate,
  getRoleBadgeClass,
  getRoleBadgeVariant,
  getRoleLabel,
  getStatusBadgeClass,
  getStatusBadgeVariant,
  getStatusLabel,
  getUserDisplayName,
  getUserInitials,
} from "./usersFormatters";

const STYLES = {
  roleBadgeAdmin: "roleBadgeAdmin",
  roleBadgeCashier: "roleBadgeCashier",
  roleBadgeUnknown: "roleBadgeUnknown",
  statusBadgeActive: "statusBadgeActive",
  statusBadgeInactive: "statusBadgeInactive",
  statusBadgeUnknown: "statusBadgeUnknown",
};

describe("usersFormatters", () => {
  describe("getRoleBadgeVariant", () => {
    it("reconoce admin y cajero sin distinguir mayusculas ni espacios", () => {
      expect(getRoleBadgeVariant("admin")).toBe("admin");
      expect(getRoleBadgeVariant(" ADMIN ")).toBe("admin");
      expect(getRoleBadgeVariant("Cajero")).toBe("cashier");
    });

    it("degrada a unknown con rol ausente o desconocido", () => {
      expect(getRoleBadgeVariant(null)).toBe("unknown");
      expect(getRoleBadgeVariant("gerente")).toBe("unknown");
    });
  });

  describe("getStatusBadgeVariant", () => {
    it("solo reconoce los booleanos explicitos", () => {
      expect(getStatusBadgeVariant(true)).toBe("active");
      expect(getStatusBadgeVariant(false)).toBe("inactive");
      expect(getStatusBadgeVariant(null)).toBe("unknown");
      expect(getStatusBadgeVariant(1)).toBe("unknown");
    });
  });

  describe("getRoleLabel", () => {
    it("traduce a las etiquetas de la tabla", () => {
      expect(getRoleLabel("admin")).toBe("ADMIN");
      expect(getRoleLabel("cajero")).toBe("CAJERO");
      expect(getRoleLabel("otro")).toBe("SIN ROL");
    });
  });

  describe("getStatusLabel", () => {
    it("traduce el estado a etiquetas en mayusculas", () => {
      expect(getStatusLabel(true)).toBe("ACTIVO");
      expect(getStatusLabel(false)).toBe("INACTIVO");
      expect(getStatusLabel(null)).toBe("SIN ESTADO");
    });
  });

  describe("getUserInitials", () => {
    it("usa la primera y la ultima palabra del nombre completo", () => {
      expect(getUserInitials("Ana Maria Lopez", "ana")).toBe("AL");
    });

    it("usa las dos primeras letras de una sola palabra", () => {
      expect(getUserInitials("Carlos", "carlos")).toBe("CA");
    });

    it("recurre al username cuando no hay nombre", () => {
      expect(getUserInitials("", "valeria")).toBe("VA");
      expect(getUserInitials("   ", "juan")).toBe("JU");
    });

    it("devuelve un comodin cuando no hay ninguna fuente", () => {
      expect(getUserInitials(null, null)).toBe("?");
    });
  });

  describe("getUserDisplayName", () => {
    it("prefiere el nombre completo y cae al username", () => {
      expect(getUserDisplayName({ name: "Ana Maria", username: "ana" })).toBe(
        "Ana Maria"
      );
      expect(getUserDisplayName({ name: "   ", username: "ana" })).toBe("ana");
    });

    it("degrada cuando no hay nombre ni username", () => {
      expect(getUserDisplayName({})).toBe("SIN USUARIO");
    });
  });

  describe("formatUserDate", () => {
    it("formatea la fecha en es-ES", () => {
      expect(formatUserDate("2026-01-05T10:00:00.000Z")).toContain("2026");
    });

    it("devuelve etiquetas seguras para valores ausentes o invalidos", () => {
      expect(formatUserDate(null)).toBe("N/A");
      expect(formatUserDate("no-es-fecha")).toBe("Fecha no válida");
    });
  });

  describe("clases de badges", () => {
    it("mapea el rol y el estado a su clase de modulo", () => {
      expect(getRoleBadgeClass("admin", STYLES)).toBe("roleBadgeAdmin");
      expect(getRoleBadgeClass("cajero", STYLES)).toBe("roleBadgeCashier");
      expect(getRoleBadgeClass("otro", STYLES)).toBe("roleBadgeUnknown");
      expect(getStatusBadgeClass(true, STYLES)).toBe("statusBadgeActive");
      expect(getStatusBadgeClass(false, STYLES)).toBe("statusBadgeInactive");
      expect(getStatusBadgeClass(null, STYLES)).toBe("statusBadgeUnknown");
    });

    it("no revienta si no se recibe el objeto de estilos", () => {
      expect(getRoleBadgeClass("admin", undefined)).toBe("");
      expect(getStatusBadgeClass(true, undefined)).toBe("");
    });
  });
});
