// src/pages/PricingPage.js
import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/PricingPage.css';

const PricingPage = () => {
  const pricingPlans = [
    {
      title: "Basic",
      price: "$0",
      features: [
        "Access to free datasets",
        "Basic CPU usage (1 core)",
        "Team limit: 2 member",
        "Access to free notebooks",
        "Community support"
      ]
    },
    {
      title: "Standard",
      price: "$49/month",
      features: [
        "Access to premium datasets",
        "Standard GPU usage (4 cores)",
        "Team limit: up to 5 members",
        "Access to premium notebooks",
        "Email support",
        "5 GB cloud storage"
      ]
    },
    {
      title: "Premium",
      price: "$99/month",
      features: [
        "Unlimited dataset access",
        "Advanced GPU and CPU usage",
        "Team limit: up to 20 members",
        "Access to all notebooks and papers",
        "Priority email and chat support",
        "20 GB cloud storage"
      ]
    }
  ];

  return (
    <div className="pricing-page">
      <Navbar />
      <main className="pricing-content">
        <h1 className="pricing-title">Our Pricing Plans</h1>
        <div className="pricing-cards">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="pricing-card">
              <h2>{plan.title}</h2>
              <p className="price">{plan.price}</p>
              <ul>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button className="subscribe-btn">Choose Plan</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
