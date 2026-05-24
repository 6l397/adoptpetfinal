import { getUsers } from "@/lib/data";
import styles from "./adminUsers.module.css";
import Image from "next/image";
import { deleteUser } from "@/lib/action";
import AdminListSection from "@/components/adminListSection/AdminListSection";

const AdminUsers = async ({
  search = "",
  postSearch = "",
  formStatus = "",
  animalSearch = "",
}) => {
  const normalizedSearch = search.trim();
  const users = await getUsers({ search: normalizedSearch });

  return (
    <AdminListSection
      title="Користувачі"
      count={users.length}
      defaultOpen={Boolean(normalizedSearch)}
    >
      <div className={styles.container}>
        <form action="/admin" method="get" className={styles.filters}>
          {postSearch && <input type="hidden" name="postSearch" value={postSearch} />}
          {formStatus && <input type="hidden" name="formStatus" value={formStatus} />}
          {animalSearch && (
            <input type="hidden" name="animalSearch" value={animalSearch} />
          )}

          <label>
            <span>Пошук</span>
            <input
              type="search"
              name="userSearch"
              defaultValue={normalizedSearch}
              placeholder="Username або email"
            />
          </label>

          <button type="submit">Знайти</button>
        </form>

        {users.length === 0 ? (
          <p className={styles.empty}>Користувачів не знайдено.</p>
        ) : (
          users.map((user) => (
            <div className={styles.user} key={user._id.toString()}>
              <div className={styles.detail}>
                <Image
                  src={user.img || "/noavatar.png"}
                  alt=""
                  width={50}
                  height={50}
                />
                <span>{user.username}</span>
              </div>
              <form action={deleteUser}>
                <input type="hidden" name="id" value={user._id.toString()} />
                <button className={styles.userButton}>Видалити</button>
              </form>
            </div>
          ))
        )}
      </div>
    </AdminListSection>
  );
};

export default AdminUsers;
