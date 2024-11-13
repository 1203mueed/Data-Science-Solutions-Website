// src/pages/ModelDetailsPage.js
import React from 'react';
import Navbar from '../components/Navbar';
import ModelInformation from '../components/ModelInformation';
import ModelTestingForm from '../components/ModelTestingForm';
import '../styles/ModelDetailsPage.css';

const ModelDetailsPage = () => {
  return (
    <div className="model-details-page">
      <Navbar />
      <main className="content-center">
        <h1>Model Details</h1>
        <ModelInformation />
        <ModelTestingForm />
      </main>
    </div>
  );
};

export default ModelDetailsPage;
