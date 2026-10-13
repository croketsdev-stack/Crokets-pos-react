import { describe, it, expect } from "vitest";
import {
  formatMilliseconds,
  formatBytes,
  formatResolution,
  formatDpr,
  getLatencyLevel,
} from "./terminalFormatters";

describe("terminalFormatters", () => {
  describe("formatMilliseconds", () => {
    it("format ms correctly", () => {
      expect(formatMilliseconds(45)).toBe("45 ms");
      expect(formatMilliseconds(150)).toBe("150 ms");
      expect(formatMilliseconds(350)).toBe("350 ms");
    });

    it("format seconds when >= 1000", () => {
      expect(formatMilliseconds(1200)).toBe("1.2 s");
      expect(formatMilliseconds(1000)).toBe("1.0 s");
    });

    it("handles invalid values", () => {
      expect(formatMilliseconds(null)).toBe("N/A");
      expect(formatMilliseconds(undefined)).toBe("N/A");
      expect(formatMilliseconds(NaN)).toBe("N/A");
      expect(formatMilliseconds(Infinity)).toBe("N/A");
    });
  });

  describe("formatBytes", () => {
    it("format bytes", () => {
      expect(formatBytes(120)).toBe("120 B");
    });

    it("format KB", () => {
      expect(formatBytes(120 * 1024)).toBe("120.0 KB");
      expect(formatBytes(1536)).toBe("1.5 KB");
    });

    it("format MB", () => {
      expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
      expect(formatBytes(1.4 * 1024 * 1024)).toBe("1.4 MB");
    });

    it("handles invalid values", () => {
      expect(formatBytes(null)).toBe("0 B");
      expect(formatBytes(undefined)).toBe("0 B");
      expect(formatBytes(NaN)).toBe("0 B");
    });
  });

  describe("formatResolution", () => {
    it("format resolution", () => {
      expect(formatResolution(1920, 1080)).toBe("1920 × 1080 px");
    });

    it("handles invalid values", () => {
      expect(formatResolution(null, 1080)).toBe("N/A");
      expect(formatResolution(1920, null)).toBe("N/A");
      expect(formatResolution(NaN, 1080)).toBe("N/A");
    });
  });

  describe("formatDpr", () => {
    it("format dpr", () => {
      expect(formatDpr(1)).toBe("1.0");
      expect(formatDpr(1.5)).toBe("1.5");
      expect(formatDpr(2)).toBe("2.0");
    });

    it("handles invalid values", () => {
      expect(formatDpr(null)).toBe("1.0");
      expect(formatDpr(undefined)).toBe("1.0");
      expect(formatDpr(NaN)).toBe("1.0");
    });
  });

  describe("getLatencyLevel", () => {
    it("classifies latency", () => {
      expect(getLatencyLevel(50)).toBe("excellent");
      expect(getLatencyLevel(150)).toBe("acceptable");
      expect(getLatencyLevel(250)).toBe("acceptable");
      expect(getLatencyLevel(350)).toBe("slow");
      expect(getLatencyLevel(500)).toBe("slow");
    });

    it("handles disconnected", () => {
      expect(getLatencyLevel(null)).toBe("disconnected");
      expect(getLatencyLevel(undefined)).toBe("disconnected");
      expect(getLatencyLevel(NaN)).toBe("disconnected");
    });
  });
});
