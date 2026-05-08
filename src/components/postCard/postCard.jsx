import Image from "next/image";
import styles from "./postCard.module.css";
import Link from "next/link";

const statusLabels = {
  available: "Доступний",
  reserved: "Зарезервований",
  adopted: "Адоптований",
};

const sexLabels = {
  male: "Хлопчик",
  female: "Дівчинка",
};

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  return (
    <article className={styles.container}>
      <div className={styles.imageWrapper}>
        <Image
          src={post.img || "/no-image.png"}
          alt={post.title}
          fill
          className={styles.img}
        />

        <span className={`${styles.status} ${styles[post.status || "available"]}`}>
          {statusLabels[post.status] || "Доступний"}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>{post.title}</h2>
          <span className={styles.date}>{formatDate(post.createdAt)}</span>
        </div>

        <div className={styles.meta}>
          <span>{post.type}</span>
          <span>{post.ageGroups}</span>
          <span>{post.sizes}</span>
          {post.sex && <span>{sexLabels[post.sex]}</span>}
          {post.city && <span>{post.city}</span>}
        </div>

        {post.breed && (
          <div className={styles.breed}>
            <span>Порода:</span> {post.breed}
          </div>
        )}

        <p className={styles.desc}>{post.desc}</p>

        <Link className={styles.link} href={`/catalog/${post.slug}`}>
          Дізнатися більше
        </Link>
      </div>
    </article>
  );
};

export default PostCard;