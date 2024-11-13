// src/components/Footer.js
import React from 'react';
import '../styles/Footer.css';

const Footer = () => (
  <footer className="footer">
    <p>&copy; 2024 Your Website. All rights reserved.</p>
    <ul>
      <li><a href="#terms">Terms & Conditions</a></li>
      <li><a href="#privacy">Privacy Policy</a></li>
      <li><a href="#about">About Us</a></li>
    </ul>
  </footer>
);

export default Footer;
