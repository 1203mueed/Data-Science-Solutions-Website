// src/components/Navbar.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import defaultAvatar from '../assets/default-avatar.jpg'; // Import the default avatar
import '../styles/Navbar.css';

const Navbar = ({ user, setUser }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user from localStorage
    setUser(null); // Update user state in App.js
    setShowDropdown(false); // Close the dropdown menu
    navigate('/'); // Redirect to home page
  };

  return (
    <nav className="navbar sticky">
      <div className="logo">
        <NavLink to="/">Your Website</NavLink>
      </div>
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/datasets">Datasets</NavLink>
        </li>
        <li>
          <NavLink to="/papers">Papers</NavLink>
        </li>
        <li>
          <NavLink to="/notebooks">Notebooks</NavLink>
        </li>
        <li>
          <NavLink to="/models">Models</NavLink>
        </li>
        <li>
          <NavLink to="/competitions">Competitions</NavLink>
        </li>
        <li>
          <NavLink to="/work-with-team">Work With a Team</NavLink>
        </li>
        <li>
          <NavLink to="/learn">Learn</NavLink>
        </li>
        <li>
          <NavLink to="/blogs">Blogs</NavLink>
        </li>
        <li>
          <NavLink to="/pricing">Pricing</NavLink>
        </li>
        <li>
          <NavLink to="/contact">Contact Us</NavLink>
        </li>

        {user ? (
          <div className="profile-container">
            <img
              src={user.image || defaultAvatar} // Use default avatar if no user image
              alt="Profile"
              className="profile-image"
              onClick={() => setShowDropdown(!showDropdown)} // Toggle dropdown visibility
            />
            {showDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/profile')}>View Profile</button>
                <button onClick={() => navigate('/notebooks')}>My Notebooks</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <li>
            <NavLink to="/login" className="login-btn">
              Log In
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
