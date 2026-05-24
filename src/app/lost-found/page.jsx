import Image from "next/image";
import Link from "next/link";
import LostFoundCard from "@/components/lostFoundCard/LostFoundCard";
import { types } from "@/constants";
import { getLostFoundPosts } from "@/lib/data";
import styles from "./lostFound.module.css";

const caseTabs = [
  { value: "", label: "Усі" },
  { value: "lost", label: "Загублені" },
  { value: "found", label: "Знайдені" },
];

const getTextParam = (value) => (typeof value === "string" ? value : "");

const LostFoundPage = async ({ searchParams }) => {
  const search = getTextParam(searchParams?.search);
  const listingType = getTextParam(searchParams?.kind);
  const type = getTextParam(searchParams?.type);
  const city = getTextParam(searchParams?.city);
  const posts = await getLostFoundPosts({ search, listingType, type, city });

  const buildTabHref = (kind) => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (type) params.set("type", type);
    if (city) params.set("city", city);
    if (kind) params.set("kind", kind);

    const query = params.toString();
    return query ? `/lost-found?${query}` : "/lost-found";
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <Image
          src="/cat.jpg"
          alt="Тварина, яку шукають"
          fill
          className={styles.heroPhoto}
          priority
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1>Загублені та знайдені тварини</h1>
          <p>
            Перевіряйте оголошення поруч, коли улюбленець зник або коли тварина
            потребує повернення додому.
          </p>
          <div className={styles.heroActions}>
            <Link href="/lost-found/new">Створити оголошення</Link>
            <a href="#lost-found-list">Переглянути оголошення</a>
          </div>
        </div>
      </section>

      <section className={styles.directory} id="lost-found-list">
        <div className={styles.tabs} aria-label="Тип оголошення">
          {caseTabs.map((tab) => (
            <Link
              key={tab.label}
              href={buildTabHref(tab.value)}
              className={
                tab.value === listingType ||
                (!tab.value && !["lost", "found"].includes(listingType))
                  ? styles.activeTab
                  : styles.tab
              }
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <form action="/lost-found" method="get" className={styles.filters}>
          {["lost", "found"].includes(listingType) && (
            <input type="hidden" name="kind" value={listingType} />
          )}

          <label>
            <span>Пошук</span>
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Кличка, опис або порода"
            />
          </label>

          <label>
            <span>Тварина</span>
            <select name="type" defaultValue={type}>
              <option value="">Усі типи</option>
              {types.map((item) => (
                <option value={item} key={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Місто</span>
            <input
              type="search"
              name="city"
              defaultValue={city}
              placeholder="Наприклад, Чернівці"
            />
          </label>

          <button type="submit">Знайти</button>
        </form>

        <div className={styles.resultsHeader}>
          <h2>Оголошення</h2>
          <span>Знайдено: {posts.length}</span>
        </div>

        {posts.length > 0 ? (
          <div className={styles.grid}>
            {posts.map((post) => (
              <LostFoundCard post={post} key={post._id.toString()} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h2>Поки немає відповідних оголошень</h2>
            <p>Спробуйте інші фільтри або перегляньте тварин для адопції.</p>
            <div className={styles.emptyActions}>
              <Link href="/lost-found/new">Створити оголошення</Link>
              <Link href="/catalog">Адопція тварин</Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default LostFoundPage;
