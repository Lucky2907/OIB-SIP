import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
import '../styles/Admin.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    fetchOrders();

    // Setup socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('newOrder', (order) => {
      setOrders((prevOrders) => [order, ...prevOrders]);
      toast.info('New order received!');
    });

    return () => newSocket.close();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Order Received':
        return 'status-received';
      case 'In the Kitchen':
        return 'status-kitchen';
      case 'Sent to Delivery':
        return 'status-delivery';
      case 'Delivered':
        return 'status-delivered';
      default:
        return '';
    }
  };

  return (
    <div className="admin-container">
      <h1>Order Management</h1>

      <div className="orders-list">
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card-admin">
              <div className="order-header">
                <div>
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p className="order-customer">
                    Customer: {order.user?.name} ({order.user?.email})
                  </p>
                </div>
                <div>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="order-body">
                <div className="pizza-details">
                  <h4>Pizza Configuration:</h4>
                  <ul>
                    <li><strong>Base:</strong> {order.customPizza?.base?.name}</li>
                    <li><strong>Sauce:</strong> {order.customPizza?.sauce?.name}</li>
                    <li><strong>Cheese:</strong> {order.customPizza?.cheese?.name}</li>
                    {order.customPizza?.veggies?.length > 0 && (
                      <li>
                        <strong>Veggies:</strong>{' '}
                        {order.customPizza.veggies.map((v) => v.name).join(', ')}
                      </li>
                    )}
                    {order.customPizza?.meat?.length > 0 && (
                      <li>
                        <strong>Meat:</strong>{' '}
                        {order.customPizza.meat.map((m) => m.name).join(', ')}
                      </li>
                    )}
                  </ul>
                  <p className="order-total"><strong>Total: ₹{order.totalPrice}</strong></p>
                </div>

                <div className="status-management">
                  <label>Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className={`status-select ${getStatusClass(order.status)}`}
                  >
                    <option value="Order Received">Order Received</option>
                    <option value="In the Kitchen">In the Kitchen</option>
                    <option value="Sent to Delivery">Sent to Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
