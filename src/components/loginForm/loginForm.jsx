"use client";

import { login } from "@/lib/action";
import styles from "./loginForm.module.css";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LoginForm = () => {
  const [state, formAction] = useFormState(login, undefined);

  return (
    <form className={styles.form} action={formAction}>
      <input type="text" placeholder="логін" name="username" />
      <input type="password" placeholder="пароль" name="password" />
      <button>Увійти</button>
      {state?.error}
      <Link href="/register">
        {"Не маєте акаунту?"} <b>Зареєструватися</b>
      </Link>
    </form>
  );
};

export default LoginForm;
