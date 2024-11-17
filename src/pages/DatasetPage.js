// src/pages/DatasetPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/DatasetPage.css';

const dummyDatasets = [
  {
    _id: '1',
    name: 'Global Temperature Data',
    details: 'Detailed climate data from 1900 to 2023',
    category: 'Environment',
    dataType: 'Tabular',
    price: 0,
    status: 'uploaded',
  },
  {
    _id: '2',
    name: 'Lung Cancer Research Dataset',
    details: 'Images and tabular data for lung cancer prediction',
    category: 'Medical',
    dataType: 'Image',
    price: 100,
    status: 'uploaded',
  },
  {
    _id: '3',
    name: 'Urban Traffic Patterns',
    details: 'Real-time traffic data from metropolitan cities',
    category: 'Geospatial',
    dataType: 'Tabular',
    price: 50,
    status: 'requested',
  },
  {
    _id: '4',
    name: 'COVID-19 Cases Worldwide',
    details: 'Case-by-case analysis of COVID-19 from 2020-2022',
    category: 'Health',
    dataType: 'Tabular',
    price: 0,
    status: 'uploaded',
  },
  {
    _id: '5',
    name: 'Air Quality Index Data',
    details: 'Monthly air quality data across 50 countries',
    category: 'Environment',
    dataType: 'Tabular',
    price: 75,
    status: 'requested',
  },
  {
    _id: '6',
    name: 'Diabetes Study Dataset',
    details: 'Detailed patient data for diabetes research',
    category: 'Medical',
    dataType: 'Tabular',
    price: 90,
    status: 'uploaded',
  },
  {
    _id: '7',
    name: 'Forest Fire Data',
    details: 'Comprehensive data on forest fires across regions',
    category: 'Environment',
    dataType: 'Image',
    price: 50,
    status: 'uploaded',
  },
  {
    _id: '8',
    name: 'Heart Disease Analysis',
    details: 'Data on heart disease prediction models',
    category: 'Health',
    dataType: 'Tabular',
    price: 0,
    status: 'uploaded',
  },
  {
    _id: '9',
    name: 'Crop Yield Dataset',
    details: 'Agricultural data for predicting crop yields',
    category: 'Environment',
    dataType: 'Tabular',
    price: 100,
    status: 'uploaded',
  },
  {
    _id: '10',
    name: 'Solar Energy Utilization',
    details: 'Data on solar energy installations worldwide',
    category: 'Environment',
    dataType: 'Image',
    price: 50,
    status: 'requested',
  },
];

const DatasetPage = ({ user }) => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [filters, setFilters] = useState({ category: '', dataType: '', status: '', priceRange: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const datasetsPerPage = 5;

  useEffect(() => {
    // Fetch datasets from the backend
    const fetchDatasets = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/datasets');
        const backendDatasets = await response.json();
        setDatasets([...backendDatasets.datasets, ...dummyDatasets]);
      } catch (err) {
        console.error('Failed to fetch datasets:', err);
        setDatasets([...dummyDatasets]); // Fallback to dummy data in case of an error
      }
    };

    fetchDatasets();
  }, []);

  const filteredDatasets = datasets.filter((dataset) => (
    (filters.category ? dataset.category === filters.category : true) &&
    (filters.dataType ? dataset.dataType === filters.dataType : true) &&
    (filters.status ? dataset.status === filters.status : true) &&
    (filters.priceRange ? dataset.price.toString().includes(filters.priceRange) : true)
  ));

  const indexOfLastDataset = currentPage * datasetsPerPage;
  const indexOfFirstDataset = indexOfLastDataset - datasetsPerPage;
  const currentDatasets = filteredDatasets.slice(indexOfFirstDataset, indexOfLastDataset);

  const totalPages = Math.ceil(filteredDatasets.length / datasetsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleButtonClick = (path) => {
    if (user) {
      navigate(path);
    } else {
      alert('Please log in first.');
      navigate('/login');
    }
  };

  return (
    <div className="dataset-page">
      <h1 className="dataset-title">Datasets</h1>

      <section className="action-buttons">
        <button
          className="action-btn"
          onClick={() => handleButtonClick('/upload-dataset')}
        >
          Upload Dataset
        </button>
        <button
          className="action-btn"
          onClick={() => handleButtonClick('/request-dataset')}
        >
          Request Dataset
        </button>
      </section>

      <section className="filters-section">
        <h2>Filter Datasets</h2>
        <select name="category" onChange={handleFilterChange}>
          <option value="">All Categories</option>
          <option value="Medical">Medical</option>
          <option value="Health">Health</option>
          <option value="Environment">Environment</option>
          <option value="Geospatial">Geospatial</option>
        </select>
        <select name="dataType" onChange={handleFilterChange}>
          <option value="">All Data Types</option>
          <option value="Image">Image</option>
          <option value="Tabular">Tabular</option>
        </select>
        <select name="status" onChange={handleFilterChange}>
          <option value="">All Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="requested">Requested</option>
        </select>
        <select name="priceRange" onChange={handleFilterChange}>
          <option value="">All Price Ranges</option>
          <option value="0">Free</option>
          <option value="50">Below $50</option>
          <option value="100">Below $100</option>
        </select>
      </section>

      <section className="dataset-list">
        <h2>Available Datasets</h2>
        {currentDatasets.map((dataset) => (
          <div key={dataset._id} className="dataset-card">
            <h3>{dataset.name}</h3>
            <p><strong>Category:</strong> {dataset.category}</p>
            <p><strong>Data Type:</strong> {dataset.dataType}</p>
            <p><strong>Price:</strong> {dataset.price === 0 ? 'Free' : `$${dataset.price}`}</p>
            <p><strong>Status:</strong> {dataset.status}</p>
          </div>
        ))}
        {filteredDatasets.length === 0 && <p>No datasets found.</p>}
      </section>

      <section className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
            onClick={() => handlePageChange(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </section>
    </div>
  );
};

export default DatasetPage;
