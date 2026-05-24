"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./imageUploadInput.module.css";

const ImageUploadInput = ({
  name = "img",
  value,
  onChange,
  label = "Фото",
  hint = "JPG, PNG або WebP до 5 МБ",
}) => {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Оберіть файл зображення.");
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Не вдалося завантажити фото.");
      }

      onChange(data.url);
    } catch (uploadError) {
      setError(uploadError.message || "Не вдалося завантажити фото.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <input type="hidden" name={name} value={value || ""} />

      <div className={styles.header}>
        <span>{label}</span>
        <small>{hint}</small>
      </div>

      <label className={styles.dropzone}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <strong>{isUploading ? "Завантаження..." : "Обрати фото"}</strong>
        <span>з телефону або комп’ютера</span>
      </label>

      <label className={styles.urlField}>
        <span>Або вставте URL</span>
        <input
          type="url"
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
        />
      </label>

      {value && (
        <div className={styles.preview}>
          <Image
            src={value}
            alt="Прев’ю фото"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            className={styles.previewImage}
          />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default ImageUploadInput;
