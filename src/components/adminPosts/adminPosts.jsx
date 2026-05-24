import { getPosts } from "@/lib/data";
import styles from "./adminPosts.module.css";
import Image from "next/image";
import { deletePost, updatePostListingType } from "@/lib/action";
import Link from "next/link";
import AdminListSection from "@/components/adminListSection/AdminListSection";
import { listingTypes, moderationStatuses } from "@/constants";

const AdminPosts = async ({
  search = "",
  userSearch = "",
  formStatus = "",
  animalSearch = "",
}) => {
  const normalizedSearch = search.trim();
  const posts = await getPosts({ search: normalizedSearch });

  return (
    <AdminListSection
      title="Тварини"
      count={posts.length}
      defaultOpen={Boolean(normalizedSearch)}
    >
      <div className={styles.container}>
        <form action="/admin" method="get" className={styles.filters}>
          {userSearch && <input type="hidden" name="userSearch" value={userSearch} />}
          {formStatus && <input type="hidden" name="formStatus" value={formStatus} />}
          {animalSearch && (
            <input type="hidden" name="animalSearch" value={animalSearch} />
          )}

          <label>
            <span>Пошук</span>
            <input
              type="search"
              name="postSearch"
              defaultValue={normalizedSearch}
              placeholder="Назва або slug"
            />
          </label>

          <button type="submit">Знайти</button>
        </form>

        {posts.length === 0 ? (
          <p className={styles.empty}>Оголошень не знайдено.</p>
        ) : (
          posts.map((post) => (
            <div className={styles.post} key={post._id.toString()}>
              <Link
                href={`/catalog/${post.slug}`}
                className={styles.detail}
                title="Відкрити картку тварини"
              >
                <Image src={post.img} alt="" width={50} height={50} />
                <span className={styles.postTitle}>{post.title}</span>
              </Link>
              <div className={styles.actions}>
                <span
                  className={`${styles.badge} ${
                    styles[post.moderationStatus || "approved"]
                  }`}
                >
                  {
                    moderationStatuses.find(
                      (item) =>
                        item.value === (post.moderationStatus || "approved")
                    )?.label
                  }
                </span>

                <form action={updatePostListingType} className={styles.listingType}>
                  <input type="hidden" name="id" value={post._id.toString()} />
                  <select
                    name="listingType"
                    defaultValue={post.listingType || "adoption"}
                    aria-label={`Тип оголошення ${post.title}`}
                  >
                    {listingTypes.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <button type="submit">Зберегти</button>
                </form>

                <form action={deletePost}>
                  <input type="hidden" name="id" value={post._id.toString()} />
                  <button className={styles.postButton}>Видалити</button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminListSection>
  );
};

export default AdminPosts;
