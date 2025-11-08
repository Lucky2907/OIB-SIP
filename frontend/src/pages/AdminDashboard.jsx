import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    lowStockItems: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, lowStockRes] = await Promise.all([
        api.get('/orders'),
        api.get('/inventory/low-stock'),
      ]);

      const orders = ordersRes.data.data;
      const today = new Date().toDateString();
      const todayOrders = orders.filter(
        (order) => new Date(order.createdAt).toDateString() === today
      );

      setStats({
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        lowStockItems: lowStockRes.data.data.length,
      });

      setLowStockItems(lowStockRes.data.data);
      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Orders</h3>
          <p className="stat-value">{stats.todayOrders}</p>
        </div>
        <div className="stat-card alert">
          <h3>Low Stock Items</h3>
          <p className="stat-value">{stats.lowStockItems}</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="low-stock-section">
          <h2>⚠️ Low Stock Alert</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td className="low-stock">{item.quantity}</td>
                    <td>{item.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="recent-orders-section">
        <h2>Recent Orders</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase().replace(/\s/g, '-')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
