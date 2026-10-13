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
