"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./help.module.css";

const amounts = [100, 250, 500, 1000];

const helpDirections = [
  {
    value: "treatment",
    label: "Лікування",
    note: "Огляди, аналізи та термінові процедури.",
  },
  {
    value: "food",
    label: "Їжа",
    note: "Корм і базовий запас для тварин під опікою.",
  },
  {
    value: "transport",
    label: "Перевезення",
    note: "Дорога до клініки, перетримки або нового дому.",
  },
];

const HelpPage = () => {
  const [amount, setAmount] = useState(amounts[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [direction, setDirection] = useState(helpDirections[0].value);

  const selectedAmount = useMemo(() => {
    const normalizedCustomAmount = Number(customAmount);

    if (normalizedCustomAmount > 0) {
      return normalizedCustomAmount;
    }

    return amount;
  }, [amount, customAmount]);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.image}>
          <Image
            src="/cat.jpg"
            alt="Тварина, якій потрібна допомога"
            fill
            className={styles.photo}
            priority
          />
        </div>

        <div className={styles.overlay} />

        <div className={styles.intro}>
          <h1>Разова допомога тваринам</h1>
          <p>
            Один внесок може закрити корм, дорогу до клініки або частину
            лікування для тварини, яка ще шукає дім.
          </p>
        </div>
      </section>

      <section className={styles.donation}>
        <div className={styles.donationTool}>
          <div className={styles.amounts}>
            {amounts.map((item) => (
              <button
                type="button"
                key={item}
                className={item === amount && !customAmount ? styles.active : ""}
                onClick={() => {
                  setAmount(item);
                  setCustomAmount("");
                }}
              >
                {item} грн
              </button>
            ))}
          </div>

          <label className={styles.customAmount}>
            <span>Інша сума</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              name="amount"
              value={customAmount}
              onChange={(event) => setCustomAmount(event.target.value)}
              placeholder="Введіть суму"
            />
          </label>

          <div className={styles.directions}>
            {helpDirections.map((item) => (
              <label
                key={item.value}
                className={item.value === direction ? styles.directionActive : ""}
              >
                <input
                  type="radio"
                  name="direction"
                  value={item.value}
                  checked={item.value === direction}
                  onChange={() => setDirection(item.value)}
                />
                <span>
                  <strong>{item.label}</strong>
                  {item.note}
                </span>
              </label>
            ))}
          </div>

          <div className={styles.checkout}>
            <div>
              <span>Разовий внесок</span>
              <strong>{selectedAmount} грн</strong>
            </div>

            <button type="button" disabled>
              Оплату ще не підключено
            </button>
          </div>
        </div>

        <aside className={styles.context}>
          <h2>Куди піде допомога</h2>
          <p>
            Сума та напрямок уже можна обрати тут. У майбутньому підключення платіжного провайдера або офіційні реквізити.
          </p>

          <div className={styles.impact}>
            <div>
              <strong>Терміново</strong>
              <span>лікування й огляди</span>
            </div>
            <div>
              <strong>Щодня</strong>
              <span>корм і перетримка</span>
            </div>
            <div>
              <strong>До дому</strong>
              <span>дорога та адаптація</span>
            </div>
          </div>

          <Link href="/catalog" className={styles.catalogLink}>
            Переглянути тварин
          </Link>
        </aside>
      </section>
    </div>
  );
};

export default HelpPage;
