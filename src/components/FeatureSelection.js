// src/components/FeatureSelection.js
import React, { useState } from 'react';

const FeatureSelection = ({ models, setFilteredModels }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState('');

  // Function to filter models based on search and selected filters
  const applyFilters = () => {
    const filtered = models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTask = taskFilter ? model.task === taskFilter : true;
      const matchesDataType = dataTypeFilter ? model.dataType === dataTypeFilter : true;
      return matchesSearch && matchesTask && matchesDataType;
    });
    setFilteredModels(filtered);
  };

  // Apply filters whenever search term or filters change
  React.useEffect(() => {
    applyFilters();
  }, [searchTerm, taskFilter, dataTypeFilter]);

  return (
    <div className="feature-selection">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search models"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filters">
        <label htmlFor="task-filter">Filter by Task</label>
        <select id="task-filter" value={taskFilter} onChange={(e) => setTaskFilter(e.target.value)}>
          <option value="">All Tasks</option>
          <option value="classification">Classification</option>
          <option value="object-detection">Object Detection</option>
          <option value="recommendation">Recommendation</option>
          <option value="chatbot">Chatbot</option>
          <option value="prediction">Prediction</option>
        </select>

        <label htmlFor="data-type-filter">Filter by Data Type</label>
        <select id="data-type-filter" value={dataTypeFilter} onChange={(e) => setDataTypeFilter(e.target.value)}>
          <option value="">All Data Types</option>
          <option value="image">Image</option>
          <option value="text">Text</option>
          <option value="audio">Audio</option>
        </select>
      </div>
    </div>
  );
};

export default FeatureSelection;
