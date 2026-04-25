import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about page-container">
      <h1 className="page-title">About Our Hostel Management System</h1>
      
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          We aim to revolutionize hostel management by providing a modern, efficient, 
          and user-friendly platform that simplifies the process of room allocation, 
          maintenance requests, and administrative tasks for both students and administrators.
        </p>
      </section>

      <section className="about-section">
        <h2>Key Features</h2>
        <div className="grid grid-2">
          <div className="feature-item">
            <h3>For Students</h3>
            <ul>
              <li>Easy room booking and selection</li>
              <li>Real-time room availability tracking</li>
              <li>Maintenance request submission</li>
              <li>Personal booking history</li>
              <li>Instant notifications and updates</li>
            </ul>
          </div>
          <div className="feature-item">
            <h3>For Administrators</h3>
            <ul>
              <li>Comprehensive tenant management</li>
              <li>Room allocation and tracking</li>
              <li>Maintenance request handling</li>
              <li>Detailed reports and analytics</li>
              <li>Revenue tracking and insights</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Registration</h3>
            <p>Students and administrators create their accounts with role-specific access.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Room Selection</h3>
            <p>Students can view available rooms and make their preferences known.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Administration</h3>
            <p>Administrators review and process room allocations and requests.</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Management</h3>
            <p>Ongoing management of rooms, maintenance, and tenant records.</p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Benefits</h2>
        <div className="benefits">
          <div className="benefit-item">
            <h3>Efficiency</h3>
            <p>Streamlined processes for room allocation and management</p>
          </div>
          <div className="benefit-item">
            <h3>Transparency</h3>
            <p>Clear visibility of room status and allocation process</p>
          </div>
          <div className="benefit-item">
            <h3>Communication</h3>
            <p>Improved communication between students and administrators</p>
          </div>
          <div className="benefit-item">
            <h3>Analytics</h3>
            <p>Data-driven insights for better decision making</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About; 