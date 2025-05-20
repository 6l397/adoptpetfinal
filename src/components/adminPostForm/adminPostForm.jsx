"use client"

import { addPost } from "@/lib/action";
import styles from "./adminPostForm.module.css";
import { useFormState } from "react-dom";
import { types, ageGroups, sizes } from "@/constants";

const AdminPostForm = ({userId}) => {
  const [state, formAction] = useFormState(addPost, undefined);
  
  return (
    <form action={formAction} className={styles.container}>
      <h1>Додати нову тварину</h1>
      <input type="hidden" name="userId" value={userId} />
      <input type="text" name="title" placeholder="ім'я" />
      <input type="text" name="slug" placeholder="slug" />
      <input type="text" name="img" placeholder="зображення" />
      <textarea type="text" name="desc" placeholder="опис" rows={10} />
      <select name="type" className={styles.select}>
        <option value="">Оберіть тип тварини</option>
        {types.map((type, index) => (
          <option key={index} value={type}>{type}</option>
        ))}
      </select>
      
      <select name="ageGroups" className={styles.select}>
        <option value="">Оберіть вікову групу</option>
        {ageGroups.map((age, index) => (
          <option key={index} value={age}>{age}</option>
        ))}
      </select>
      <select name="sizes" className={styles.select}>
        <option value="">Оберіть розмір</option>
        {sizes.map((size, index) => (
          <option key={index} value={size}>{size}</option>
        ))}
      </select>
      <button>Додати</button>
      {state?.error}
    </form>
  );
};

export default AdminPostForm;