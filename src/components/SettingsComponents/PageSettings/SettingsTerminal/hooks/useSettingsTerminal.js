import { useEffect, useState, useCallback, useRef } from "react";
import { fetchDeviceCode, readZoomFactor, applyZoomFactor, resetZoom } from "../../../../../services/terminalSettingsService";
import { fetchActiveCashSession } from "../../../../../services/cashRegisterService";
import { getTerminalAlias, saveTerminalAlias } from "../services/terminalAliasService";
import { runDiagnostics, checkOnlineStatus } from "../services/terminalDiagnosticsService";
import { fetchBranchProfile } from "../services/branchProfileService";
import { useAuth } from "../../../../../contexts/AuthContext";
import { checkUserIsAdmin } from "../../../../../lib/permissionsService";

const DEFAULT_ZOOM_CHIPS = [0.8, 0.9, 1.0, 1.1, 1.25, 1.5];

const hasElectronBridge = () =>
  typeof window !== "undefined" &&
  typeof window.electronAPI?.invoke === "function";

export const useSettingsTerminal = (branch) => {
  const { user } = useAuth();
  const [device, setDevice] = useState({ status: "loading", code: null });
  const [connection, setConnection] = useState("checking");
  const [zoomFactor, setZoomFactor] = useState(1);
  const [zoomFeedback, setZoomFeedback] = useState(null);
  const [branchProfile, setBranchProfile] = useState(null);
  const [cashSession, setCashSession] = useState(null);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [diagnostics, setDiagnostics] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [alias, setAlias] = useState(null);
  const [aliasLoading, setAliasLoading] = useState(false);
  const [aliasSaving, setAliasSaving] = useState(false);
  const [aliasFeedback, setAliasFeedback] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fullscreen, setFullscreen] = useState(() => (typeof document !== "undefined" ? !!document.fullscreenElement : false));
  const [localStorageSize, setLocalStorageSize] = useState(0);
  const [screenInfo, setScreenInfo] = useState({
    width: typeof window !== "undefined" ? window.screen?.width : null,
    height: typeof window !== "undefined" ? window.screen?.height : null,
    innerWidth: typeof window !== "undefined" ? window.innerWidth : null,
    innerHeight: typeof window !== "undefined" ? window.innerHeight : null,
    dpr: typeof window !== "undefined" ? window.devicePixelRatio : 1,
  });
  const mountedRef = useRef(true);

  const clearFeedbacks = useCallback(() => {
    setZoomFeedback(null);
    setAliasFeedback(null);
    setCopyFeedback(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user?.id) {
      checkUserIsAdmin(user.id).then((result) => {
        if (mountedRef.current) setIsAdmin(result);
      });
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    fetchDeviceCode().then((result) => {
      if (cancelled || !mountedRef.current) return;
      setDevice({
        status: result.success ? "ready" : "error",
        code: result.deviceCode,
      });
    });

    readZoomFactor().then((result) => {
      if (cancelled || !mountedRef.current) return;
      if (result.success && result.zoomFactor != null) {
        setZoomFactor(result.zoomFactor);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!branch?.id) return;

    fetchBranchProfile(branch.id).then((result) => {
      if (mountedRef.current) {
        setBranchProfile(result.success ? result.data : null);
      }
    });

    fetchActiveCashSession(branch.id).then((result) => {
      if (mountedRef.current) {
        setCashSession(result.success ? result.data : null);
      }
    });
  }, [branch?.id]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleResize = () => {
      setScreenInfo({
        width: window.screen?.width,
        height: window.screen?.height,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        dpr: window.devicePixelRatio,
      });
    };
    const handleFullscreen = () => {
      setFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleFullscreen);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleFullscreen);
    };
  }, []);

  useEffect(() => {
    runDiagnostics().then((result) => {
      if (mountedRef.current) {
        setDiagnostics(result);
        setConnection(result.overallOk ? "online" : "offline");
      }
    });
  }, []);

  useEffect(() => {
    if (device.code) {
      setAliasLoading(true);
      getTerminalAlias(device.code).then((result) => {
        if (mountedRef.current) {
          setAlias(result.alias);
          setAliasLoading(false);
        }
      });
    }
  }, [device.code]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      let total = 0;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        const value = key ? window.localStorage.getItem(key) : "";
        total += (key?.length || 0) + (value?.length || 0);
      }
      setLocalStorageSize(total);
    }
  }, []);

  const handleZoomChange = useCallback(async (delta) => {
    clearFeedbacks();
    const result = await applyZoomFactor(zoomFactor + delta);
    if (!mountedRef.current) return;
    if (!result.success) {
      setZoomFeedback({ type: "error", message: result.error });
      return;
    }
    setZoomFactor(result.zoomFactor);
    setZoomFeedback({
      type: "success",
      message: `Zoom de la ventana: ${Math.round(result.zoomFactor * 100)}%.`,
    });
  }, [zoomFactor, clearFeedbacks]);

  const handleZoomSet = useCallback(async (factor) => {
    clearFeedbacks();
    const result = await applyZoomFactor(factor);
    if (!mountedRef.current) return;
    if (!result.success) {
      setZoomFeedback({ type: "error", message: result.error });
      return;
    }
    setZoomFactor(result.zoomFactor);
    setZoomFeedback({
      type: "success",
      message: `Zoom de la ventana: ${Math.round(result.zoomFactor * 100)}%.`,
    });
  }, [clearFeedbacks]);

  const handleZoomReset = useCallback(async () => {
    clearFeedbacks();
    const result = await resetZoom();
    if (!mountedRef.current) return;
    if (!result.success) {
      setZoomFeedback({ type: "error", message: result.error });
      return;
    }
    setZoomFactor(result.zoomFactor);
    setZoomFeedback({
      type: "success",
      message: "Zoom de la ventana restablecido.",
    });
  }, [clearFeedbacks]);

  const handleReconnect = useCallback(async () => {
    setConnection("checking");
    const result = await runDiagnostics();
    if (mountedRef.current) {
      setDiagnostics(result);
      setConnection(result.overallOk ? "online" : "offline");
      setIsOnline(checkOnlineStatus());
    }
  }, []);

  const handleRunDiagnostics = useCallback(async () => {
    setDiagnosticsLoading(true);
    clearFeedbacks();
    const result = await runDiagnostics();
    if (mountedRef.current) {
      setDiagnostics(result);
      setDiagnosticsLoading(false);
      setIsOnline(checkOnlineStatus());
      setConnection(result.overallOk ? "online" : "offline");
    }
  }, [clearFeedbacks]);

  const handleSaveAlias = useCallback(async (newAlias) => {
    if (!device.code) return;
    setAliasSaving(true);
    clearFeedbacks();
    const result = await saveTerminalAlias(device.code, newAlias);
    if (mountedRef.current) {
      if (result.success) {
        setAlias(result.alias);
        setAliasFeedback({ type: "success", message: "Alias guardado correctamente." });
      } else {
        setAlias(result.alias);
        setAliasFeedback({ type: "error", message: result.error || "Error al guardar alias." });
      }
      setAliasSaving(false);
    }
  }, [device.code, clearFeedbacks]);

  const handleCopyDeviceCode = useCallback(async () => {
    if (!device.code) return;
    clearFeedbacks();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(device.code);
      }
      setCopyFeedback({ type: "success", message: "Código copiado al portapapeles" });
    } catch (error) {
      setCopyFeedback({ type: "error", message: "Error al copiar código" });
    }
  }, [device.code, clearFeedbacks]);

  const handleToggleFullscreen = useCallback(async () => {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch (error) {
      setZoomFeedback({ type: "error", message: "Error al cambiar modo pantalla completa" });
    }
  }, []);

  const handleClearLocalStorage = useCallback(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    const protectedKeys = [
      "supabase.auth.token",
      "device_code",
      "cashAmount",
      "isLocked",
      "cashRegistered",
      "cachedUsername",
      "sb-crokets-pos-auth-token",
    ];
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && !protectedKeys.includes(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    let total = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      const value = key ? window.localStorage.getItem(key) : "";
      total += (key?.length || 0) + (value?.length || 0);
    }
    setLocalStorageSize(total);
  }, []);

  const handleReload = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const handleCloseApp = useCallback(async () => {
    if (hasElectronBridge()) {
      try {
        await window.electronAPI.invoke("close-app");
      } catch (error) {
        console.error("Error cerrando aplicación:", error);
      }
    }
  }, []);

  return {
    device,
    connection,
    zoomFactor,
    zoomFeedback,
    branchProfile,
    cashSession,
    isOnline,
    diagnostics,
    diagnosticsLoading,
    alias,
    aliasLoading,
    aliasSaving,
    aliasFeedback,
    copyFeedback,
    isAdmin,
    fullscreen,
    localStorageSize,
    screenInfo,
    zoomChips: DEFAULT_ZOOM_CHIPS,
    hasElectronBridge: hasElectronBridge(),
    handleZoomChange,
    handleZoomSet,
    handleZoomReset,
    handleReconnect,
    handleRunDiagnostics,
    handleSaveAlias,
    handleCopyDeviceCode,
    handleToggleFullscreen,
    handleClearLocalStorage,
    handleReload,
    handleCloseApp,
    clearFeedbacks,
  };
};
