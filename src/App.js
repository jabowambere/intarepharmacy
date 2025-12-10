import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import PharmacistDashboard from './pages/PharmacistDashboard.jsx';
import Medicines from './pages/Medicines.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const ConditionalNavbar = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin' || location.pathname === '/pharmacist';
  
  if (isDashboard) {
    return null;
  }
  
  return <Navbar />;
};

const ConditionalFooter = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/admin' || location.pathname === '/pharmacist';
  
  if (isDashboard) {
    return null;
  }
  
  return <Footer />;
};

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/medicines" element={<Medicines />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/pharmacist"
        element={
          <PrivateRoute allowedRoles={['pharmacist', 'admin']}>
            <PharmacistDashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ConditionalNavbar />
          <AppRoutes />
          <ConditionalFooter />
          <ScrollToTop />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

