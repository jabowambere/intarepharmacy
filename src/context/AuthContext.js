import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState(() => {
    const saved = localStorage.getItem('medicines');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Paracetamol 500mg', description: 'Pain reliever and fever reducer', price: 5.99, stock: 50, category: 'Pain Relief', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop' },
      { id: 2, name: 'Ibuprofen 200mg', description: 'Anti-inflammatory medication', price: 7.99, stock: 30, category: 'Pain Relief', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop' },
      { id: 3, name: 'Amoxicillin 250mg', description: 'Antibiotic for bacterial infections', price: 12.99, stock: 20, category: 'Antibiotic', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&h=300&fit=crop' },
      { id: 4, name: 'Vitamin D3 1000IU', description: 'Essential vitamin supplement', price: 9.99, stock: 100, category: 'Supplements', image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop' },
    ];
  });
  const [pharmacists, setPharmacists] = useState(() => {
    const saved = localStorage.getItem('pharmacists');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah@pharmacy.com', phone: '555-0101', license: 'PH-12345' },
      { id: 2, name: 'Dr. Michael Chen', email: 'michael@pharmacy.com', phone: '555-0102', license: 'PH-12346' },
    ];
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Initialize admin user
  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
      setUser(JSON.parse(adminUser));
    }
  }, []);

  // Save medicines to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('medicines', JSON.stringify(medicines));
  }, [medicines]);

  // Save pharmacists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pharmacists', JSON.stringify(pharmacists));
  }, [pharmacists]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const login = async (email, password, role) => {
    const normalizedEmail = email?.trim().toLowerCase();
    const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Backend not available, using fallback login:', err);
      // Fallback to local authentication
      let userData = null;
      
      if (role === 'admin' && normalizedEmail === 'admin@pharmacy.com' && password === 'admin123') {
        userData = { id: 'admin', email: normalizedEmail, role: 'admin', name: 'Admin User' };
      } else if (role === 'pharmacist' && password === 'pharmacist123') {
        const pharmacist = pharmacists.find(p => p.email.toLowerCase() === normalizedEmail);
        if (pharmacist) {
          userData = { id: pharmacist.id, email: normalizedEmail, role: 'pharmacist', name: pharmacist.name };
        }
      }
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
  };

  const fetchMedicines = async () => {
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/medicines`);
      const data = await res.json();
      const formattedMedicines = data.map(med => ({
        id: med._id,
        name: med.name,
        description: med.description,
        price: med.price,
        stock: med.quantity,
        category: med.category,
        image: med.image
      }));
      setMedicines(formattedMedicines);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const getStockAlerts = () => {
    return medicines.filter(medicine => medicine.stock < 20);
  };

  const value = {
    user,
    login,
    logout,
    medicines,
    setMedicines,
    fetchMedicines,
    pharmacists,
    setPharmacists,
    orders,
    setOrders,
    getStockAlerts,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

