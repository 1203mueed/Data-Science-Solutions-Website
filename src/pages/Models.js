// src/pages/Models.js
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FeatureSelection from '../components/FeatureSelection';

const Models = () => {
  const initialModels = [
    { id: 1, name: "Skin Lesion Detection", description: "Analyze image data to determine different types of skin lesions.", publishedBy: "NSU_ACERS", task: "classification", dataType: "image" },
    { id: 2, name: "Image Classification Model", description: "Classify images into various categories with high accuracy.", publishedBy: "VisionExpert", task: "classification", dataType: "image" },
    { id: 3, name: "Object Detection Model", description: "Detect and identify objects within an image.", publishedBy: "AI Innovators", task: "object-detection", dataType: "image" },
    { id: 4, name: "Speech Recognition Model", description: "Convert spoken language into text with high accuracy.", publishedBy: "VoiceTech", task: "classification", dataType: "audio" },
    { id: 5, name: "Text Summarization Model", description: "Summarize long articles into concise summaries.", publishedBy: "TextNinja", task: "classification", dataType: "text" },
    { id: 6, name: "Translation Model", description: "Translate text from one language to another.", publishedBy: "GlobalTrans", task: "classification", dataType: "text" },
    { id: 7, name: "Recommendation Model", description: "Recommend products or content based on user preferences.", publishedBy: "RecoMaster", task: "recommendation", dataType: "text" },
    { id: 8, name: "Chatbot Model", description: "Engage in conversations and answer questions.", publishedBy: "ChatBotCo", task: "chatbot", dataType: "text" },
    { id: 9, name: "Weather Prediction Model", description: "Predict weather conditions based on historical data.", publishedBy: "WeatherGenius", task: "prediction", dataType: "text" },
  ];

  const [filteredModels, setFilteredModels] = useState(initialModels);

  return (
    <div>
      <Navbar />
      <section className="models-page">
        <div className="container">
          <aside className="sidebar">
            <FeatureSelection models={initialModels} setFilteredModels={setFilteredModels} />
          </aside>

          <div className="main-content">
            <div className="models-container">
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
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Models;
