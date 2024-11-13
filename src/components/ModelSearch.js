// src/components/ModelSearch.js
import React, { useState, useCallback } from 'react';
import '../styles/ModelSearch.css';

const ModelSearch = ({ models, setFilteredModels }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = useCallback(() => {
    const filtered = models.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredModels(filtered);
  }, [models, searchTerm, setFilteredModels]);

  return (
    <div className="model-search">
      <input
        type="text"
        placeholder="Search models"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

export default ModelSearch;
