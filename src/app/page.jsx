'use client';

import Image from "next/image";
import styles from "./home.module.css";
import { useEffect, useRef } from "react";

const Home = () => {
  const bgRef = useRef(null);

  useEffect(() => {
    if (bgRef.current) {
      bgRef.current.classList.add(styles.fadeIn);
    }
  }, []);

  return (
    <div className={styles.hero}>
      <div className={styles.textContainer}>
        <p className={styles.hero__title}>Знайдіть друга, що змінить ваше життя!</p>
        <p className={styles.hero__subtitle}>
          AdoptPet допомагає знайти ідеального вихованця і надати допомогу тваринам, які цього потребують.
        </p>
        <div className={styles.buttons}>
          <button 
            className={styles.button}
            onClick={() => {
              const footer = document.getElementById('footer');
              if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Більше про нас
          </button>
        </div>
      </div>

      <div className={styles.hero__imageContainer}>
        <div 
          ref={bgRef} 
          className={`${styles.hero__imageOverlay} ${styles.initialHidden}`}
        >
          <Image 
            src="/hero-bg.png" 
            alt="Фонова підкладка" 
            fill
            className="object-contain"
            style={{ position: 'absolute' }}
          />
        </div>
        <div className={styles.hero__image}>
          <Image 
            src="/hero.png" 
            alt="Котик" 
            fill 
            className="object-contain" 
          />
        </div>
      </div>
    </div>
  );
};

export default Home;