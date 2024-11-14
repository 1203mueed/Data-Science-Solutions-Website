// src/pages/ContactPage.js
import React from 'react';
import '../styles/ContactPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const ContactPage = () => {
  return (
    <div className="contact-page">
      <h1 className="contact-title">Contact Us</h1>

      <section className="contact-info">
        <div className="info-item">
          <h3>Email</h3>
          <p>support@yourwebsite.com</p>
        </div>
        <div className="info-item">
          <h3>Phone</h3>
          <p>+1 234 567 890</p>
        </div>
        <div className="info-item">
          <h3>Address</h3>
          <p>123 Main Street, Suite 400<br />Your City, Your State, ZIP</p>
        </div>
      </section>

      <section className="contact-form-section">
        <h2>Send Us a Message</h2>
        <form className="contact-form">
          <input type="text" name="name" placeholder="Your Name" required />
          <input type="email" name="email" placeholder="Your Email" required />
          <input type="text" name="subject" placeholder="Subject" required />
          <textarea name="message" rows="5" placeholder="Your Message" required></textarea>
          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      </section>

      <section className="social-media">
        <h2>Follow Us</h2>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FontAwesomeIcon icon={faFacebook} size="2x" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FontAwesomeIcon icon={faTwitter} size="2x" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FontAwesomeIcon icon={faLinkedin} size="2x" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
