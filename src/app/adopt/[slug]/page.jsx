import AdoptionForm from "@/components/adoptionForm/AdoptionForm";
import { getPost } from "@/lib/data";
import styles from "./page.module.css";

const AdoptionPage = async ({ params }) => {
  const { slug } = params;
  const post = await getPost(slug);

  if (post.status !== "available") {
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1>Ця тварина вже недоступна для адопції</h1>
      </div>
    </div>
  );
}

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1>Форма на адопцію {post.title}</h1>
        <AdoptionForm postId={post._id.toString()} />
      </div>
    </div>
  );
};

export default AdoptionPage;