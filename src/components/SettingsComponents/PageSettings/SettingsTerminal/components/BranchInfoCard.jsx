import { useEffect, useState } from "react";
import storeIcon from "../../../../../assets/icons/store-solid-full.svg";
import styles from "../SettingsTerminal.module.css";

const BranchInfoCard = ({ branch, branchProfile, isAdmin, onEdit }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timezone = branchProfile?.timezone || "America/Cancun";
  const formattedTime = currentTime.toLocaleString("es-MX", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return (
    <article className={styles.card} aria-labelledby="branch-info-title">
      <header className={styles.cardHeader}>
        <div className={styles.cardTitleRow}>
          <div className={styles.cardTitleGroup}>
            <span className={styles.cardHeaderIconBadge} aria-hidden="true">
              <img src={storeIcon} alt="" />
            </span>
            <div className={styles.cardHeading}>
              <h2 id="branch-info-title" className={styles.cardTitle}>
                Perfil operativo de la sucursal
              </h2>
              <p className={styles.cardDescription}>
                Datos operativos y de contacto de la sucursal vinculada
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              type="button"
              className={`${styles.buttonSecondary} ${styles.headerAction}`}
              onClick={onEdit}
            >
              Editar datos
            </button>
          )}
        </div>
      </header>

      <dl className={styles.definitionList}>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Código oficial</dt>
          <dd className={styles.definitionValue}>
            {branch?.code || branchProfile?.code || "N/A"}
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Nombre</dt>
          <dd className={styles.definitionValue}>
            {branch?.name || branchProfile?.name || "N/A"}
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Dirección comercial</dt>
          <dd className={styles.definitionValue}>
            {branchProfile?.address || "No especificada"}
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Teléfono</dt>
          <dd className={styles.definitionValue}>
            {branchProfile?.phone || "No especificado"}
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Correo de contacto</dt>
          <dd className={styles.definitionValue}>
            {branchProfile?.email || "No especificado"}
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Ciudad</dt>
          <dd className={styles.definitionValue}>
            {branchProfile?.city || "N/A"}
          </dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Zona horaria</dt>
          <dd className={styles.definitionValue}>{timezone}</dd>
        </div>
        <div className={styles.definitionItem}>
          <dt className={styles.definitionTerm}>Hora local (sucursal)</dt>
          <dd className={styles.definitionValue}>
            <span className={styles.localTimeBadge}>{formattedTime}</span>
          </dd>
        </div>
      </dl>
    </article>
  );
};

export default BranchInfoCard;
