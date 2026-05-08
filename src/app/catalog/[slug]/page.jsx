import Image from "next/image";
import styles from "./singlePost.module.css";
import PostUser from "@/components/postUser/postUser";
import { Suspense } from "react";
import { getPost } from "@/lib/data";
import { auth } from "@/lib/auth";
import Link from "next/link";

const getData = async (slug) => {
  const res = await fetch(`http://localhost:3000/api/catalog/${slug}`);

  if (!res.ok) {
    throw new Error("Щось пішло не так");
  }

  return res.json();
};

export const generateMetadata = async ({ params }) => {
  const { slug } = params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.desc,
  };
};

const SinglePostPage = async ({ params }) => {
  const { slug } = params;
  const session = await auth();
  const post = await getData(slug);

  return (
    <div className={styles.container}>
      {post.img && (
        <div className={styles.imgContainer}>
          <Image src={post.img} alt={post.title} fill className={styles.img} />
        </div>
      )}

      <div className={styles.textContainer}>
        <h1 className={styles.title}>{post.title}</h1>

        <div className={styles.detail}>
          {post && (
            <Suspense fallback={<div>Loading...</div>}>
              <PostUser userId={post.userId} />
            </Suspense>
          )}
        </div>

        <div className={styles.tags}>
          <span className={styles.tag}>{post.type}</span>
          <span className={styles.tag}>{post.ageGroups}</span>
          <span className={styles.tag}>{post.sizes}</span>

          {post.sex && (
            <span className={styles.tag}>
              {post.sex === "male" ? "Хлопчик" : "Дівчинка"}
            </span>
          )}

          {post.city && <span className={styles.tag}>{post.city}</span>}

          <span
            className={`${styles.tag} ${
              post.status === "available"
                ? styles.available
                : post.status === "reserved"
                ? styles.reserved
                : styles.adopted
            }`}
          >
            {post.status === "available"
              ? "Доступний"
              : post.status === "reserved"
              ? "Заброньований"
              : "Адоптований"}
          </span>
        </div>

        <div className={styles.content}>{post.desc}</div>

        {post.breedDescription && (
          <div className={styles.aiBlock}>
            <h3>AI аналіз породи</h3>

            <p>{post.breedDescription}</p>

            {post.breedTraits?.length > 0 && (
              <div className={styles.traits}>
                {post.breedTraits.map((trait, index) => (
                  <span key={index} className={styles.trait}>
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {session?.user && (
          <div className={styles.adoptionSection}>
            <Link href={`/adopt/${post.slug}`} className={styles.adoptionLink}>
              Заповнити форму на адопцію
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePostPage;