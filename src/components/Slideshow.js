// src/components/Slideshow.js
import React, { useEffect, useState } from 'react';

const Slideshow = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const slides = [
    '/img/ad1.png',
    '/img/ad2.png',
    '/img/ad3.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, [slides.length]);

  return (
    <div className="slideshow-container">
      {slides.map((src, index) => (
        <div
          key={index}
          className="slide"
          style={{ display: index === slideIndex ? 'block' : 'none' }}
        >
          <img src={src} alt={`Slide ${index + 1}`} />
        </div>
      ))}
    </div>
  );
};

export default Slideshow;
