import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import PageTransition from '../components/PageTransition';
import './About.css';

const About = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1200);
  }, []);

  if (loading) return <Loader />;

  return (
    <PageTransition>
    <div className="about-page">
      <div className="container">
        <div className="about-hero">
          <h1>About Intare Pharmacy</h1>
          <p className="about-intro">
            Your trusted healthcare partner, committed to providing quality medicines 
            and exceptional pharmaceutical services.
          </p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>Our Mission</h2>
            <p>
              At Intare Pharmacy, we are dedicated to improving the health and well-being 
              of our community by providing accessible, high-quality pharmaceutical care. 
              We combine professional expertise with personalized service to ensure every 
              customer receives the best possible care.
            </p>
          </section>

          <section className="about-section">
            <h2>Why Choose Us</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🏥</div>
                <h3>Licensed Professionals</h3>
                <p>Our team consists of certified pharmacists with years of experience in pharmaceutical care.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💊</div>
                <h3>Quality Assurance</h3>
                <p>All medications are sourced from verified suppliers and meet the highest quality standards.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚚</div>
                <h3>Fast Delivery</h3>
                <p>We offer reliable and timely delivery services to your doorstep for your convenience.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Affordable Prices</h3>
                <p>Competitive pricing with special discounts and loyalty programs for our customers.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📞</div>
                <h3>24/7 Support</h3>
                <p>Our customer service team is always ready to assist you with any questions or concerns.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure & Safe</h3>
                <p>Your privacy and security are our top priorities. All transactions are secure and confidential.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our History</h2>
            <p>
              Founded with a vision to make quality healthcare accessible to everyone, 
              Intare Pharmacy has been serving the community for years. We have built 
              a reputation for excellence, trust, and commitment to customer satisfaction.
            </p>
          </section>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default About;

