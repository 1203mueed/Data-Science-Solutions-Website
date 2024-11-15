// src/pages/BlogsPage.js
import React from 'react';
import '../styles/BlogsPage.css';

const BlogsPage = () => {
  const blogs = [
    {
      id: 1,
      title: "The Future of AI in Healthcare",
      author: "John Doe",
      date: "2024-11-01",
      content: "Artificial intelligence is revolutionizing healthcare by improving diagnosis, personalizing treatments, and reducing costs.",
      reactions: 120,
      feedbacks: 25,
    },
    {
      id: 2,
      title: "Top 10 Python Libraries for Data Science",
      author: "Jane Smith",
      date: "2024-10-20",
      content: "Explore the best Python libraries like Pandas, NumPy, and Scikit-learn that every data scientist should know.",
      reactions: 95,
      feedbacks: 18,
    },
    {
      id: 3,
      title: "Understanding Neural Networks",
      author: "Alice Johnson",
      date: "2024-11-10",
      content: "Dive deep into the world of neural networks, their architectures, and their applications in AI.",
      reactions: 80,
      feedbacks: 12,
    },
    {
      id: 4,
      title: "Big Data Analytics in Modern Businesses",
      author: "Bob Brown",
      date: "2024-09-15",
      content: "Learn how big data analytics is transforming industries by providing valuable insights and driving better decisions.",
      reactions: 65,
      feedbacks: 10,
    },
    {
      id: 5,
      title: "Tips for Building a Successful Data Science Portfolio",
      author: "Carol Lee",
      date: "2024-10-05",
      content: "Discover tips and tricks to showcase your data science skills and stand out in the job market.",
      reactions: 110,
      feedbacks: 20,
    },
  ];

  return (
    <div className="blogs-page">
      <div className="search-bar">
        <input type="text" placeholder="Search blogs..." />
        <button>Search</button>
      </div>
      <button className="post-blog-btn">Post a Blog</button>
      <div className="blogs-container">
        {blogs.map((blog) => (
          <div className="blog-card" key={blog.id}>
            <h3>{blog.title}</h3>
            <p className="blog-author">
              <strong>Author:</strong> {blog.author} | <strong>Date:</strong> {blog.date}
            </p>
            <p className="blog-content">{blog.content}</p>
            <div className="blog-interactions">
              <span>❤️ {blog.reactions} Reactions</span>
              <span>💬 {blog.feedbacks} Feedbacks</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
