import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicineCard from '../components/MedicineCard';
import StockAlerts from '../components/StockAlerts';
import Loader from '../components/Loader';
import PageTransition from '../components/PageTransition';
import avatarImg from './avatar.png';
import './Home.css';

const Home = () => {
  const { medicines, getStockAlerts, fetchMedicines } = useAuth();
  const alerts = getStockAlerts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMedicines();
      setTimeout(() => setLoading(false), 1000);
    };
    loadData();
  }, []);

  if (loading) return <Loader />;

  return (
    <PageTransition>
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-avatar-container">
              <img src={avatarImg} alt="Healthcare Professional" className="hero-avatar-img" />
            </div>
            <div className="hero-text">
              <h1 className="hero-title">What if healthcare felt simpler?</h1>
              <p className="hero-subtitle">
                Intare Pharmacy-your trusted partner in healthcare. We provide quality medicines and 
                professional pharmaceutical services to ensure your well-being.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-content">
            <h2>About Our Pharmacy</h2>
            <div className="about-grid">
              <div className="about-card">
                <div className="about-icon">🏥</div>
                <h3>Professional Service</h3>
                <p>Our licensed pharmacists provide expert consultation and medication management services.</p>
              </div>
              <div className="about-card">
                <div className="about-icon">💊</div>
                <h3>Quality Medicines</h3>
                <p>We stock only FDA-approved medications from trusted manufacturers.</p>
              </div>
              <div className="about-card">
                <div className="about-icon">🚚</div>
                <h3>Fast Delivery</h3>
                <p>We offer convenient home delivery service for all your medication needs.</p>
              </div>
              <div className="about-card">
                <div className="about-icon">💰</div>
                <h3>Affordable Prices</h3>
                <p>Competitive pricing with special discounts for regular customers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="medicines-section">
        <div className="container">
          <h2 className="section-title">Our Medicines</h2>
          {alerts.length > 0 && <StockAlerts />}
          <div className="medicines-grid">
            {medicines.map(medicine => (
              <MedicineCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        </div>
      </section>
    </div>
    </PageTransition>
  );
};

export default Home;

