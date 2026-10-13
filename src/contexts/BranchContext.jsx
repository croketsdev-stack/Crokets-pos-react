import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

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
