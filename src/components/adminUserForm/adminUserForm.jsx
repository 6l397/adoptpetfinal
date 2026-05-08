"use client";

import { addUser } from "@/lib/action";
import styles from "./adminUserForm.module.css";
import { useFormState } from "react-dom";

const AdminUserForm = () => {
  const [state, formAction] = useFormState(addUser, undefined);

  return (
    <form action={formAction} className={styles.container}>
      <h1>Додати нового користувача</h1>
      <input type="text" name="username" placeholder="логін" />
      <input type="text" name="email" placeholder="пошта" />
      <input type="password" name="password" placeholder="пароль" />
      <input type="text" name="img" placeholder="зображення" />
      <select name="isAdmin">
        <option value="false">адмін?</option>
        <option value="false">ні</option>
        <option value="true">так</option>
      </select>
      <button>Додати</button>
      {state?.error}
    </form>
  );
};

export default AdminUserForm;
