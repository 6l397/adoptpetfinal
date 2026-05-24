import { getAdoptionForms } from "@/lib/data";
import styles from "./adminForms.module.css";
import { updateAdoptionFormStatus } from "@/lib/action";
import Link from "next/link";
import AdminListSection from "@/components/adminListSection/AdminListSection";

const statusFilters = [
  { value: "", label: "Усі" },
  { value: "pending", label: "Очікують" },
  { value: "approved", label: "Схвалені" },
  { value: "rejected", label: "Відхилені" },
];

const AdminForms = async ({
  status = "",
  animalSearch = "",
  postSearch = "",
  userSearch = "",
}) => {
  const forms = await getAdoptionForms({ status });
  const hasStatusFilter = statusFilters.some(
    (filter) => filter.value && filter.value === status
  );

  return (
    <AdminListSection
      title="Заявки на адопцію"
      count={forms.length}
      defaultOpen={hasStatusFilter}
    >
      <div className={styles.container}>
      <form action="/admin" method="get" className={styles.filters}>
        {animalSearch && (
          <input type="hidden" name="animalSearch" value={animalSearch} />
        )}
        {postSearch && <input type="hidden" name="postSearch" value={postSearch} />}
        {userSearch && <input type="hidden" name="userSearch" value={userSearch} />}

        <label>
          <span>Статус</span>
          <select name="formStatus" defaultValue={hasStatusFilter ? status : ""}>
            {statusFilters.map((filter) => (
              <option key={filter.value || "all"} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </label>

        <button type="submit">Фільтрувати</button>
      </form>

      {forms.length === 0 ? (
        <p className={styles.empty}>Заявок не знайдено.</p>
      ) : (
        forms.map((form) => (
          <div className={styles.formItem} key={form._id.toString()}>
            <div className={styles.details}>
              <h3>{form.name}</h3>
              <p>Email: {form.email}</p>
              <p>Телефон: {form.phone || 'Не вказано'}</p>
              <p>
                Тварина:{" "}
                {form.postId?.slug ? (
                  <Link
                    href={`/catalog/${form.postId.slug}`}
                    className={styles.animalLink}
                  >
                    {form.postId.title}
                  </Link>
                ) : (
                  form.postId?.title || "Оголошення видалено"
                )}
              </p>
              <p>Статус:
                <span className={`${styles.status} ${styles[form.status]}`}>
                  {form.status}
                </span>
              </p>
            </div>
            <div className={styles.actions}>
              <form action={updateAdoptionFormStatus}>
                <input type="hidden" name="id" value={form._id.toString()} />
                <input type="hidden" name="status" value="approved" />
                <button
                  type="submit"
                  className={`${styles.button} ${styles.approve}`}
                  disabled={form.status !== "pending"}
                >
                  Схвалити
                </button>
              </form>
              <form action={updateAdoptionFormStatus}>
                <input type="hidden" name="id" value={form._id.toString()} />
                <input type="hidden" name="status" value="rejected" />
                <button
                  type="submit"
                  className={`${styles.button} ${styles.reject}`}
                  disabled={form.status !== "pending"}
                >
                  Відхилити
                </button>
              </form>
            </div>
          </div>
        ))
      )}
      </div>
    </AdminListSection>
  );
};

export default AdminForms;
