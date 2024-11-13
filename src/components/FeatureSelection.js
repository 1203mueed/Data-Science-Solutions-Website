// src/components/FeatureSelection.js
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/FeatureSelection.css';

const FeatureSelection = ({ models, setFilteredModels }) => {
  const [taskFilter, setTaskFilter] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState('');

  // Memoized applyFilters function
  const applyFilters = useCallback(() => {
    const filtered = models.filter(model => {
      const matchesTask = taskFilter ? model.task === taskFilter : true;
      const matchesDataType = dataTypeFilter ? model.dataType === dataTypeFilter : true;
      return matchesTask && matchesDataType;
    });
    setFilteredModels(filtered);
  }, [models, taskFilter, dataTypeFilter, setFilteredModels]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="feature-selection">
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

        <button className="apply-filters-btn" onClick={applyFilters}>Apply Filters</button>
      </div>
    </div>
  );
};

export default FeatureSelection;
