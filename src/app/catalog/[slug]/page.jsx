import Image from "next/image";
import styles from "./singlePost.module.css";
import PostUser from "@/components/postUser/postUser";
import { Suspense } from "react";
import { getAnimalByPostId, getPost } from "@/lib/data";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

export const generateMetadata = async ({ params }) => {
  const { slug } = params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Оголошення не знайдено",
    };
  }

  return {
    title: post.title,
    description: post.desc,
  };
};

const SinglePostPage = async ({ params }) => {
  const { slug } = params;
  const session = await auth();
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const listingType = post.listingType || "adoption";
  const isAdoptionListing = listingType === "adoption";
  const isPrivateLostFound =
    !isAdoptionListing &&
    (post.moderationStatus || "approved") !== "approved";
  const isOwner = String(post.userId) === session?.user?.id;

  if (isPrivateLostFound && !isOwner && !session?.user?.isAdmin) {
    notFound();
  }

  const animal = await getAnimalByPostId(post._id);
  const medicalNotes = (animal?.diseases || []).filter(Boolean);

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

          {isAdoptionListing ? (
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
          ) : (
            <span
              className={`${styles.tag} ${
                listingType === "lost" ? styles.lost : styles.found
              }`}
            >
              {listingType === "lost" ? "Загублена" : "Знайдена"}
            </span>
          )}
        </div>

        <div className={styles.content}>{post.desc}</div>

        <details className={styles.healthPanel}>
          <summary>Медичний стан</summary>

          {medicalNotes.length > 0 ? (
            <ul>
              {medicalNotes.map((note, index) => (
                <li key={`${note}-${index}`}>{note}</li>
              ))}
            </ul>
          ) : (
            <p>Медичну інформацію ще не додано.</p>
          )}
        </details>

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

        {isAdoptionListing && session?.user && (
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
