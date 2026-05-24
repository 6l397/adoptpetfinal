import Link from "next/link";
import { updateAnimal } from "@/lib/action";
import { getAnimals } from "@/lib/data";
import AdminListSection from "@/components/adminListSection/AdminListSection";
import styles from "./adminAnimals.module.css";

const statusLabels = {
  available: "Доступний",
  reserved: "Зарезервований",
  adopted: "Адоптований",
};

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

const serializeDocuments = (documents = []) =>
  documents
    .map((document) =>
      document.url ? `${document.name} | ${document.url}` : document.name
    )
    .join("\n");

const AdminAnimals = async ({
  search = "",
  formStatus = "",
  postSearch = "",
  userSearch = "",
}) => {
  const normalizedSearch = search.trim();
  const animals = await getAnimals({ search: normalizedSearch });

  return (
    <AdminListSection
      title="Картки тварин"
      count={animals.length}
      defaultOpen={Boolean(normalizedSearch)}
    >
      <div className={styles.container}>
      <form action="/admin" method="get" className={styles.filters}>
        {formStatus && (
          <input type="hidden" name="formStatus" value={formStatus} />
        )}
        {postSearch && <input type="hidden" name="postSearch" value={postSearch} />}
        {userSearch && <input type="hidden" name="userSearch" value={userSearch} />}

        <label>
          <span>Пошук</span>
          <input
            type="search"
            name="animalSearch"
            defaultValue={normalizedSearch}
            placeholder="Назва, місто, порода, контакт..."
          />
        </label>

        <button type="submit">Знайти</button>
      </form>

      {animals.length === 0 ? (
        <p className={styles.empty}>
          {normalizedSearch
            ? "Карток тварин не знайдено."
            : "Карток тварин ще немає."}
        </p>
      ) : (
        <div className={styles.animals}>
          {animals.map((animal) => {
            const post = animal.postId;
            const listingType = post?.listingType || "adoption";
            const isLostFound = ["lost", "found"].includes(listingType);
            const moderationStatus = post?.moderationStatus || "approved";

            return (
              <details
                className={styles.animal}
                key={animal._id.toString()}
              >
                <summary className={styles.animalSummary}>
                  <div className={styles.post}>
                    <h2>{post?.title || "Оголошення видалено"}</h2>

                    {post ? (
                      <div className={styles.meta}>
                        <span>{listingLabels[listingType]}</span>
                        <span>{post.type}</span>
                        {post.breed && <span>{post.breed}</span>}
                        {post.city && <span>{post.city}</span>}
                        <span>
                          {isLostFound
                            ? moderationLabels[moderationStatus]
                            : statusLabels[post.status] || post.status}
                        </span>
                      </div>
                    ) : (
                      <p className={styles.orphan}>
                        Ця картка більше не має пов&apos;язаного поста.
                      </p>
                    )}
                  </div>
                </summary>

                <form action={updateAnimal} className={styles.editor}>
                  <input type="hidden" name="id" value={animal._id.toString()} />

                  {post && (
                    <Link
                      className={styles.catalogLink}
                      href={`/catalog/${post.slug}`}
                    >
                      Відкрити картку
                    </Link>
                  )}

                  <div className={styles.fields}>
                    <label>
                      <span>Де бачили / знайшли</span>
                      <input
                        type="text"
                        name="foundLocation"
                        defaultValue={animal.foundLocation}
                      />
                    </label>

                    <label>
                      <span>Хто подав / знайшов</span>
                      <input
                        type="text"
                        name="foundByName"
                        defaultValue={animal.foundByName}
                      />
                    </label>

                    <label>
                      <span>Контакт</span>
                      <input
                        type="text"
                        name="foundByContact"
                        defaultValue={animal.foundByContact}
                      />
                    </label>
                  </div>

                  <div className={styles.notes}>
                    <label>
                      <span>Хвороби або діагнози</span>
                      <textarea
                        name="diseases"
                        rows={4}
                        defaultValue={(animal.diseases || []).join("\n")}
                        placeholder="Один запис на рядок"
                      />
                    </label>

                    <label>
                      <span>Документи</span>
                      <textarea
                        name="documents"
                        rows={4}
                        defaultValue={serializeDocuments(animal.documents)}
                        placeholder="Назва | посилання"
                      />
                    </label>
                  </div>

                  <button type="submit" className={styles.save}>
                    Зберегти картку
                  </button>
                </form>
              </details>
            );
          })}
        </div>
      )}
      </div>
    </AdminListSection>
  );
};

export default AdminAnimals;
