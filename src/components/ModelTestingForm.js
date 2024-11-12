// src/components/ModelTestingForm.js
import React, { useState } from 'react';


const ModelTestingForm = () => {
  const [image, setImage] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setPredictions(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setError("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error uploading image.");
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setPredictions(data.predictions);
      }
    } catch (error) {
      setError("An error occurred while fetching predictions.");
    }
  };

  return (
    <section className="upload-section">
      <form onSubmit={handleSubmit}>
        <label htmlFor="image">Upload an Image for Testing:</label>
        <input type="file" name="image" accept="image/*" onChange={handleImageChange} required />
        <button type="submit">Test Model</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {predictions && (
        <section className="predictions-section">
          <h2>Predictions</h2>
          <div className="prediction-results">
            <p><strong>Super Class:</strong> {predictions.super_class}</p>
            <p><strong>Malignancy:</strong> {predictions.malignancy}</p>
            <p><strong>Main Class 1:</strong> {predictions.main_class_1}</p>
            <p><strong>Main Class 2:</strong> {predictions.main_class_2}</p>
            <p><strong>Sub Class:</strong> {predictions.sub_class}</p>
          </div>

          {/* Display Uploaded Image */}
          <h3>Uploaded Image:</h3>
          <img src={URL.createObjectURL(image)} alt="Uploaded Preview" className="uploaded-image" />
        </section>
      )}
    </section>
  );
};

export default ModelTestingForm;
