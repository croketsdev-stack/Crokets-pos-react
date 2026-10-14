import { useEffect, useRef } from "react";

import { subscribeToTransferChanges } from "../services/transfersRealtimeService";

const REALTIME_DEBOUNCE_MS = 500;
const FALLBACK_REFRESH_INTERVAL_MS = 30000;

/**
 * Hook que suscribe la pantalla de Traspasos a cambios en tiempo real de las
 * tablas `inventory_transfers` e `inventory_transfer_items`, con debounce y
 * polling de respaldo.
 *
 * Reemplaza el setInterval de 10s que existia antes del refactor, alineando
 * el modulo al patron *RealtimeService + use*Realtime del repo.
 *
 * @param {object} params
 * @param {string} params.branchId Sucursal activa.
 * @param {Function} params.refreshOrdersSilently Recarga las ordenes sin spinners.
 * @param {Function} [params.refreshProductsSilently] Recarga el catalogo sin spinners.
 * @param {boolean} [params.enabled=true] Habilita/deshabilita la suscripcion.
 */
const useTransfersRealtime = ({
  branchId,
  refreshOrdersSilently,
  refreshProductsSilently,
  enabled = true,
}) => {
  const refreshTimerRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const refreshOrdersRef = useRef(refreshOrdersSilently);
  const refreshProductsRef = useRef(refreshProductsSilently);

  useEffect(() => {
    refreshOrdersRef.current = refreshOrdersSilently;
  }, [refreshOrdersSilently]);

  useEffect(() => {
    refreshProductsRef.current = refreshProductsSilently;
  }, [refreshProductsSilently]);

  useEffect(() => {
    if (
      !enabled ||
      !branchId ||
      typeof refreshOrdersRef.current !== "function"
    ) {
      return undefined;
    }

    const refreshSafely = () => {
      const productsPromise =
        typeof refreshProductsRef.current === "function"
          ? refreshProductsRef.current()
          : Promise.resolve();

      return Promise.all([refreshOrdersRef.current(), productsPromise]).catch(
        (error) => {
          console.error("Error refrescando traspasos en tiempo real:", error);
        }
      );
    };

    const queueRefresh = () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }

      refreshTimerRef.current = window.setTimeout(() => {
        refreshTimerRef.current = null;
        refreshSafely();
      }, REALTIME_DEBOUNCE_MS);
    };

    const unsubscribe = subscribeToTransferChanges({
      branchId,
      channelName: `transfers-realtime-${branchId}`,
      onChange: queueRefresh,
    });

    pollingIntervalRef.current = window.setInterval(() => {
      refreshSafely();
    }, FALLBACK_REFRESH_INTERVAL_MS);

    return () => {
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }

      if (pollingIntervalRef.current) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      unsubscribe();
    };
  }, [branchId, enabled]);
};

export default useTransfersRealtime;
