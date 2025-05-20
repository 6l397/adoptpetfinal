import AdoptionForm from "@/components/adoptionForm/AdoptionForm";
import { getPost } from "@/lib/data";
import styles from "./page.module.css";

const AdoptionPage = async ({ params }) => {
  const { slug } = params;
  const post = await getPost(slug);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <h1>Форма на адопцію {post.title}</h1>
        <AdoptionForm postId={post._id} />
      </div>
    </div>
  );
};

export default AdoptionPage;