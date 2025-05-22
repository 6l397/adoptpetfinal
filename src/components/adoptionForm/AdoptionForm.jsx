"use client";

import { useState } from "react";
import { submitAdoptionForm } from "@/lib/action";
import styles from "./adoptionForm.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

const AdoptionForm = ({ postId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const result = await submitAdoptionForm(null, formData);
      setMessage(result);
      if (result?.success) {
        setTimeout(() => router.push('/catalog'), 1500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className={styles.form}>
      <input type="hidden" name="postId" value={postId} />
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Прізвище та імя</label>
        <input
          type="text"
          name="name"
          className={styles.input}
          required
          minLength={2}
          maxLength={50}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Email</label>
        <input
          type="email"
          name="email"
          className={styles.input}
          required
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Телефон</label>
        <input
          type="tel"
          name="phone"
          className={styles.input}
          pattern="[0-9]{10}"
          title="Введіть 10 цифр номера телефону"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Адреса</label>
        <input
          type="text"
          name="address"
          className={styles.input}
          minLength={5}
          maxLength={100}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Досвід утримання тварин</label>
        <textarea
          name="experience"
          required
          className={styles.input}
          rows={4}
          minLength={10}
          maxLength={500}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label className={styles.label}>Додаткова інформація</label>
        <textarea
          name="message"
          className={styles.input}
          rows={4}
          maxLength={500}
        />
      </div>
      
      <div className={styles.footer}>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Відправка...' : 'Надіслати заявку'}
        </button>
        
        <Link href="/catalog" className={styles.backLink}>
          Назад до каталогу
        </Link>
      </div>
      
      {message && (
        <div className={message.success ? styles.successMessage : styles.errorMessage}>
          {message.message}
        </div>
      )}
    </form>
  );
};

export default AdoptionForm;