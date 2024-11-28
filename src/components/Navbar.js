// src/components/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import defaultAvatar from '../assets/default-avatar.jpg'; // Import the default avatar
import '../styles/Navbar.css';

const Navbar = ({ user, setUser }) => {
  const [showDropdown, setShowDropdown] = useState(false); // For profile dropdown
  const [showMenu, setShowMenu] = useState(false); // For mobile menu
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('user'); // Remove user from localStorage
    setUser(null); // Update user state in App.js
    setShowDropdown(false); // Close the dropdown menu
    setShowMenu(false); // Close the mobile menu
    navigate('/'); // Redirect to home page
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
    setShowDropdown(false); // Close dropdown when toggling menu
  };

  const closeMenu = () => {
    setShowMenu(false);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <nav className="navbar sticky">
      <div className="logo">
        <NavLink to="/" onClick={closeMenu}>CollaborHub</NavLink>
      </div>

      {/* Hamburger Menu Button */}
      <button
        className="menu-toggle"
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={showMenu}
      >
        {/* Hamburger Icon */}
        <span className="hamburger"></span>
        <span className="hamburger"></span>
        <span className="hamburger"></span>
      </button>

      <ul className={`nav-links ${showMenu ? 'active' : ''}`}>
        {/* Always Visible Links */}
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} onClick={closeMenu}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/federated-training" onClick={closeMenu}>Federated Training</NavLink>
        </li>
        <li>
          <NavLink to="/models" onClick={closeMenu}>Models</NavLink>
        </li>
        <li>
          <NavLink to="/competitions" onClick={closeMenu}>Competitions</NavLink>
        </li>
        <li>
          <NavLink to="/work-with-team" onClick={closeMenu}>Work With a Team</NavLink>
        </li>
        <li>
          <NavLink to="/papers" onClick={closeMenu}>Papers</NavLink>
        </li>
        <li>
          <NavLink to="/datasets" onClick={closeMenu}>Datasets</NavLink>
        </li>
        <li>
          <NavLink to="/notebooks" onClick={closeMenu}>Notebooks</NavLink>
        </li>
        <li>
          <NavLink to="/learn" onClick={closeMenu}>Learn</NavLink>
        </li>
        <li>
          <NavLink to="/blogs" onClick={closeMenu}>Blogs</NavLink>
        </li>
        <li>
          <NavLink to="/pricing" onClick={closeMenu}>Pricing</NavLink>
        </li>
        <li>
          <NavLink to="/contact" onClick={closeMenu}>Contact Us</NavLink>
        </li>
        {/* Authentication Links */}
        {!user ? (
          <li>
            <NavLink to="/login" className="login-btn" onClick={closeMenu}>
              Log In
            </NavLink>
          </li>
        ) : (
          <li className="profile-container">
            <button
              className="profile-button"
              onClick={toggleDropdown}
              aria-haspopup="true"
              aria-expanded={showDropdown}
              ref={profileButtonRef}
            >
              <img
                src={user.image || defaultAvatar} // Use default avatar if no user image
                alt="Profile"
                className="profile-image"
              />
            </button>
            {showDropdown && (
              <div className={`dropdown-menu ${showDropdown ? 'show' : ''}`} ref={dropdownRef}>
                <button onClick={() => { navigate('/profile'); closeMenu(); }}>View Profile</button>
                <button onClick={() => { navigate('/notebooks'); closeMenu(); }}>My Notebooks</button>
                <button onClick={() => { navigate('/federated-training'); closeMenu(); }}>Federated Training</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
