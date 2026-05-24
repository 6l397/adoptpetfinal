import Link from "next/link";
import { getAdminAnalytics } from "@/lib/data";
import styles from "./adminDashboard.module.css";

const statusLabels = {
  available: "Є в адопції",
  reserved: "Зарезервовані",
  adopted: "Забрали",
  adoption: "Адопція",
  lost: "Загублені",
  found: "Знайдені",
  pending: "На модерації",
  approved: "Схвалено",
  rejected: "Відхилено",
};

const chartColors = ["#7c3aed", "#a855f7", "#f59e0b", "#dc2626", "#2563eb", "#c084fc"];

const getLabel = (label) => statusLabels[label] || label;

const getMax = (items) =>
  items.reduce((max, item) => Math.max(max, item.value), 0) || 1;

const StatCard = ({ label, value, note }) => (
  <article className={styles.statCard}>
    <span>{label}</span>
    <strong>{value}</strong>
    {note && <p>{note}</p>}
  </article>
);

const BarChart = ({ title, items }) => {
  const max = getMax(items);

  return (
    <section className={styles.chartPanel}>
      <h2>{title}</h2>
      {items.length > 0 ? (
        <div className={styles.bars}>
          {items.map((item, index) => (
            <div className={styles.barRow} key={item.label}>
              <span>{getLabel(item.label)}</span>
              <div className={styles.track}>
                <div
                  className={styles.bar}
                  style={{
                    width: `${Math.max((item.value / max) * 100, 6)}%`,
                    backgroundColor: chartColors[index % chartColors.length],
                  }}
                />
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>Даних ще немає.</p>
      )}
    </section>
  );
};

const DonutChart = ({ title, items }) => {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let current = 0;
  const gradient =
    total > 0
      ? items
          .map((item, index) => {
            const start = current;
            const next = current + (item.value / total) * 100;
            current = next;
            return `${chartColors[index % chartColors.length]} ${start}% ${next}%`;
          })
          .join(", ")
      : "#e5e7eb 0% 100%";

  return (
    <section className={styles.chartPanel}>
      <h2>{title}</h2>
      <div className={styles.donutWrap}>
        <div
          className={styles.donut}
          style={{ background: `conic-gradient(${gradient})` }}
          aria-label={`${title}: ${total}`}
        >
          <span>{total}</span>
        </div>
        <div className={styles.legend}>
          {items.map((item, index) => (
            <div key={item.label}>
              <i style={{ backgroundColor: chartColors[index % chartColors.length] }} />
              <span>{getLabel(item.label)}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SummaryTable = ({ title, items }) => (
  <section className={styles.chartPanel}>
    <h2>{title}</h2>
    {items.length > 0 ? (
      <div className={styles.table}>
        {items.map((item) => (
          <div key={item.label}>
            <span>{getLabel(item.label)}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    ) : (
      <p className={styles.empty}>Даних ще немає.</p>
    )}
  </section>
);

const AdminDashboard = async () => {
  const analytics = await getAdminAnalytics();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <span>Внутрішня інформація для адміна</span>
          <h1>Зведена аналітика тварин</h1>
          <p>
            Огляд поточного стану бази: типи тварин, породи, вік, статуси,
            регіони надходження та заявки.
          </p>
        </div>
        <Link href="/admin">До адмін-панелі</Link>
      </header>

      <section className={styles.statsGrid}>
        <StatCard
          label="Усього записів тварин"
          value={analytics.totals.animals}
          note="Усі оголошення в системі"
        />
        <StatCard
          label="Є в адопції"
          value={analytics.totals.available}
          note="Активні картки для потенційних опікунів"
        />
        <StatCard
          label="Забрали"
          value={analytics.totals.adopted}
          note="Тварини зі статусом адоптовано"
        />
        <StatCard
          label="Загублені / знайдені"
          value={analytics.totals.lostFound}
          note={`${analytics.totals.pendingLostFound} на модерації`}
        />
        <StatCard
          label="Користувачі"
          value={analytics.totals.users}
          note="Зареєстровані акаунти"
        />
        <StatCard
          label="Заявки на адопцію"
          value={analytics.totals.adoptionForms}
          note="Усі подані форми"
        />
      </section>

      <section className={styles.grid}>
        <DonutChart title="Кількість собак, котів та інших" items={analytics.typeCounts} />
        <BarChart title="Які є / зарезервовані / яких забрали" items={analytics.statusCounts} />
        <BarChart title="Вік тварин" items={analytics.ageCounts} />
        <BarChart title="З яких регіонів потрапили" items={analytics.regionCounts} />
        <SummaryTable title="Породи" items={analytics.breedCounts} />
        <SummaryTable title="Типи оголошень" items={analytics.listingCounts} />
        <SummaryTable title="Модерація загублених/знайдених" items={analytics.moderationCounts} />
        <SummaryTable title="Статуси заявок" items={analytics.formStatusCounts} />
      </section>
    </div>
  );
};

export default AdminDashboard;
