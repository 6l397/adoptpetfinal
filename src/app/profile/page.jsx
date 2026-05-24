import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  getUser,
  getUserAdoptionForms,
  getUserPosts,
} from "@/lib/data";
import ProfilePhotoForm from "@/components/profilePhotoForm/ProfilePhotoForm";
import styles from "./profile.module.css";

const listingLabels = {
  adoption: "Адопція",
  lost: "Загублена",
  found: "Знайдена",
};

const moderationLabels = {
  pending: "На модерації",
  approved: "Схвалено",
  rejected: "Відхилено",
};

const adoptionStatusLabels = {
  pending: "Очікує",
  approved: "Схвалено",
  rejected: "Відхилено",
};

const postStatusLabels = {
  available: "Доступний",
  reserved: "Зарезервований",
  adopted: "Адоптований",
};

const formatDate = (date) => {
  if (!date) return "";

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
};

const ProfilePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className={styles.page}>
        <section className={styles.authState}>
          <h1>Увійдіть у свій акаунт</h1>
          <p>
            У кабінеті будуть ваші дані, оголошення про загублених або знайдених
            тварин і заявки на адопцію.
          </p>
          <div>
            <Link href="/login">Увійти</Link>
            <Link href="/register">Зареєструватися</Link>
          </div>
        </section>
      </div>
    );
  }

  const user = await getUser(session.user.id);
  const posts = await getUserPosts(session.user.id);
  const adoptionForms = await getUserAdoptionForms(session.user.email || "");

  const adoptionPosts = posts.filter(
    (post) => (post.listingType || "adoption") === "adoption"
  );
  const lostFoundPosts = posts.filter((post) =>
    ["lost", "found"].includes(post.listingType)
  );

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.avatar}>
          {user?.img ? (
            <Image src={user.img} alt={user.username} fill className={styles.photo} />
          ) : (
            <span>{(user?.username || "U").slice(0, 1).toUpperCase()}</span>
          )}
        </div>

        <div className={styles.identity}>
          <span>{user?.isAdmin ? "Адміністратор" : "Користувач"}</span>
          <h1>{user?.username}</h1>
          <p>{user?.email}</p>
        </div>

        <div className={styles.stats}>
          <div>
            <strong>{posts.length}</strong>
            <span>оголошень</span>
          </div>
          <div>
            <strong>{adoptionForms.length}</strong>
            <span>заявок</span>
          </div>
        </div>

        <div className={styles.profilePhotoForm}>
          <ProfilePhotoForm currentImage={user?.img || ""} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Мої оголошення</h2>
          <Link href="/lost-found/new">Створити оголошення</Link>
        </div>

        {lostFoundPosts.length > 0 ? (
          <div className={styles.list}>
            {lostFoundPosts.map((post) => (
              <article className={styles.item} key={post._id.toString()}>
                <div>
                  <h3>{post.title}</h3>
                  <p>
                    {listingLabels[post.listingType]} · {post.city || "Місто не вказано"} ·{" "}
                    {formatDate(post.createdAt)}
                  </p>
                </div>
                <span className={`${styles.badge} ${styles[post.moderationStatus || "approved"]}`}>
                  {moderationLabels[post.moderationStatus || "approved"]}
                </span>
                <Link href={`/catalog/${post.slug}`}>Відкрити</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Ви ще не створювали оголошень про загублених або знайдених тварин.</p>
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Мої заявки на адопцію</h2>
          <Link href="/catalog">Адопція тварин</Link>
        </div>

        {adoptionForms.length > 0 ? (
          <div className={styles.list}>
            {adoptionForms.map((form) => (
              <article className={styles.item} key={form._id.toString()}>
                <div>
                  <h3>{form.postId?.title || "Тварину не знайдено"}</h3>
                  <p>{formatDate(form.createdAt)}</p>
                </div>
                <span className={`${styles.badge} ${styles[form.status]}`}>
                  {adoptionStatusLabels[form.status] || form.status}
                </span>
                {form.postId?.slug && (
                  <Link href={`/catalog/${form.postId.slug}`}>Картка</Link>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>Заявок на адопцію ще немає.</p>
          </div>
        )}
      </section>

      {adoptionPosts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Тварини, додані вами</h2>
          </div>

          <div className={styles.list}>
            {adoptionPosts.map((post) => (
              <article className={styles.item} key={post._id.toString()}>
                <div>
                  <h3>{post.title}</h3>
                  <p>
                    {post.type} · {post.city || "Місто не вказано"} · {formatDate(post.createdAt)}
                  </p>
                </div>
                <span className={`${styles.badge} ${styles[post.status]}`}>
                  {postStatusLabels[post.status] || post.status}
                </span>
                <Link href={`/catalog/${post.slug}`}>Відкрити</Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfilePage;
