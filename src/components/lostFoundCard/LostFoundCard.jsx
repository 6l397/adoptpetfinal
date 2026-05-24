import Image from "next/image";
import Link from "next/link";
import styles from "./lostFoundCard.module.css";

const listingLabels = {
  lost: "Загублена",
  found: "Знайдена",
};

const formatDate = (dateString) => {
  if (!dateString) return "";

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateString));
};

const LostFoundCard = ({ post }) => (
  <Link
    href={`/catalog/${post.slug}`}
    className={styles.link}
    aria-label={`Відкрити оголошення про ${post.title}`}
  >
    <article className={styles.card}>
      <div className={styles.image}>
        <Image
          src={post.img || "/cat.jpg"}
          alt={post.title}
          fill
          className={styles.photo}
        />
        <span className={styles[post.listingType]}>
          {listingLabels[post.listingType]}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.heading}>
          <h2>{post.title}</h2>
          <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
        </div>

        <div className={styles.meta}>
          <span>{post.type}</span>
          {post.city && <span>{post.city}</span>}
          {post.breed && <span>{post.breed}</span>}
        </div>

        <p>{post.desc}</p>
        <strong>Відкрити картку</strong>
      </div>
    </article>
  </Link>
);

export default LostFoundCard;
