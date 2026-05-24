import Image from "next/image";
import Link from "next/link";
import {
  deletePost,
  updatePostModerationStatus,
} from "@/lib/action";
import { getLostFoundModerationPosts } from "@/lib/data";
import AdminListSection from "@/components/adminListSection/AdminListSection";
import { moderationStatuses } from "@/constants";
import styles from "./adminLostFoundModeration.module.css";

const listingLabels = {
  lost: "Загублена",
  found: "Знайдена",
};

const AdminLostFoundModeration = async ({
  search = "",
  status = "pending",
  formStatus = "",
  postSearch = "",
  userSearch = "",
  animalSearch = "",
}) => {
  const normalizedSearch = search.trim();
  const normalizedStatus = status || "pending";
  const items = await getLostFoundModerationPosts({
    search: normalizedSearch,
    status: normalizedStatus,
  });

  return (
    <AdminListSection
      title="Модерація загублених / знайдених"
      count={items.length}
      defaultOpen={Boolean(normalizedSearch) || normalizedStatus !== "approved"}
    >
      <div className={styles.container}>
        <form action="/admin" method="get" className={styles.filters}>
          {formStatus && <input type="hidden" name="formStatus" value={formStatus} />}
          {postSearch && <input type="hidden" name="postSearch" value={postSearch} />}
          {userSearch && <input type="hidden" name="userSearch" value={userSearch} />}
          {animalSearch && (
            <input type="hidden" name="animalSearch" value={animalSearch} />
          )}

          <label>
            <span>Пошук</span>
            <input
              type="search"
              name="lostFoundSearch"
              defaultValue={normalizedSearch}
              placeholder="Назва, місто, опис або порода"
            />
          </label>

          <label className={styles.statusFilter}>
            <span>Статус</span>
            <select name="lostFoundStatus" defaultValue={normalizedStatus}>
              {moderationStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
              <option value="all">Усі</option>
            </select>
          </label>

          <button type="submit">Фільтрувати</button>
        </form>

        {items.length === 0 ? (
          <p className={styles.empty}>
            {normalizedStatus === "pending"
              ? "Нових оголошень на модерацію немає."
              : "Оголошень за цими фільтрами не знайдено."}
          </p>
        ) : (
          <div className={styles.list}>
            {items.map(({ post, animal }) => {
              const moderationStatus = post.moderationStatus || "approved";

              return (
                <article className={styles.item} key={post._id.toString()}>
                  <div className={styles.preview}>
                    <Image src={post.img} alt="" width={72} height={72} />
                  </div>

                  <div className={styles.body}>
                    <div className={styles.heading}>
                      <div>
                        <h2>{post.title}</h2>
                        <div className={styles.meta}>
                          <span>{listingLabels[post.listingType]}</span>
                          {post.type && <span>{post.type}</span>}
                          {post.city && <span>{post.city}</span>}
                          {post.breed && <span>{post.breed}</span>}
                        </div>
                      </div>

                      <span
                        className={`${styles.badge} ${styles[moderationStatus]}`}
                      >
                        {
                          moderationStatuses.find(
                            (item) => item.value === moderationStatus
                          )?.label
                        }
                      </span>
                    </div>

                    <p>{post.desc}</p>

                    <dl className={styles.details}>
                      <div>
                        <dt>Де бачили / знайшли</dt>
                        <dd>{animal?.foundLocation || post.city || "Не вказано"}</dd>
                      </div>
                      <div>
                        <dt>Хто подав</dt>
                        <dd>{animal?.foundByName || "Не вказано"}</dd>
                      </div>
                      <div>
                        <dt>Контакт</dt>
                        <dd>{animal?.foundByContact || "Не вказано"}</dd>
                      </div>
                    </dl>

                    <div className={styles.actions}>
                      <Link href={`/catalog/${post.slug}`}>Відкрити</Link>

                      <form action={updatePostModerationStatus}>
                        <input type="hidden" name="id" value={post._id.toString()} />
                        <button
                          className={styles.approve}
                          name="moderationStatus"
                          value="approved"
                          type="submit"
                        >
                          Схвалити
                        </button>
                      </form>

                      <form action={updatePostModerationStatus}>
                        <input type="hidden" name="id" value={post._id.toString()} />
                        <button
                          className={styles.reject}
                          name="moderationStatus"
                          value="rejected"
                          type="submit"
                        >
                          Відхилити
                        </button>
                      </form>

                      <form action={deletePost}>
                        <input type="hidden" name="id" value={post._id.toString()} />
                        <button className={styles.delete} type="submit">
                          Видалити
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AdminListSection>
  );
};

export default AdminLostFoundModeration;
