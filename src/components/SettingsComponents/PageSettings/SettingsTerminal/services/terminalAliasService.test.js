import { describe, it, expect, beforeEach, vi } from "vitest";
import { getTerminalAlias, saveTerminalAlias, deleteTerminalAlias } from "./terminalAliasService";

const { supabase } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  return { supabase: { from: mockFrom } };
});

vi.mock("../../../../../lib/supabaseClient", () => ({
  supabase,
}));

describe("terminalAliasService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.window = { localStorage };
  });

  describe("getTerminalAlias", () => {
    it("returns error when no deviceCode", async () => {
      const result = await getTerminalAlias(null);
      expect(result.success).toBe(false);
    });

    it("gets from supabase", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { value: { alias: "Caja 1" }, value_type: "json" },
          error: null,
        }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await getTerminalAlias("dev123");
      expect(result.success).toBe(true);
      expect(result.alias).toBe("Caja 1");
      expect(result.source).toBe("supabase");
    });

    it("falls back to localStorage on supabase error", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: "err" } }),
      };
      supabase.from.mockReturnValue(mockQuery);
      localStorage.setItem("terminal_alias_dev123", "Caja Local");

      const result = await getTerminalAlias("dev123");
      expect(result.success).toBe(true);
      expect(result.alias).toBe("Caja Local");
      expect(result.source).toBe("localStorage");
    });

    it("returns null when not found anywhere", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await getTerminalAlias("dev123");
      expect(result.success).toBe(true);
      expect(result.alias).toBe(null);
    });
  });

  describe("saveTerminalAlias", () => {
    it("returns error when empty", async () => {
      const result = await saveTerminalAlias("dev123", "   ");
      expect(result.success).toBe(false);
    });

    it("saves to supabase and localStorage", async () => {
      const mockQuery = {
        upsert: vi.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await saveTerminalAlias("dev123", "Caja 2");
      expect(result.success).toBe(true);
      expect(result.alias).toBe("Caja 2");
      expect(result.source).toBe("supabase");
      expect(localStorage.getItem("terminal_alias_dev123")).toBe("Caja 2");
    });

    it("falls back to localStorage when supabase fails", async () => {
      const mockQuery = {
        upsert: vi.fn().mockResolvedValue({ error: { message: "fail" } }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await saveTerminalAlias("dev123", "Caja 3");
      expect(result.success).toBe(false);
      expect(result.source).toBe("localStorage");
      expect(localStorage.getItem("terminal_alias_dev123")).toBe("Caja 3");
    });
  });

  describe("deleteTerminalAlias", () => {
    it("deletes from both", async () => {
      const mockQuery = {
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      };
      supabase.from.mockReturnValue(mockQuery);
      localStorage.setItem("terminal_alias_dev123", "Caja");

      const result = await deleteTerminalAlias("dev123");
      expect(result.success).toBe(true);
      expect(localStorage.getItem("terminal_alias_dev123")).toBe(null);
    });
  });
});
