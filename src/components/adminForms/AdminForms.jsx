import { getAdoptionForms } from "@/lib/data";
import styles from "./adminForms.module.css";
import Image from "next/image";
import { updateAdoptionFormStatus } from "@/lib/action";

const AdminForms = async () => {
  const forms = await getAdoptionForms();

  return (
    <div className={styles.container}>
      <h1>Заявки на адопцію</h1>
      {forms.map((form) => (
        <div className={styles.formItem} key={form._id}>
          <div className={styles.details}>
            <h3>{form.name}</h3>
            <p>Email: {form.email}</p>
            <p>Телефон: {form.phone || 'Не вказано'}</p>
            <p>Тварина: {form.postId?.title}</p>
            <p>Статус: 
              <span className={`${styles.status} ${styles[form.status]}`}>
                {form.status}
              </span>
            </p>
          </div>
          <div className={styles.actions}>
            <form action={updateAdoptionFormStatus}>
              <input type="hidden" name="id" value={form._id} />
              <input type="hidden" name="status" value="approved" />
              <button 
                type="submit" 
                className={`${styles.button} ${styles.approve}`}
                disabled={form.status === 'approved'}
              >
                Схвалити
              </button>
            </form>
            <form action={updateAdoptionFormStatus}>
              <input type="hidden" name="id" value={form._id} />
              <input type="hidden" name="status" value="rejected" />
              <button 
                type="submit" 
                className={`${styles.button} ${styles.reject}`}
                disabled={form.status === 'rejected'}
              >
                Відхилити
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminForms;