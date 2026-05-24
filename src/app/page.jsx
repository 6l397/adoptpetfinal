"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import styles from "./home.module.css";

const Home = () => {
  const bgRef = useRef(null);

  useEffect(() => {
    if (bgRef.current) {
      bgRef.current.classList.add(styles.fadeIn);
    }
  }, []);

  return (
    <section className={styles.hero}>
      <div className={styles.textContainer}>
        <p className={styles.hero__title}>
          Знайдіть друга, якому потрібен дім.
        </p>
        <p className={styles.hero__subtitle}>
          AdoptPet об’єднує адопцію, оголошення про
          загублених і знайдених тварин та допомогу.
        </p>
        <div className={styles.buttons}>
          <Link className={styles.button} href="/catalog">
            Перейти до адопції
          </Link>
          <Link
            className={`${styles.button} ${styles.secondaryButton}`}
            href="/lost-found"
          >
            Загублені / знайдені
          </Link>
        </div>
      </div>

      <div className={styles.hero__imageContainer} aria-hidden="true">
        <div
          ref={bgRef}
          className={`${styles.hero__imageOverlay} ${styles.initialHidden}`}
        >
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            className="object-contain"
            style={{ position: "absolute" }}
            priority
          />
        </div>
        <div className={styles.hero__image}>
          <Image
            src="/hero.png"
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Home;
