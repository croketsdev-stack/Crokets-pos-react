/**
 * Formateadores puros para datos de terminal y conectividad
 */

export const formatMilliseconds = (ms) => {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) {
    return "N/A";
  }

  const value = Math.round(ms);
  if (value < 1000) {
    return `${value} ms`;
  }

  return `${(value / 1000).toFixed(1)} s`;
};

export const formatBytes = (bytes) => {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes)) {
    return "0 B";
  }

  const size = Math.round(bytes);
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatResolution = (width, height) => {
  if (
    !width ||
    !height ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return "N/A";
  }

  return `${Math.round(width)} × ${Math.round(height)} px`;
};

export const formatDpr = (dpr) => {
  if (!dpr || !Number.isFinite(dpr)) {
    return "1.0";
  }

  return dpr.toFixed(1);
};

export const getLatencyLevel = (latencyMs) => {
  if (
    latencyMs === null ||
    latencyMs === undefined ||
    !Number.isFinite(latencyMs)
  ) {
    return "disconnected";
  }

  if (latencyMs < 150) {
    return "excellent";
  }

  if (latencyMs < 350) {
    return "acceptable";
  }

  return "slow";
};
