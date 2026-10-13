import { useState } from "react";
import { useBranch } from "../../../../contexts/BranchContext";
import { useAuth } from "../../../../contexts/AuthContext";
import { useSettingsTerminal } from "./hooks/useSettingsTerminal";
import { updateBranchContact } from "./services/branchProfileService";
import styles from "./SettingsTerminal.module.css";
import BranchInfoCard from "./components/BranchInfoCard";
import BranchEditModal from "./components/BranchEditModal";
import TerminalDeviceCard from "./components/TerminalDeviceCard";
import ConnectivityStatusCard from "./components/ConnectivityStatusCard";
import DisplaySettingsCard from "./components/DisplaySettingsCard";
import TerminalMaintenanceCard from "./components/TerminalMaintenanceCard";

const SettingsTerminal = () => {
  const { branch } = useBranch();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingBranch, setSavingBranch] = useState(false);
  const [branchUpdateFeedback, setBranchUpdateFeedback] = useState(null);

  const {
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
    zoomChips,
    hasElectronBridge,
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
  } = useSettingsTerminal(branch);

  const handleOpenEdit = () => {
    setIsEditModalOpen(true);
    setBranchUpdateFeedback(null);
    clearFeedbacks();
  };

  const handleCloseEdit = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveBranch = async (updates) => {
    if (!branch?.id) return;
    setSavingBranch(true);
    const result = await updateBranchContact(branch.id, updates);
    if (result.success) {
      setBranchUpdateFeedback({ type: "success", message: "Datos de sucursal actualizados correctamente." });
      setIsEditModalOpen(false);
      window.location.reload();
    } else {
      setBranchUpdateFeedback({ type: "error", message: result.error || "Error al actualizar sucursal." });
    }
    setSavingBranch(false);
  };

  return (
    <section className={styles.page} aria-labelledby="settings-terminal-title">
      <header className={styles.pageHeader}>
        <h1 id="settings-terminal-title" className={styles.pageTitle}>
          Terminal y Sucursal
        </h1>
        <p className={styles.pageSubtitle}>
          Configuración operativa de la terminal, sucursal y conectividad
        </p>
      </header>

      {branchUpdateFeedback?.type === "success" && (
        <p role="status" className={styles.statusMessage}>
          {branchUpdateFeedback.message}
        </p>
      )}
      {branchUpdateFeedback?.type === "error" && (
        <p role="alert" className={styles.errorMessage}>
          {branchUpdateFeedback.message}
        </p>
      )}

      <div className={styles.grid}>
        <BranchInfoCard
          branch={branch}
          branchProfile={branchProfile}
          isAdmin={isAdmin}
          onEdit={handleOpenEdit}
        />
        <TerminalDeviceCard
          device={device}
          alias={alias}
          aliasLoading={aliasLoading}
          aliasSaving={aliasSaving}
          aliasFeedback={aliasFeedback}
          copyFeedback={copyFeedback}
          cashSession={cashSession}
          onSaveAlias={handleSaveAlias}
          onCopyDeviceCode={handleCopyDeviceCode}
        />
        <ConnectivityStatusCard
          isOnline={isOnline}
          diagnostics={diagnostics}
          diagnosticsLoading={diagnosticsLoading}
          connection={connection}
          onRunDiagnostics={handleRunDiagnostics}
        />
        <DisplaySettingsCard
          zoomFactor={zoomFactor}
          zoomChips={zoomChips}
          zoomFeedback={zoomFeedback}
          fullscreen={fullscreen}
          screenInfo={screenInfo}
          hasElectronBridge={hasElectronBridge}
          onZoomChange={handleZoomChange}
          onZoomSet={handleZoomSet}
          onZoomReset={handleZoomReset}
          onToggleFullscreen={handleToggleFullscreen}
        />
        <TerminalMaintenanceCard
          localStorageSize={localStorageSize}
          hasElectronBridge={hasElectronBridge}
          onClearLocalStorage={handleClearLocalStorage}
          onReload={handleReload}
          onCloseApp={handleCloseApp}
        />
      </div>

      <BranchEditModal
        isOpen={isEditModalOpen}
        branchProfile={branchProfile}
        onClose={handleCloseEdit}
        onSave={handleSaveBranch}
        saving={savingBranch}
      />
    </section>
  );
};

export default SettingsTerminal;
