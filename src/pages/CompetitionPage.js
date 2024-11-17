// src/pages/CompetitionPage.js
import React from 'react';
import '../styles/CompetitionPage.css';

const CompetitionPage = () => {
  const competitions = [
    {
      title: "AI for Climate Change",
      startDate: "2024-02-01",
      endDate: "2024-03-01",
      status: "Ongoing",
      prizeMoney: "$10,000",
      description: "Innovate AI solutions to combat climate change. Develop predictive models to forecast environmental impacts."
    },
    {
      title: "Healthcare Diagnostics Challenge",
      startDate: "2023-11-01",
      endDate: "2023-12-01",
      status: "Closed",
      prizeMoney: "$15,000",
      description: "Revolutionize healthcare with diagnostic AI tools. Build models to detect early signs of disease."
    },
    {
      title: "Smart City Solutions",
      startDate: "2024-05-01",
      endDate: "2024-06-15",
      status: "Upcoming",
      prizeMoney: "$20,000",
      description: "Design AI-powered solutions for smart cities. Address challenges in traffic management and resource allocation."
    },
    {
      title: "Financial Prediction Challenge",
      startDate: "2024-03-01",
      endDate: "2024-04-01",
      status: "Upcoming",
      prizeMoney: "$8,000",
      description: "Develop predictive models for financial markets and gain insights into stock performance."
    },
    {
      title: "Image Classification Competition",
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      status: "Ongoing",
      prizeMoney: "$12,000",
      description: "Create machine learning models to classify images accurately across multiple categories."
    },
    {
      title: "Natural Language Processing Hackathon",
      startDate: "2023-10-01",
      endDate: "2023-11-01",
      status: "Closed",
      prizeMoney: "$6,500",
      description: "Leverage NLP to analyze sentiment, classify text, and enhance chatbots' conversational abilities."
    },
  ];

  return (
    <div className="competition-page">
      <main className="competition-content">
        <h1 className="competition-title">Competitions</h1>
        <button className="host-competition-btn">Host a Competition</button>
        <div className="competition-list">
          {competitions.map((comp, index) => (
            <div className="competition-card" key={index}>
              <h2 className="competition-card-title">{comp.title}</h2>
              <p className="competition-description">{comp.description}</p>
              <div className="competition-details">
                <p><strong>Start Date:</strong> {comp.startDate}</p>
                <p><strong>End Date:</strong> {comp.endDate}</p>
                <p><strong>Status:</strong> <span className={`status ${comp.status.toLowerCase()}`}>{comp.status}</span></p>
                <p><strong>Prize Money:</strong> {comp.prizeMoney}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CompetitionPage;
