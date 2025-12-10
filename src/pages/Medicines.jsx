import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MedicineCard from '../components/MedicineCard';
import StockAlerts from '../components/StockAlerts';
import Loader from '../components/Loader';
import PageTransition from '../components/PageTransition';
import './Medicines.css';

const Medicines = () => {
  const { medicines, getStockAlerts, fetchMedicines } = useAuth();
  const alerts = getStockAlerts();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMedicines();
      setTimeout(() => setLoading(false), 1200);
    };
    loadData();
  }, []);

  if (loading) return <Loader />;

  return (
    <PageTransition>
    <div className="medicines-page">
      <div className="container">
        <div className="page-header">
          <h1>Our Medicines</h1>
          <p>Browse our complete selection of quality medications</p>
        </div>

        {alerts.length > 0 && <StockAlerts />}

        <div className="medicines-grid">
          {medicines.map(medicine => (
            <MedicineCard key={medicine.id} medicine={medicine} />
          ))}
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Medicines;

