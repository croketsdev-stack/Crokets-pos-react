import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  measureLatencyToSupabase,
  checkOnlineStatus,
  checkElectronBridge,
  runDiagnostics,
} from "./terminalDiagnosticsService";

const { supabase } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  return { supabase: { from: mockFrom } };
});

vi.mock("../../../../../lib/supabaseClient", () => ({
  supabase,
}));

describe("terminalDiagnosticsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const nav = { onLine: true };
    if (typeof global.navigator === "undefined") {
      global.navigator = nav;
    } else {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        configurable: true,
        value: true,
      });
    }
    if (typeof global.window === "undefined") {
      global.window = {};
    }
    global.window.electronAPI = { invoke: vi.fn() };
    if (typeof global.performance === "undefined") {
      global.performance = {
        now: vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(100),
      };
    } else {
      Object.defineProperty(global, "performance", {
        writable: true,
        configurable: true,
        value: { now: vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(100) },
      });
    }
  });

  describe("measureLatencyToSupabase", () => {
    it("measures latency successfully", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        abortSignal: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await measureLatencyToSupabase();
      expect(result.success).toBe(true);
      expect(result.connected).toBe(true);
      expect(result.latencyMs).toBe(100);
    });

    it("handles timeout", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        abortSignal: vi.fn().mockImplementation(async (signal) => {
          return new Promise((_, reject) => {
            signal.addEventListener("abort", () => {
              const error = new Error("aborted");
              error.name = "AbortError";
              reject(error);
            });
          });
        }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await measureLatencyToSupabase(10);
      expect(result.success).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toBe("Tiempo de espera agotado");
    });

    it("handles other errors", async () => {
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        abortSignal: vi
          .fn()
          .mockResolvedValue({ data: null, error: { message: "fail" } }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await measureLatencyToSupabase();
      expect(result.success).toBe(false);
      expect(result.connected).toBe(false);
      expect(result.error).toBe("fail");
    });
  });

  describe("checkOnlineStatus", () => {
    it("returns navigator.onLine", () => {
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        configurable: true,
        value: false,
      });
      expect(checkOnlineStatus()).toBe(false);
      Object.defineProperty(navigator, "onLine", {
        writable: true,
        configurable: true,
        value: true,
      });
      expect(checkOnlineStatus()).toBe(true);
    });

    it("returns true if navigator not available", () => {
      delete global.navigator;
      expect(checkOnlineStatus()).toBe(true);
    });
  });

  describe("checkElectronBridge", () => {
    it("checks bridge", () => {
      global.window = { electronAPI: { invoke: vi.fn() } };
      expect(checkElectronBridge()).toBe(true);
      global.window = {};
      expect(checkElectronBridge()).toBe(false);
    });
  });

  describe("runDiagnostics", () => {
    it("runs full diagnostics", async () => {
      global.performance = {
        now: vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(50),
      };
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        abortSignal: vi.fn().mockResolvedValue({ data: [], error: null }),
      };
      supabase.from.mockReturnValue(mockQuery);

      const result = await runDiagnostics();
      expect(result.success).toBe(true);
      expect(result.overallOk).toBe(true);
      expect(result.services.length).toBe(4);
    });
  });
});
