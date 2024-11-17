// src/pages/WorkWithTeamPage.js
import React, { useState } from 'react';
import '../styles/WorkWithTeamPage.css';

const WorkWithTeamPage = () => {
  const [showMemberSearch, setShowMemberSearch] = useState(false);

  const toggleMemberSearch = () => setShowMemberSearch(!showMemberSearch);

  const teams = [
    { name: "AI Innovators", description: "Focus on healthcare AI solutions.", matchPercentage: 90 },
    { name: "Data Wizards", description: "Expertise in financial analytics.", matchPercentage: 80 },
    { name: "Visionary Minds", description: "Specializes in computer vision.", matchPercentage: 85 },
  ];

  const members = [
    { name: "John Doe", skills: "Deep Learning, Python, NLP", experience: "5 years in AI research." },
    { name: "Jane Smith", skills: "Computer Vision, TensorFlow, PyTorch", experience: "3 years in image processing." },
    { name: "Michael Brown", skills: "Data Analysis, R, SQL", experience: "4 years in data science." },
  ];

  return (
    <div className="work-with-team-page">
      <h1 className="page-title">Work With a Team</h1>
      
      <div className="action-buttons">
        <button className="toggle-member-search-btn" onClick={toggleMemberSearch}>
          {showMemberSearch ? "View Teams" : "Search for Team Member"}
        </button>
        <button className="post-request-btn">Post Team Member Request</button>
      </div>

      <div className="filter-section">
        <input type="text" placeholder="Search by skill, experience, etc." />
        <select>
          <option value="">All Locations</option>
          <option value="Remote">Remote</option>
          <option value="On-Site">On-Site</option>
        </select>
        <select>
          <option value="">All Project Types</option>
          <option value="AI">AI</option>
          <option value="Data Science">Data Science</option>
          <option value="Computer Vision">Computer Vision</option>
        </select>
      </div>

      <div className="listings">
        {showMemberSearch ? (
          members.map((member, index) => (
            <div key={index} className="member-card">
              <h3 className="member-name">{member.name}</h3>
              <p><strong>Skills:</strong> {member.skills}</p>
              <p><strong>Experience:</strong> {member.experience}</p>
              <button className="connect-btn">Connect</button>
            </div>
          ))
        ) : (
          teams.map((team, index) => (
            <div key={index} className="team-card">
              <h3 className="team-name">{team.name}</h3>
              <p className="team-description">{team.description}</p>
              <div className="skill-match-bar">
                <div className="match-fill" style={{ width: `${team.matchPercentage}%` }}>
                  {team.matchPercentage}%
                </div>
              </div>
              <button className="request-btn">Request to Join</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkWithTeamPage;
