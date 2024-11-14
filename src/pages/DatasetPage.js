// src/pages/DatasetPage.js
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/DatasetPage.css';

const DatasetPage = () => {
  const [datasets, setDatasets] = useState([
    { id: 1, name: "Skin Cancer Images", category: "Medical", dataType: "Image", price: "$50", status: "Uploaded" },
    { id: 2, name: "COVID-19 Cases", category: "Health", dataType: "Tabular", price: "Free", status: "Uploaded" },
    { id: 3, name: "Lung Disease Data", category: "Medical", dataType: "Image", price: "$70", status: "Requested" },
    { id: 4, name: "Geospatial Data", category: "Geospatial", dataType: "Image", price: "$100", status: "Uploaded" },
    { id: 5, name: "Air Quality Index", category: "Environment", dataType: "Tabular", price: "Free", status: "Uploaded" },
    { id: 6, name: "Diabetes Data", category: "Health", dataType: "Image", price: "$80", status: "Requested" },
    // Add more datasets as needed
  ]);

  const [filters, setFilters] = useState({ category: '', dataType: '', status: '', priceRange: '' });
  
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredDatasets = datasets.filter(dataset => (
    (filters.category ? dataset.category === filters.category : true) &&
    (filters.dataType ? dataset.dataType === filters.dataType : true) &&
    (filters.status ? dataset.status === filters.status : true) &&
    (filters.priceRange ? dataset.price.includes(filters.priceRange) : true)
  ));

  return (
    <div className="dataset-page">
      <Navbar />
      <h1 className="dataset-title">Datasets</h1>

      <section className="action-buttons">
        <button className="action-btn">Upload Dataset</button>
        <button className="action-btn">Request Dataset</button>
      </section>

      <section className="filters-section">
        <h2>Filter Datasets</h2>
        <select name="category" onChange={handleFilterChange}>
          <option value="">All Categories</option>
          <option value="Medical">Medical</option>
          <option value="Health">Health</option>
          <option value="Geospatial">Geospatial</option>
          <option value="Environment">Environment</option>
        </select>
        <select name="dataType" onChange={handleFilterChange}>
          <option value="">All Data Types</option>
          <option value="Image">Image</option>
          <option value="Tabular">Tabular</option>
        </select>
        <select name="status" onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="Uploaded">Uploaded</option>
          <option value="Requested">Requested</option>
        </select>
        <select name="priceRange" onChange={handleFilterChange}>
          <option value="">All Price Ranges</option>
          <option value="Free">Free</option>
          <option value="$50">$50</option>
          <option value="$70">$70</option>
          <option value="$100">$100</option>
        </select>
      </section>

      <section className="dataset-list">
        <h2>Available Datasets</h2>
        {filteredDatasets.map(dataset => (
          <div key={dataset.id} className="dataset-card">
            <h3>{dataset.name}</h3>
            <p><strong>Category:</strong> {dataset.category}</p>
            <p><strong>Data Type:</strong> {dataset.dataType}</p>
            <p><strong>Price:</strong> {dataset.price}</p>
            <p><strong>Status:</strong> {dataset.status}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default DatasetPage;
