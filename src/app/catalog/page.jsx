"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/postCard/postCard";
import styles from "./catalog.module.css";
import SearchBar from "@/components/filters/SearchBar";
import CustomFilter from "@/components/filters/CustomFilter";

const CatalogPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, typeFilter, ageFilter, sizeFilter]);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let url = "/api/catalog";
        const params = new URLSearchParams();
        
        params.append("page", page.toString());
        params.append("limit", "9");
        if (searchTerm) params.append("search", searchTerm);
        if (typeFilter) params.append("type", typeFilter);
        if (ageFilter) params.append("age", ageFilter);
        if (sizeFilter) params.append("size", sizeFilter);
        
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPosts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, typeFilter, ageFilter, sizeFilter, page]);

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Адопція тварин</h1>
      
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

      <div className={styles.resultsSummary}>
        Знайдено: {total}
      </div>
      
      {isLoading ? (
        <div className={styles.loading}>Завантаження...</div>
      ) : (
        <div className={styles.posts}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div className={styles.post} key={post._id.toString()}>
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className={styles.empty}>Тварин не знайдено</div>
          )}
        </div>
      )}

      {pages > 1 && (
        <nav className={styles.pagination} aria-label="Сторінки каталогу">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            disabled={page === 1 || isLoading}
          >
            Назад
          </button>

          {Array.from({ length: pages }, (_, index) => index + 1).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setPage(item)}
              disabled={isLoading}
              className={item === page ? styles.activePage : ""}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </button>
          ))}

          <button
            type="button"
            onClick={() =>
              setPage((currentPage) => Math.min(currentPage + 1, pages))
            }
            disabled={page === pages || isLoading}
          >
            Далі
          </button>
        </nav>
      )}
    </div>
  );
};

export default CatalogPage;
