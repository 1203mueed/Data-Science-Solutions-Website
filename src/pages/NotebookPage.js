// src/pages/NotebookPage.js
import React, { useState } from 'react';
import '../styles/NotebookPage.css';

const NotebookPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');

  const notebooks = [
    { id: 1, name: 'Skin Lesion Analysis', description: 'Analyze skin lesion images using CNNs.', topic: 'Healthcare', language: 'Python', uploader: 'User123' },
    { id: 2, name: 'Financial Forecasting', description: 'Predict stock trends with LSTMs.', topic: 'Finance', language: 'Python', uploader: 'FinanceGuru' },
    { id: 3, name: 'Sentiment Analysis', description: 'Perform sentiment analysis on tweets.', topic: 'NLP', language: 'Python', uploader: 'AIEnthusiast' },
    { id: 4, name: 'Traffic Analysis', description: 'Analyze traffic patterns using GPS data.', topic: 'Smart Cities', language: 'R', uploader: 'DataWrangler' },
    { id: 5, name: 'Object Detection', description: 'YOLO-based object detection tutorial.', topic: 'Computer Vision', language: 'Python', uploader: 'VisionExpert' },
    { id: 6, name: 'Customer Segmentation', description: 'K-means clustering for customer segmentation.', topic: 'Business', language: 'Python', uploader: 'MarketingPro' },
    { id: 7, name: 'Time Series Analysis', description: 'ARIMA model for time series forecasting.', topic: 'Finance', language: 'R', uploader: 'DataWizard' },
    { id: 8, name: 'Recommendation Systems', description: 'Collaborative filtering for movie recommendations.', topic: 'AI', language: 'Python', uploader: 'RecSysExpert' },
    { id: 9, name: 'Natural Language Generation', description: 'GPT-3-based text generation.', topic: 'NLP', language: 'Python', uploader: 'LangMaster' },
    { id: 10, name: 'Image Augmentation', description: 'Techniques to enhance image datasets.', topic: 'Computer Vision', language: 'Python', uploader: 'VisionExpert' },
  ];

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (topicFilter ? notebook.topic === topicFilter : true) &&
    (languageFilter ? notebook.language === languageFilter : true)
  );

  return (
    <div className="notebook-page">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notebooks"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button>Search</button>
      </div>

      {/* Actions */}
      <div className="notebook-actions">
        <button className="create-notebook-btn">Create Notebook</button>
        <button className="upload-notebook-btn">Upload Notebook</button>
      </div>

      <div className="notebooks-container">
        {/* Sidebar for Filters */}
        <aside className="sidebar">
          <h3>Filter Notebooks</h3>
          <label htmlFor="topic-filter">Filter by Topic</label>
          <select id="topic-filter" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)}>
            <option value="">All Topics</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="NLP">NLP</option>
            <option value="Smart Cities">Smart Cities</option>
            <option value="Computer Vision">Computer Vision</option>
            <option value="Business">Business</option>
            <option value="AI">AI</option>
          </select>

          <label htmlFor="language-filter">Filter by Language</label>
          <select id="language-filter" value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
            <option value="">All Languages</option>
            <option value="Python">Python</option>
            <option value="R">R</option>
            <option value="Julia">Julia</option>
          </select>

          <button className="apply-filters-btn">Apply Filters</button>
        </aside>

        {/* Notebook List */}
        <div className="notebook-list">
          {filteredNotebooks.map((notebook) => (
            <div key={notebook.id} className="notebook-card">
              <h3>{notebook.name}</h3>
              <p>{notebook.description}</p>
              <p>
                <strong>Topic:</strong> {notebook.topic}
              </p>
              <p>
                <strong>Language:</strong> {notebook.language}
              </p>
              <p>
                <strong>Uploaded by:</strong> {notebook.uploader}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotebookPage;
