"use client";

import { register } from "@/lib/action";
import styles from "./registerForm.module.css";
import { useFormState } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RegisterForm = () => {
  const [state, formAction] = useFormState(register, undefined);

  const router = useRouter();

  useEffect(() => {
    state?.success && router.push("/login");
  }, [state?.success, router]);

  return (
    <form className={styles.form} action={formAction}>
      <input type="text" placeholder="логін" name="username" />
      <input type="email" placeholder="пошта" name="email" />
      <input type="password" placeholder="пароль" name="password" />
      <input
        type="password"
        placeholder="підтвердьте пароль"
        name="passwordRepeat"
      />
      <button>Зареєструватися</button>
      {state?.error}
      <Link href="/login">
        Уже маєте акаунт? <b>Увійти</b>
      </Link>
    </form>
  );
};

export default RegisterForm;
