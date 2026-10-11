import styles from "../SettingsUsers.module.css";
import userIcon from "../../../../../assets/icons/user-solid.svg";
import circleCheckIcon from "../../../../../assets/icons/circle-check-solid-full.svg";
import lockIcon from "../../../../../assets/icons/lock-solid-full.svg";
import gearIcon from "../../../../../assets/icons/gear-solid-full.svg";

const toToneClass = (styles, base, tone) =>
  styles[`${base}${tone.charAt(0).toUpperCase()}${tone.slice(1)}`] || "";

const KpiGrid = ({ metrics }) => {
  const safeMetrics = {
    total: metrics?.total ?? 0,
    active: metrics?.active ?? 0,
    inactive: metrics?.inactive ?? 0,
    admins: metrics?.admins ?? 0,
    cashiers: metrics?.cashiers ?? 0,
  };

  const cards = [
    {
      key: "total",
      label: "Total de usuarios",
      value: safeMetrics.total,
      icon: userIcon,
      tone: "neutral",
    },
    {
      key: "active",
      label: "Activos",
      value: safeMetrics.active,
      icon: circleCheckIcon,
      tone: "active",
    },
    {
      key: "inactive",
      label: "Inactivos",
      value: safeMetrics.inactive,
      icon: lockIcon,
      tone: "inactive",
    },
    {
      key: "roles",
      label: "Administradores / Cajeros",
      value: `${safeMetrics.admins} / ${safeMetrics.cashiers}`,
      icon: gearIcon,
      tone: "roles",
    },
  ];

  return (
    <section className={styles.kpiGrid} aria-label="Resumen de usuarios">
      {cards.map((card) => (
        <article key={card.key} className={styles.kpiCard}>
          <span
            className={[
              styles.kpiIcon,
              toToneClass(styles, "kpiIcon", card.tone),
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          >
            <img src={card.icon} alt="" className={styles.kpiIconImage} />
          </span>
          <div className={styles.kpiBody}>
            <span className={styles.kpiValue}>{card.value}</span>
            <span className={styles.kpiLabel}>{card.label}</span>
          </div>
        </article>
      ))}
    </section>
  );
};

export default KpiGrid;
