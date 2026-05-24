import styles from "./adminListSection.module.css";

const AdminListSection = ({ title, count, defaultOpen = false, children }) => {
  return (
    <details className={styles.section} open={defaultOpen}>
      <summary className={styles.summary}>
        <h1>{title}</h1>
        <span>{count}</span>
      </summary>

      <div className={styles.content}>{children}</div>
    </details>
  );
};

export default AdminListSection;
