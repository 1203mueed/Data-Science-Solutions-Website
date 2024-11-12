// src/pages/Home.js
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Slideshow from '../components/Slideshow';

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      
      <video autoPlay muted loop className="background-video">
        <source src="/img/backgroundvideo6.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Slideshow */}
      <Slideshow />

      {/* Features Section */}
      <section id="datasets" className="feature">
        <div className="feature-content">
          <img src="/img/dataset3.png" alt="Datasets" />
          <div className="info-box">
            <h2>Datasets</h2>
            <p>Explore a wide range of datasets to fuel your machine learning and data science projects.</p>
            <a href="#datasets" className="view-all">View All</a>
          </div>
        </div>
      </section>

      <section id="papers" className="feature">
        <div className="feature-content reverse">
          <img src="/img/papers3.png" alt="Papers" />
          <div className="info-box">
            <h2>Papers</h2>
            <p>Discover cutting-edge research papers in the field of AI and data science.</p>
            <a href="#papers" className="view-all">View All</a>
          </div>
        </div>
      </section>
      <section id="notebooks" class="feature">
          <div class="feature-content">
              <img src="/img/notebooks2.png" alt="Notebooks" />
              <div class="info-box">
                  <h2>Notebooks</h2>
                  <p>Access interactive notebooks to practice coding and experiment with data.</p>
                  <a href="#notebooks" class="view-all">View All</a>
              </div>
          </div>
      </section>
      <section id="models" class="feature">
          <div class="feature-content reverse">
              <img src="/img/models2.png" alt="Models" />
              <div class="info-box">
                  <h2>Models</h2>
                  <p>Find pre-trained models ready to deploy for various applications.</p>
                  <a href="#models" class="view-all">View All</a>
              </div>
          </div>
      </section>

      <section id="competitions" class="feature">
        <div class="feature-content">
            <img src="/img/competition2.png" alt="Competitions" />
            <div class="info-box">
                <h2>Competitions</h2>
                <p>Join competitions and test your skills against other data enthusiasts.</p>
                <a href="#competitions" class="view-all">View All</a>
            </div>
        </div>
    </section>

    <section id="work-with-team" class="feature">
        <div class="feature-content reverse">
            <img src="/img/teamwork2.gif" alt="Work With a Team" />
            <div class="info-box">
                <h2>Work With a Team</h2>
                <p>Collaborate with teams to tackle projects and gain valuable experience.</p>
                <a href="#work-with-team" class="view-all">View All</a>
            </div>
        </div>
    </section>

    <section id="learn" class="feature">
        <div class="feature-content">
            <img src="/img/learn2.png" alt="Learn" />
            <div class="info-box">
                <h2>Learn</h2>
                <p>Access tutorials, courses, and guides to enhance your knowledge.</p>
                <a href="#learn" class="view-all">View All</a>
            </div>
        </div>
    </section>

    <section id="blogs" class="feature">
        <div class="feature-content reverse">
            <img src="/img/blogs3.png" alt="Blogs" />
            <div class="info-box">
                <h2>Blogs</h2>
                <p>Read blogs from experts and enthusiasts to stay updated on trends.</p>
                <a href="#blogs" class="view-all">View All</a>
            </div>
        </div>
    </section>

    <section id="pricing" class="feature">
        <div class="feature-content">
            <img src="/img/pricing2.png" alt="Pricing" />
            <div class="info-box">
                <h2>Pricing</h2>
                <p>Check our pricing plans to choose the best one for your needs.</p>
                <a href="#pricing" class="view-all">View All</a>
            </div>
        </div>
    </section>
    <Footer />
    </div>
  );
};

export default Home;
