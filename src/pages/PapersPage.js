// src/pages/PapersPage.js
import React, { useState } from 'react';
import '../styles/PapersPage.css';

const PapersPage = () => {
  const [papers, setPapers] = useState([
    {
      id: 1,
      title: "Deep Learning for Skin Cancer Detection",
      abstract:
        "This paper explores the application of deep learning techniques in detecting skin cancer with high accuracy...",
      authors: "John Doe, Jane Smith",
      year: 2023,
      institution: "Harvard University",
      access: "Open Access",
    },
    {
      id: 2,
      title: "Natural Language Processing for Sentiment Analysis",
      abstract:
        "This research focuses on using NLP techniques for sentiment analysis in social media data...",
      authors: "Alice Johnson, Mark Lee",
      year: 2022,
      institution: "MIT",
      access: "Paid Access",
    },
    {
      id: 3,
      title: "Advances in Generative Adversarial Networks",
      abstract:
        "A comprehensive review of recent advances in GANs for image generation tasks...",
      authors: "Emily Davis, Robert Brown",
      year: 2021,
      institution: "Stanford University",
      access: "Open Access",
    },
    {
      id: 4,
      title: "AI Ethics in Healthcare",
      abstract:
        "This study addresses the ethical concerns of AI implementation in healthcare systems...",
      authors: "David White, Lily Green",
      year: 2023,
      institution: "Oxford University",
      access: "Open Access",
    },
    {
      id: 5,
      title: "Transformer Models in NLP",
      abstract:
        "This paper provides an overview of transformer-based architectures and their applications in NLP...",
      authors: "Sophia Brown, Liam Turner",
      year: 2020,
      institution: "Cambridge University",
      access: "Paid Access",
    },
    {
      id: 6,
      title: "Quantum Computing for AI",
      abstract:
        "An exploration of the potential of quantum computing in advancing AI applications...",
      authors: "Ethan Harris, Mia Collins",
      year: 2023,
      institution: "Princeton University",
      access: "Open Access",
    },
    {
      id: 7,
      title: "Sustainable AI Models",
      abstract:
        "A discussion on creating sustainable and energy-efficient AI models...",
      authors: "James Brown, Olivia Wilson",
      year: 2022,
      institution: "UC Berkeley",
      access: "Paid Access",
    },
  ]);

  return (
    <div className="papers-page">
      <div className="search-section">
        <input type="text" placeholder="Search papers..." />
        <button>Search</button>
        <button className="upload-paper-btn">Upload a Paper</button>
      </div>

      <div className="content-section">
        <aside className="filter-options">
          <h3>Filter Papers</h3>
          <label htmlFor="field">Research Field</label>
          <select id="field">
            <option value="">All Fields</option>
            <option value="AI">Artificial Intelligence</option>
            <option value="ML">Machine Learning</option>
            <option value="NLP">Natural Language Processing</option>
            <option value="CV">Computer Vision</option>
            <option value="Medical">Medical Research</option>
          </select>

          <label htmlFor="year">Publication Year</label>
          <select id="year">
            <option value="">All Years</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
          </select>

          <label htmlFor="institution">Institution</label>
          <select id="institution">
            <option value="">All Institutions</option>
            <option value="Harvard">Harvard University</option>
            <option value="MIT">MIT</option>
            <option value="Stanford">Stanford University</option>
          </select>

          <label htmlFor="access">Access Type</label>
          <select id="access">
            <option value="">All Access</option>
            <option value="Open">Open Access</option>
            <option value="Paid">Paid Access</option>
          </select>

          <button className="apply-filter-btn">Apply Filters</button>
        </aside>

        <div className="papers-list">
          {papers.map((paper) => (
            <div key={paper.id} className="paper-card">
              <h3>{paper.title}</h3>
              <p className="abstract">{paper.abstract}</p>
              <p className="authors">
                <strong>Authors:</strong> {paper.authors}
              </p>
              <p className="details">
                <strong>Year:</strong> {paper.year} |{" "}
                <strong>Institution:</strong> {paper.institution} |{" "}
                <strong>Access:</strong> {paper.access}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PapersPage;
