"use client";

import { useState } from "react";

const SearchBar = ({ setSearchTerm }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    setSearchTerm(value); // Propagate changes to parent
  };

  return (
    <div className="searchbar">
      <div className="searchbar__item">
        <input
          type="text"
          value={localSearchTerm}
          onChange={handleChange}
          placeholder="Пошук за іменем..."
          className="searchbar__input"
        />
      </div>
    </div>
  );
};

export default SearchBar;