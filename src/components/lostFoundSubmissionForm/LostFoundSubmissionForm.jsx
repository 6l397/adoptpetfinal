"use client";

import ImageUploadInput from "@/components/imageUploadInput/ImageUploadInput";
import { submitLostFoundReport } from "@/lib/action";
import {
  ageGroups,
  listingTypes,
  sexOptions,
  sizes,
  types,
} from "@/constants";
import { useState } from "react";
import { useFormState } from "react-dom";
import styles from "./lostFoundSubmissionForm.module.css";

const reportTypes = listingTypes.filter((item) =>
  ["lost", "found"].includes(item.value)
);

const LostFoundSubmissionForm = () => {
  const [state, formAction] = useFormState(submitLostFoundReport, undefined);
  const [imageUrl, setImageUrl] = useState("");

  return (
    <form action={formAction} className={styles.form}>
      <div className={styles.grid}>
        <label>
          <span>Тип оголошення</span>
          <select name="listingType" required defaultValue="lost">
            {reportTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Заголовок</span>
          <input
            type="text"
            name="title"
            placeholder="Наприклад, загубився кіт Барсик"
            required
          />
        </label>

        <label>
          <span>Тварина</span>
          <select name="type" required defaultValue="">
            <option value="">Оберіть тип</option>
            {types.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Місто</span>
          <input type="text" name="city" placeholder="Чернівці" />
        </label>

        <label>
          <span>Вік</span>
          <select name="ageGroups" required defaultValue="">
            <option value="">Оберіть приблизний вік</option>
            {ageGroups.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Розмір</span>
          <select name="sizes" required defaultValue="">
            <option value="">Оберіть розмір</option>
            {sizes.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Стать</span>
          <select name="sex" defaultValue="">
            {sexOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Порода або ознаки</span>
          <input type="text" name="breed" placeholder="Сіро-білий, хаскі, метис" />
        </label>

        <label className={styles.full}>
          <span>Де бачили або знайшли</span>
          <input
            type="text"
            name="foundLocation"
            placeholder="Вулиця, район, орієнтир"
          />
        </label>

        <div className={styles.full}>
          <ImageUploadInput
            value={imageUrl}
            onChange={setImageUrl}
            label="Фото"
            hint="Необов’язково, але дуже допомагає з пошуком"
          />
        </div>

        <label className={styles.full}>
          <span>Опис</span>
          <textarea
            name="desc"
            rows={7}
            placeholder="Опишіть тварину, обставини зникнення або знахідки, особливі прикмети."
            required
          />
        </label>

        <label>
          <span>Ваше ім’я</span>
          <input type="text" name="reporterName" required />
        </label>

        <label>
          <span>Email</span>
          <input type="email" name="reporterEmail" placeholder="name@example.com" />
        </label>

        <label>
          <span>Телефон</span>
          <input type="tel" name="reporterPhone" placeholder="+380..." />
        </label>
      </div>

      <div className={styles.submitRow}>
        <p>
          Після відправки оголошення з’явиться на сайті тільки після модерації.
        </p>
        <button type="submit">Надіслати на модерацію</button>
      </div>

      {state?.message && (
        <p className={state.success ? styles.success : styles.error}>
          {state.message}
        </p>
      )}
    </form>
  );
};

export default LostFoundSubmissionForm;
