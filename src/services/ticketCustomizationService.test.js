import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../lib/supabaseClient", () => {
  const mockSupabase = {
    from: vi.fn(),
  };
  return { supabase: mockSupabase };
});

import {
  getTicketCustomization,
  saveTicketCustomization,
  DEFAULT_TICKET_CUSTOMIZATION,
} from "./ticketCustomizationService";
import { supabase } from "../lib/supabaseClient";

const buildQueryChain = (result = {}) => {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    is: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
    update: vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) })),
    insert: vi.fn(async () => ({ error: null })),
  };
  return query;
};

describe("ticketCustomizationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("Obtención de plantilla desde Supabase system_settings.", async () => {
    const stored = { ...DEFAULT_TICKET_CUSTOMIZATION, footerLine1: "Gracias" };
    const query = buildQueryChain({
      data: {
        id: "1",
        setting_key: "ticket_customization",
        setting_value: JSON.stringify(stored),
        value_type: "json",
        branch_id: null,
      },
      error: null,
    });
    supabase.from.mockReturnValue(query);

    const result = await getTicketCustomization({ branchId: null });
    expect(supabase.from).toHaveBeenCalledWith("system_settings");
    expect(result.footerLine1).toBe("Gracias");
  });

  it("Fallback a valores por defecto y a caché local ante error de red.", async () => {
    const query = buildQueryChain({
      data: null,
      error: { message: "network" },
    });
    supabase.from.mockReturnValue(query);
    const result = await getTicketCustomization({ branchId: null });
    expect(result).toEqual(DEFAULT_TICKET_CUSTOMIZATION);
  });

  it("usa la caché local cuando no hay registro guardado en Supabase", async () => {
    const cached = {
      ...DEFAULT_TICKET_CUSTOMIZATION,
      headerSlogan: "Cuidamos a tu mejor amigo",
      footerLine2: "",
    };
    window.localStorage.setItem(
      "settings_ticket_template_cache",
      JSON.stringify(cached)
    );
    const query = buildQueryChain({ data: null, error: null });
    supabase.from.mockReturnValue(query);

    const result = await getTicketCustomization({ branchId: null });

    expect(result.headerSlogan).toBe("Cuidamos a tu mejor amigo");
    expect(result.footerLine2).toBe("");
  });

  it("actualiza el registro existente y refresca la caché local", async () => {
    const query = buildQueryChain({
      data: { id: "setting-9" },
      error: null,
    });
    supabase.from.mockReturnValue(query);

    const saved = await saveTicketCustomization({
      branchId: 2,
      template: {
        headerSlogan: "Nuevo slogan",
        showCustomerPoints: false,
        showBranchPhone: true,
      },
    });

    expect(saved.headerSlogan).toBe("Nuevo slogan");
    expect(saved.showCustomerPoints).toBe(false);
    expect(saved.showBranchPhone).toBe(true);
    expect(supabase.from).toHaveBeenNthCalledWith(2, "system_settings");
    const cached = JSON.parse(
      window.localStorage.getItem("settings_ticket_template_cache")
    );
    expect(cached.headerSlogan).toBe("Nuevo slogan");
  });

  it("inserta un registro nuevo con el branch_id de la sucursal", async () => {
    const query = buildQueryChain({ data: null, error: null });
    supabase.from.mockReturnValue(query);

    const saved = await saveTicketCustomization({
      branchId: 7,
      template: { footerLine1: "Gracias por todo" },
    });

    expect(saved.footerLine1).toBe("Gracias por todo");
    expect(supabase.from).toHaveBeenNthCalledWith(2, "system_settings");
    expect(query.insert).toHaveBeenCalled();
    const insertedRow = query.insert.mock.calls[0][0][0];
    expect(insertedRow.branch_id).toBe(7);
    expect(insertedRow.setting_key).toBe("ticket_customization");
    const cached = JSON.parse(
      window.localStorage.getItem("settings_ticket_template_cache")
    );
    expect(cached.footerLine1).toBe("Gracias por todo");
  });

  it("Guardado correcto de configuración (insert/update).", async () => {
    const query = buildQueryChain({ data: null, error: null });
    supabase.from.mockReturnValue(query);
    const saved = await saveTicketCustomization({
      branchId: null,
      template: { footerLine1: "OK" },
    });
    expect(saved.footerLine1).toBe("OK");
  });
});
