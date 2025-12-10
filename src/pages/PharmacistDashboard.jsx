import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StockAlerts from '../components/StockAlerts';
import ModernAlert from '../components/ModernAlert';
import Loader from '../components/Loader';
import PageTransition from '../components/PageTransition';
import './Dashboard.css';

const PharmacistDashboard = () => {
  const { medicines, setMedicines, orders, setOrders, getStockAlerts, user, logout, fetchMedicines } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'Pain Relief',
    image: '',
  });
  const [alertConfig, setAlertConfig] = useState({ isOpen: false });
  const [loading, setLoading] = useState(true);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/purchases`);
      if (response.ok) {
        const data = await response.json();
        const formattedOrders = data.map(purchase => ({
          id: purchase._id,
          medicineName: purchase.medicineName,
          customerName: purchase.customerName,
          customerEmail: purchase.customerEmail,
          customerPhone: purchase.customerPhone,
          customerAddress: purchase.customerAddress,
          quantity: purchase.quantity,
          totalPrice: purchase.totalPrice,
          status: purchase.status,
          prescription: purchase.prescription
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch data on component mount
  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMedicines(), fetchOrders()]);
      setTimeout(() => setLoading(false), 1000);
    };
    loadData();
  }, []);

  const alerts = getStockAlerts();

  // Calculate stock statistics
  const stockStats = {
    totalMedicines: medicines.length,
    totalStockValue: medicines.reduce((sum, m) => sum + (m.price * m.stock), 0),
    totalUnits: medicines.reduce((sum, m) => sum + m.stock, 0),
    lowStockCount: medicines.filter(m => m.stock < 20 && m.stock > 0).length,
    outOfStockCount: medicines.filter(m => m.stock === 0).length,
    averageStock: medicines.length > 0 
      ? Math.round(medicines.reduce((sum, m) => sum + m.stock, 0) / medicines.length)
      : 0,
    stockByCategory: medicines.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + m.stock;
      return acc;
    }, {}),
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'price' || e.target.name === 'stock'
        ? e.target.value
        : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    
    try {
      if (editingMedicine) {
        await fetch(`${apiUrl}/api/medicines/${editingMedicine.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            category: formData.category,
            image: formData.image
          })
        });
      } else {
        await fetch(`${apiUrl}/api/medicines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            category: formData.category,
            image: formData.image || 'https://via.placeholder.com/300x200/228B22/FFFFFF?text=Medicine'
          })
        });
      }
      
      fetchMedicines();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      description: medicine.description,
      price: medicine.price.toString(),
      stock: medicine.stock.toString(),
      category: medicine.category,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        await fetch(`${apiUrl}/api/medicines/${id}`, {
          method: 'DELETE'
        });
        fetchMedicines();
      } catch (error) {
        console.error('Error deleting medicine:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMedicine(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: 'Pain Relief',
      image: '',
    });
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const statusMessages = {
      confirmed: { title: 'Confirm Order', message: 'Are you sure you want to confirm this order?' },
      delivered: { title: 'Mark as Delivered', message: 'Are you sure this order has been delivered?' },
      failed: { title: 'Mark as Failed', message: 'Are you sure you want to mark this order as failed?' }
    };
    
    setAlertConfig({
      isOpen: true,
      type: 'confirm',
      title: statusMessages[newStatus].title,
      message: statusMessages[newStatus].message,
      onConfirm: () => {
        const statusText = newStatus === 'confirmed' ? 'confirmed' : newStatus === 'delivered' ? 'delivered' : 'failed';
        
        // Update order status in backend
        const updateBackend = async () => {
          try {
            const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
            await fetch(`${apiUrl}/api/purchases/${orderId}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            });
            fetchOrders(); // Refresh orders from backend
          } catch (error) {
            console.error('Error updating order:', error);
          }
        };
        updateBackend();
        
        setAlertConfig({ isOpen: false });
        
        // Show success message
        setTimeout(() => {
          setAlertConfig({
            isOpen: true,
            type: 'success',
            title: 'Success!',
            message: `Order successfully ${statusText}! Customer has been notified.`,
            onClose: () => setAlertConfig({ isOpen: false })
          });
        }, 100);
      },
      onClose: () => setAlertConfig({ isOpen: false })
    });
  };

  if (loading) return <Loader />;

  return (
    <PageTransition>
    <div className="dashboard">
      <div className="dashboard-topbar">
        <div className="container">
          <div className="topbar-content">
            <h1>Pharmacist Dashboard</h1>
            <div className="user-logout-section">
              <span className="user-name-display">{user?.name}</span>
              <button onClick={handleLogout} className="btn-logout-dashboard">
                <span className="logout-icon"><i className="fa-solid fa-arrow-right-from-bracket"></i></span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="dashboard-header">
          <h2>Manage Medicines</h2>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            + Add Medicine
          </button>
        </div>

        {alerts.length > 0 && <StockAlerts />}

        {/* Stock Statistics Section */}
        <div className="stats-section">
          <h2>Stock Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💊</div>
              <div className="stat-content">
                <h3>{stockStats.totalMedicines}</h3>
                <p>Total Medicines</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stockStats.totalUnits}</h3>
                <p>Total Units in Stock</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>${stockStats.totalStockValue.toFixed(2)}</h3>
                <p>Total Stock Value</p>
              </div>
            </div>
            <div className="stat-card stat-warning">
              <div className="stat-icon">⚠️</div>
              <div className="stat-content">
                <h3>{stockStats.lowStockCount}</h3>
                <p>Low Stock Items</p>
              </div>
            </div>
            <div className="stat-card stat-danger">
              <div className="stat-icon">🚫</div>
              <div className="stat-content">
                <h3>{stockStats.outOfStockCount}</h3>
                <p>Out of Stock</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>{stockStats.averageStock}</h3>
                <p>Average Stock Level</p>
              </div>
            </div>
          </div>

          {/* Stock by Category */}
          <div className="category-stock">
            <h3>Stock by Category</h3>
            <div className="category-grid">
              {Object.entries(stockStats.stockByCategory).map(([category, stock]) => (
                <div key={category} className="category-item">
                  <span className="category-name">{category}</span>
                  <span className="category-stock-value">{stock} units</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicines.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No medicines found. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  medicines.map(medicine => (
                    <tr key={medicine.id}>
                      <td>
                        <div>
                          <strong>{medicine.name}</strong>
                          <div className="medicine-desc-small">{medicine.description}</div>
                        </div>
                      </td>
                      <td>{medicine.category}</td>
                      <td>${medicine.price.toFixed(2)}</td>
                      <td>
                        <span className={medicine.stock < 20 ? 'stock-low' : 'stock-ok'}>
                          {medicine.stock}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="btn btn-secondary btn-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(medicine.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Orders</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Medicine</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Prescription</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  orders.slice().reverse().slice(0, 10).map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.medicineName}</td>
                      <td>
                        <div>
                          <div>{order.customerName}</div>
                          <div className="order-detail-small">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td>{order.quantity}</td>
                      <td>${order.totalPrice}</td>
                      <td>
                        {order.prescription ? (
                          <a href={order.prescription} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                            View
                          </a>
                        ) : (
                          <span style={{color: '#999', fontSize: '12px'}}>No prescription</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge status-${order.status}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {order.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                className="btn btn-success btn-sm"
                                title="Confirm Order"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => updateOrderStatus(order.id, 'failed')}
                                className="btn btn-danger btn-sm"
                                title="Mark as Failed"
                              >
                                ✗
                              </button>
                            </>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="btn btn-primary btn-sm"
                              title="Mark as Delivered"
                            >
                              📦
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                <button className="close-btn" onClick={handleCloseModal}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Medicine Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter medicine name"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    placeholder="Enter medicine description"
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Enter image URL (optional)"
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Leave empty to use default placeholder image
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Supplements">Supplements</option>
                    <option value="Cardiac">Cardiac</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingMedicine ? 'Update' : 'Add'} Medicine
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        <ModernAlert
          isOpen={alertConfig.isOpen}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          onConfirm={alertConfig.onConfirm}
          onClose={alertConfig.onClose}
        />
      </div>
    </div>
    </PageTransition>
  );
};

export default PharmacistDashboard;

