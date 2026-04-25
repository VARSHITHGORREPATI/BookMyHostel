import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Hostel Management System</h1>
          <p>Efficiently manage your hostel accommodation with our modern platform</p>
          <div className="hero-buttons">
            <Link to="/login" className="btn btn-primary">Get Started</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="page-container">
          <h2>Key Features</h2>
          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Room Management</h3>
              <p>Easy room allocation and management for both students and administrators</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Online Booking</h3>
              <p>Simple and efficient room booking process with real-time availability</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔧</div>
              <h3>Maintenance Requests</h3>
              <p>Quick and easy way to submit and track maintenance requests</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analytics</h3>
              <p>Comprehensive reports and insights for better decision making</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Notifications</h3>
              <p>Stay updated with real-time notifications and alerts</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>User Management</h3>
              <p>Efficient management of student and admin accounts</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="page-container">
          <h2>Ready to Get Started?</h2>
          <p>Join our platform today and experience seamless hostel management</p>
          <Link to="/login" className="btn btn-primary">Sign Up Now</Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 