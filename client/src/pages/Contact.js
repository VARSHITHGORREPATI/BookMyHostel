import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState({
    type: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Sending message...' });

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus({
        type: 'success',
        message: 'Thank you for your message! We will get back to you soon.'
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    }
  };

  return (
    <div className="contact page-container">
      <h1 className="page-title">Contact Us</h1>
      
      <div className="contact-grid">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>
            Have questions about our hostel management system? We're here to help!
            Fill out the form or use our contact information below.
          </p>
          
          <div className="info-item">
            <div className="info-icon">📍</div>
            <div>
              <h3>Address</h3>
              <p>SRM UNIVERSITY AP<br />GUNTUR, ANDHRA PRADESH 521000</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">📧</div>
            <div>
              <h3>Email</h3>
              <p>srmapinfo@gmail.com</p>
            </div>
          </div>
          
          <div className="info-item">
            <div className="info-icon">⏰</div>
            <div>
              <h3>Working Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday and Sunday Holiday</p>
            </div>
          </div>
        </div>
        
        <div className="contact-form">
          <h2>Send us a Message</h2>
          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={status.type === 'loading'}
            >
              {status.type === 'loading' ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact; 