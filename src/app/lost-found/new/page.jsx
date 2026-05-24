import Link from "next/link";
import LostFoundSubmissionForm from "@/components/lostFoundSubmissionForm/LostFoundSubmissionForm";
import { auth } from "@/lib/auth";
import styles from "./newLostFound.module.css";

const NewLostFoundPage = async () => {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <Link href="/lost-found">Назад до оголошень</Link>
          <h1>Увійдіть, щоб створити оголошення</h1>
          <p>
            Так ми зможемо прив’язати оголошення до вашого акаунта і швидше
            зв’язатися з вами під час модерації.
          </p>
        </div>

        <div className={styles.authBox}>
          <Link href="/login">Увійти</Link>
          <Link href="/register">Зареєструватися</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Link href="/lost-found">Назад до оголошень</Link>
        <h1>Створити оголошення</h1>
        <p>
          Заповніть форму, якщо тварина загубилася або ви знайшли тварину, якій
          потрібно повернутися додому.
        </p>
      </div>

      <LostFoundSubmissionForm />
    </div>
  );
};

export default NewLostFoundPage;
