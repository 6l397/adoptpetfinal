"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/postCard/postCard";
import styles from "./catalog.module.css";
import SearchBar from "@/components/filters/SearchBar";
import CustomFilter from "@/components/filters/CustomFilter";

const CatalogPage = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let url = "/api/catalog";
        const params = new URLSearchParams();
        
        if (searchTerm) params.append("search", searchTerm);
        if (typeFilter) params.append("type", typeFilter);
        if (ageFilter) params.append("age", ageFilter);
        if (sizeFilter) params.append("size", sizeFilter);
        
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPosts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, typeFilter, ageFilter, sizeFilter]);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Каталог тварин</h1>
      
      <div className={styles.filters}>
        <div className={styles.searchbar}>
          <SearchBar setSearchTerm={setSearchTerm} />
        </div>
        <div className={styles.customFilter}>
          <CustomFilter setFilter={setTypeFilter} filterType="type" />
        </div>
        <div className={styles.customFilter}>
          <CustomFilter setFilter={setAgeFilter} filterType="age" />
        </div>
        <div className={styles.customFilter}>
          <CustomFilter setFilter={setSizeFilter} filterType="size" />
        </div>
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Завантаження...</div>
      ) : (
        <div className={styles.posts}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div className={styles.post} key={post.id || post._id}>
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className={styles.empty}>Тварин не знайдено</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;