// components/adoptionForm/AdoptionForm.js
"use client";

import { useFormState } from "react-dom";
import { submitAdoptionForm } from "@/lib/action";
import styles from "./adoptionForm.module.css";
import Link from "next/link";

const AdoptionForm = ({ postId }) => {
  const [state, formAction] = useFormState(submitAdoptionForm, null);
  
  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="postId" value={postId} />
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Прізвище та імя</label>
        <input
          type="text"
          name="name"
          className={styles.input}
          required
        />
      </div>
      
      <div className={styles.formGroup}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            className={styles.input}
            required
            />
        </div>
        <div className={styles.formGroup}>
          <label>Телефон</label>
          <input
            type="tel"
            name="phone"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Адреса</label>
          <input
            type="text"
            name="address"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Досвід утримання тварин</label>
          <textarea
            name="experience"
            required
            className={styles.input}
            rows={4}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Додаткова інформація</label>
          <textarea
            name="message"
            className={styles.input}
            rows={4}
          />
        </div>
      
      <div className={styles.footer}>
        <button type="submit" className={styles.submitButton}>
          Надіслати заявку
        </button>
        
        <Link href="/catalog" className={styles.backLink}>
          Назад до каталогу
        </Link>
      </div>
    </form>
  );
};

export default AdoptionForm;