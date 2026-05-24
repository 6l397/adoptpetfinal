"use client";

import ImageUploadInput from "@/components/imageUploadInput/ImageUploadInput";
import { updateProfilePhoto } from "@/lib/action";
import { useState } from "react";
import { useFormState } from "react-dom";
import styles from "./profilePhotoForm.module.css";

const ProfilePhotoForm = ({ currentImage = "" }) => {
  const [state, formAction] = useFormState(updateProfilePhoto, undefined);
  const [imageUrl, setImageUrl] = useState(currentImage);

  return (
    <form action={formAction} className={styles.form}>
      <ImageUploadInput
        value={imageUrl}
        onChange={setImageUrl}
        label="Фото профілю"
        hint="Оберіть фото або вставте URL"
      />

      <div className={styles.actions}>
        <button type="submit">Зберегти фото</button>
        {state?.message && (
          <p className={state.success ? styles.success : styles.error}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default ProfilePhotoForm;
