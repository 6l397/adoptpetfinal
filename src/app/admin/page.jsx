// app/admin/page.js
import Link from "next/link";
import { Suspense } from "react";
import styles from "./admin.module.css";
import AdminPosts from "@/components/adminPosts/adminPosts";
import AdminPostForm from "@/components/adminPostForm/adminPostForm";
import AdminUsers from "@/components/adminUsers/adminUsers";
import AdminUserForm from "@/components/adminUserForm/adminUserForm";
import AdminForms from "@/components/adminForms/AdminForms";
import AdminAnimals from "@/components/adminAnimals/AdminAnimals";
import AdminLostFoundModeration from "@/components/adminLostFoundModeration/AdminLostFoundModeration";
import { auth } from "@/lib/auth";

const AdminPage = async ({ searchParams }) => {
  const session = await auth();
  const formStatus =
    typeof searchParams?.formStatus === "string" ? searchParams.formStatus : "";
  const animalSearch =
    typeof searchParams?.animalSearch === "string"
      ? searchParams.animalSearch
      : "";
  const postSearch =
    typeof searchParams?.postSearch === "string" ? searchParams.postSearch : "";
  const userSearch =
    typeof searchParams?.userSearch === "string" ? searchParams.userSearch : "";
  const lostFoundSearch =
    typeof searchParams?.lostFoundSearch === "string"
      ? searchParams.lostFoundSearch
      : "";
  const lostFoundStatus =
    typeof searchParams?.lostFoundStatus === "string"
      ? searchParams.lostFoundStatus
      : "pending";

  return (
    <div className={styles.container}>
      <div className={styles.dashboardLinkPanel}>
        <div>
          <span>Внутрішня аналітика</span>
          <h1>Дашборд з графіками</h1>
          <p>
            Кількість котів і собак, статуси адопції, породи, вік, регіони та
            заявки в одному місці.
          </p>
        </div>
        <Link href="/admin/dashboard">Відкрити дашборд</Link>
      </div>

      <div className={styles.row}>
        <div className={styles.col}>
          <Suspense fallback={<div>Loading...</div>}>
            <AdminPosts
              search={postSearch}
              userSearch={userSearch}
              formStatus={formStatus}
              animalSearch={animalSearch}
            />
          </Suspense>
        </div>
        <div className={styles.col}>
          <AdminPostForm userId={session.user.id} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Suspense fallback={<div>Loading...</div>}>
            <AdminUsers
              search={userSearch}
              postSearch={postSearch}
              formStatus={formStatus}
              animalSearch={animalSearch}
            />
          </Suspense>
        </div>
        <div className={styles.col}>
          <AdminUserForm />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.col}>
          <Suspense fallback={<div>Loading...</div>}>
            <AdminForms
              status={formStatus}
              animalSearch={animalSearch}
              postSearch={postSearch}
              userSearch={userSearch}
            />
          </Suspense>
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.col} ${styles.wide}`}>
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLostFoundModeration
              search={lostFoundSearch}
              status={lostFoundStatus}
              formStatus={formStatus}
              postSearch={postSearch}
              userSearch={userSearch}
              animalSearch={animalSearch}
            />
          </Suspense>
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.col} ${styles.wide}`}>
          <Suspense fallback={<div>Loading...</div>}>
            <AdminAnimals
              search={animalSearch}
              formStatus={formStatus}
              postSearch={postSearch}
              userSearch={userSearch}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
