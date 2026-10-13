import { useEffect, useState, useCallback, useRef } from "react";
import {
  fetchDeviceCode,
  readZoomFactor,
  applyZoomFactor,
  resetZoom,
} from "../../../../../services/terminalSettingsService";
import { fetchActiveCashSession } from "../../../../../services/cashRegisterService";
import {
  runDiagnostics,
  checkOnlineStatus,
} from "../services/terminalDiagnosticsService";
import { fetchBranchProfile } from "../services/branchProfileService";
import {
  ZOOM_STEPS,
  findNextZoomStep,
  isProtectedStorageKey,
  getLocalStorageSize,
} from "../utils/terminalHelpers";
import { useAuth } from "../../../../../contexts/AuthContext";
import { checkUserIsAdmin } from "../../../../../lib/permissionsService";

const hasElectronBridge = () =>
  typeof window !== "undefined" &&
  typeof window.electronAPI?.invoke === "function";

export const useSettingsTerminal = (branch) => {
  const { user } = useAuth();
  const branchId = branch?.id;
  const [device, setDevice] = useState({ status: "loading", code: null });
  const [connection, setConnection] = useState("checking");
  const [zoomFactor, setZoomFactor] = useState(1);
  const [zoomFeedback, setZoomFeedback] = useState(null);
  const [branchProfile, setBranchProfile] = useState(null);
  const [cashSession, setCashSession] = useState(null);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [diagnostics, setDiagnostics] = useState(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [fullscreen, setFullscreen] = useState(() =>
    typeof document !== "undefined" ? !!document.fullscreenElement : false
  );
  const [fullscreenFeedback, setFullscreenFeedback] = useState(null);
  const [localStorageSize, setLocalStorageSize] = useState(getLocalStorageSize);
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
    setCopyFeedback(null);
    setFullscreenFeedback(null);
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

  const loadBranchProfile = useCallback(async (branchId) => {
    if (!branchId) return;
    const result = await fetchBranchProfile(branchId);
    if (mountedRef.current) {
      setBranchProfile(result.success ? result.data : null);
    }
  }, []);

  useEffect(() => {
    if (!branchId) return;

    loadBranchProfile(branchId);

    fetchActiveCashSession(branchId).then((result) => {
      if (mountedRef.current) {
        setCashSession(result.success ? result.data : null);
      }
    });
  }, [branchId, loadBranchProfile]);

  const refreshBranchProfile = useCallback(() => {
    if (branchId) {
      loadBranchProfile(branchId);
    }
  }, [branchId, loadBranchProfile]);

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

  const handleZoomChange = useCallback(
    async (direction) => {
      clearFeedbacks();
      const nextFactor = findNextZoomStep(zoomFactor, direction);
      if (Math.abs(nextFactor - zoomFactor) < 0.001) {
        setZoomFeedback({
          type: "success",
          message: `Zoom de la ventana: ${Math.round(zoomFactor * 100)}%.`,
        });
        return;
      }
      const result = await applyZoomFactor(nextFactor);
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
    },
    [zoomFactor, clearFeedbacks]
  );

  const handleZoomSet = useCallback(
    async (factor) => {
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
    },
    [clearFeedbacks]
  );

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

  const handleCopyDeviceCode = useCallback(async () => {
    if (!device.code) return;
    clearFeedbacks();
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(device.code);
      }
      setCopyFeedback({
        type: "success",
        message: "Código copiado al portapapeles",
      });
    } catch (error) {
      console.error("Error al copiar el código del dispositivo:", error);
      setCopyFeedback({ type: "error", message: "Error al copiar código" });
    }
  }, [device.code, clearFeedbacks]);

  const handleToggleFullscreen = useCallback(async () => {
    setFullscreenFeedback(null);
    try {
      if (hasElectronBridge()) {
        const result = await window.electronAPI.invoke("toggle-fullscreen");
        if (mountedRef.current && result) {
          setFullscreen(!!result.fullscreen);
        }
        return;
      }

      if (typeof document === "undefined") return;

      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch (error) {
      console.error("Error al cambiar modo pantalla completa:", error);
      setFullscreenFeedback({
        type: "error",
        message:
          "No se pudo cambiar el modo de pantalla completa. Si la aplicación se actualizó recientemente, reinicie la ventana de escritorio.",
      });
    }
  }, []);

  const handleClearLocalStorage = useCallback(() => {
    if (typeof window === "undefined" || !window.localStorage) return;
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && !isProtectedStorageKey(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    setLocalStorageSize(getLocalStorageSize());
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
    copyFeedback,
    isAdmin,
    fullscreen,
    fullscreenFeedback,
    localStorageSize,
    screenInfo,
    zoomChips: ZOOM_STEPS,
    hasElectronBridge: hasElectronBridge(),
    handleZoomChange,
    handleZoomSet,
    handleZoomReset,
    handleRunDiagnostics,
    handleCopyDeviceCode,
    handleToggleFullscreen,
    handleClearLocalStorage,
    handleReload,
    handleCloseApp,
    refreshBranchProfile,
    clearFeedbacks,
  };
};
