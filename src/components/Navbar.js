// src/components/Navbar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => (
  <nav className="navbar sticky">
    <div className="logo"><NavLink to="/">Your Website</NavLink></div>
    <ul>
      <li><NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink></li>
      <li><NavLink to="/datasets">Datasets</NavLink></li>
      <li><NavLink to="/papers">Papers</NavLink></li>
      <li><NavLink to="/notebooks">Notebooks</NavLink></li>
      <li><NavLink to="/models">Models</NavLink></li>
      <li><NavLink to="/competitions">Competitions</NavLink></li>
      <li><NavLink to="/work-with-team">Work With a Team</NavLink></li>
      <li><NavLink to="/learn">Learn</NavLink></li>
      <li><NavLink to="/blogs">Blogs</NavLink></li>
      <li><NavLink to="/pricing">Pricing</NavLink></li>
      <li><NavLink to="/contact">Contact Us</NavLink></li>
      <li><NavLink to="/login" className="login-btn">Log In</NavLink></li>
    </ul>
  </nav>
);

export default Navbar;