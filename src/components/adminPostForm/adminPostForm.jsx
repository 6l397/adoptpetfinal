"use client";

import ImageUploadInput from "@/components/imageUploadInput/ImageUploadInput";
import { addPost } from "@/lib/action";
import {
  ageGroups,
  listingTypes,
  sexOptions,
  sizes,
  statuses,
  types,
} from "@/constants";
import { useState } from "react";
import { useFormState } from "react-dom";
import styles from "./adminPostForm.module.css";

const AdminPostForm = ({ userId }) => {
  const [state, formAction] = useFormState(addPost, undefined);
  const [imageUrl, setImageUrl] = useState("");
  const [animalType, setAnimalType] = useState("");
  const [breed, setBreed] = useState("");
  const [breedConfidence, setBreedConfidence] = useState("");
  const [mlPredictions, setMlPredictions] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictError, setPredictError] = useState("");

  const handlePredictBreed = async () => {
    if (!imageUrl) {
      setPredictError("Спочатку завантажте фото або вставте посилання.");
      return;
    }

    if (!animalType) {
      setPredictError("Спочатку оберіть тип тварини: собака або кіт.");
      return;
    }

    try {
      setIsPredicting(true);
      setPredictError("");

      const res = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          type: animalType,
        }),
      });

      if (!res.ok) {
        throw new Error("Не вдалося визначити породу.");
      }

      const data = await res.json();

      setBreed(data.bestPrediction.breed);
      setBreedConfidence(data.bestPrediction.confidence);
      setMlPredictions(data.topPredictions || []);
    } catch (err) {
      setPredictError(err.message || "Помилка ML-сервісу.");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <form action={formAction} className={styles.container}>
      <h1>Додати нову тварину</h1>

      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="breedConfidence" value={breedConfidence} />
      <input
        type="hidden"
        name="mlPredictions"
        value={JSON.stringify(mlPredictions)}
      />

      <input type="text" name="title" placeholder="Ім’я тварини" required />

      <input
        type="text"
        name="slug"
        placeholder="slug, наприклад barsik-cat"
        required
      />

      <select name="listingType" className={styles.select} defaultValue="adoption">
        {listingTypes.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <ImageUploadInput
        value={imageUrl}
        onChange={setImageUrl}
        label="Фото тварини"
      />

      <select
        name="type"
        className={styles.select}
        value={animalType}
        onChange={(e) => setAnimalType(e.target.value)}
        required
      >
        <option value="">Оберіть тип тварини</option>
        {types.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={handlePredictBreed}
        disabled={isPredicting}
        className={styles.predictButton}
      >
        {isPredicting ? "Визначення..." : "Визначити породу"}
      </button>

      {predictError && <p className={styles.error}>{predictError}</p>}

      {mlPredictions.length > 0 && (
        <div className={styles.predictionsBox}>
          <h3>Результат моделі</h3>
          <p>
            Найімовірніша порода: <b>{breed}</b>
          </p>
          <p>
            Ймовірність: <b>{(breedConfidence * 100).toFixed(2)}%</b>
          </p>

          <ul>
            {mlPredictions.map((item, index) => (
              <li key={index}>
                {item.breed} - {(item.confidence * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      <input
        type="text"
        name="breed"
        placeholder="Порода"
        value={breed}
        onChange={(e) => setBreed(e.target.value)}
      />

      <input type="text" name="city" placeholder="Місто, наприклад Чернівці" />

      <select name="sex" className={styles.select}>
        {sexOptions.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <select name="ageGroups" className={styles.select} required>
        <option value="">Оберіть вікову групу</option>
        {ageGroups.map((age) => (
          <option key={age} value={age}>
            {age}
          </option>
        ))}
      </select>

      <select name="sizes" className={styles.select} required>
        <option value="">Оберіть розмір</option>
        {sizes.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <select name="status" className={styles.select}>
        {statuses.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <textarea name="desc" placeholder="Опис тварини" rows={8} required />

      <input
        type="text"
        name="animalFoundLocation"
        placeholder="Де знайшли тварину"
      />

      <input
        type="text"
        name="animalFoundByName"
        placeholder="Хто знайшов тварину"
      />

      <input
        type="text"
        name="animalFoundByContact"
        placeholder="Контакт людини, яка знайшла"
      />

      <textarea
        name="animalDiseases"
        placeholder="Хвороби або діагнози, по одному рядку"
        rows={4}
      />

      <textarea
        name="animalDocuments"
        placeholder="Документи, по одному рядку: Назва | посилання"
        rows={4}
      />

      <button type="submit">Додати</button>

      {state?.error && <p className={styles.error}>{state.error}</p>}
      {state?.success && (
        <p className={styles.success}>Тварину додано успішно</p>
      )}
    </form>
  );
};

export default AdminPostForm;
