// src/pages/LearnPage.js
import React from 'react';
import '../styles/LearnPage.css';

const LearnPage = () => {
  const courses = [
    {
      id: 1,
      title: "Introduction to Data Science",
      description: "Learn the basics of data science, including statistics, Python programming, and data visualization.",
      level: "Beginner",
      duration: "6 weeks",
    },
    {
      id: 2,
      title: "Machine Learning Fundamentals",
      description: "Understand the core concepts of machine learning and build your first models.",
      level: "Intermediate",
      duration: "8 weeks",
    },
    {
      id: 3,
      title: "Deep Learning Specialization",
      description: "Dive into neural networks, computer vision, and natural language processing.",
      level: "Advanced",
      duration: "10 weeks",
    },
    {
      id: 4,
      title: "Data Visualization Techniques",
      description: "Master tools like Tableau and Matplotlib to create stunning visualizations.",
      level: "Beginner",
      duration: "4 weeks",
    },
    {
      id: 5,
      title: "Big Data Analytics",
      description: "Explore big data tools like Hadoop and Spark for managing and analyzing large datasets.",
      level: "Advanced",
      duration: "12 weeks",
    },
    {
      id: 6,
      title: "Natural Language Processing",
      description: "Learn techniques to process and analyze text data with Python.",
      level: "Intermediate",
      duration: "8 weeks",
    },
  ];

  return (
    <div className="learn-page">
      <div className="search-bar">
        <input type="text" placeholder="Search courses..." />
        <button>Search</button>
      </div>
      <div className="learn-container">
        {courses.map((course) => (
          <div className="course-card" key={course.id}>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p>
              <strong>Level:</strong> {course.level}
            </p>
            <p>
              <strong>Duration:</strong> {course.duration}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearnPage;
