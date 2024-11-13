// src/pages/Models.js
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import '../styles/Models.css';

const Models = () => {
  const initialModels = useMemo(() => [
    { id: 1, name: "Skin Lesion Detection", description: "Analyze image data to determine different types of skin lesions.", publishedBy: "NSU_ACERS", task: "classification", dataType: "image" },
    { id: 2, name: "Image Classification Model", description: "Classify images into various categories with high accuracy.", publishedBy: "VisionExpert", task: "classification", dataType: "image" },
    { id: 3, name: "Object Detection Model", description: "Detect and identify objects within an image.", publishedBy: "AI Innovators", task: "object-detection", dataType: "image" },
    { id: 4, name: "Speech Recognition Model", description: "Convert spoken language into text with high accuracy.", publishedBy: "VoiceTech", task: "classification", dataType: "audio" },
    { id: 5, name: "Text Summarization Model", description: "Summarize long articles into concise summaries.", publishedBy: "TextNinja", task: "classification", dataType: "text" },
    { id: 6, name: "Translation Model", description: "Translate text from one language to another.", publishedBy: "GlobalTrans", task: "classification", dataType: "text" },
    { id: 7, name: "Recommendation Model", description: "Recommend products or content based on user preferences.", publishedBy: "RecoMaster", task: "recommendation", dataType: "text" },
    { id: 8, name: "Chatbot Model", description: "Engage in conversations and answer questions.", publishedBy: "ChatBotCo", task: "chatbot", dataType: "text" },
    { id: 9, name: "Weather Prediction Model", description: "Predict weather conditions based on historical data.", publishedBy: "WeatherGenius", task: "prediction", dataType: "text" },
  ], []); // Note the empty dependency array

  const [filteredModels, setFilteredModels] = useState(initialModels);
  const [searchTerm, setSearchTerm] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState('');

  const handleSearch = useCallback(() => {
    const filtered = initialModels.filter(model =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (taskFilter ? model.task === taskFilter : true) &&
      (dataTypeFilter ? model.dataType === dataTypeFilter : true)
    );
    setFilteredModels(filtered);
  }, [initialModels, searchTerm, taskFilter, dataTypeFilter]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, taskFilter, dataTypeFilter, handleSearch]);

  return (
    <div className="models-page">
      <Navbar />
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search models"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="models-container">
        <aside className="sidebar">
          <h3>Filter Models</h3>
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
          <button className="apply-filters-btn" onClick={handleSearch}>Apply Filters</button>
        </aside>
        <div className="model-list">
          {filteredModels.map((model) => (
            <a href="/model-details" key={model.id} className="model-card">
              <h3>{model.name}</h3>
              <p>{model.description}</p>
              <p><strong>Published by:</strong> {model.publishedBy}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Models;
