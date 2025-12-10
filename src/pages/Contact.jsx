import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import PageTransition from '../components/PageTransition';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  if (loading) return <Loader />;

  return (
    <PageTransition>
    <div className="contact-page">
      <div className="container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>We're here to help! Get in touch with us for any questions or concerns.</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-card">
              <div className="info-icon">📍</div>
              <h3>Address</h3>
              <p>123 Healthcare Street<br />Medical District, City 12345</p>
            </div>
            <div className="info-card">
              <div className="info-icon">📞</div>
              <h3>Phone</h3>
              <p>+1 (555) 123-4567<br />+1 (555) 123-4568</p>
            </div>
            <div className="info-card">
              <div className="info-icon">✉️</div>
              <h3>Email</h3>
              <p>info@intarepharmacy.com<br />support@intarepharmacy.com</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🕒</div>
              <h3>Hours</h3>
              <p>Monday - Friday: 8:00 AM - 8:00 PM<br />Saturday - Sunday: 9:00 AM - 6:00 PM</p>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>Send us a Message</h2>
            {submitted ? (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <p>Thank you! Your message has been sent successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Enter your message"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Contact;

