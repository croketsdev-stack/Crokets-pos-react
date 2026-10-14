import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { loadCashOperationSettings } from "../services/cashOperationSettingsService";

const BranchContext = createContext(null);
const BRANCH_STORAGE_KEY = "currentBranch";

const readCachedBranch = () => {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const cached = window.localStorage.getItem(BRANCH_STORAGE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

export function BranchProvider({ children }) {
  const [branch, setBranchState] = useState(readCachedBranch);
  const branchId = branch?.id ?? null;

  // Hidrata en segundo plano la configuracion operativa de caja de la sucursal
  // activa para que las vistas de cobro usen los valores remotos sin depender
  // de entrar a /settings/caja. Es no bloqueante: si Supabase falla, la cache
  // local sigue operando y el renderizado no se interrumpe.
  useEffect(() => {
    if (!branchId) return;

    loadCashOperationSettings({ branchId }).catch((err) => {
      console.error(
        "Error hidratando la configuración de caja de la sucursal:",
        err
      );
    });
  }, [branchId]);

  const setBranch = useCallback((nextBranch) => {
    setBranchState(nextBranch);
    try {
      if (typeof window === "undefined" || !window.localStorage) return;
      if (nextBranch) {
        window.localStorage.setItem(
          BRANCH_STORAGE_KEY,
          JSON.stringify(nextBranch)
        );
      } else {
        window.localStorage.removeItem(BRANCH_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Error guardando sucursal en localStorage:", err);
    }
  }, []);

  const value = useMemo(() => ({ branch, setBranch }), [branch, setBranch]);

  return (
    <BranchContext.Provider value={value}>{children}</BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx)
    throw new Error("useBranch debe usarse dentro de <BranchProvider />");
  return ctx;
}
