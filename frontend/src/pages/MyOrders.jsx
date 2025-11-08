import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, ChefHat, Calendar, DollarSign, MapPin } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../utils/api';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchOrders();

    // Setup socket connection for real-time updates
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      newSocket.emit('join', payload.id);
    }

    newSocket.on('orderStatusUpdate', (data) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === data.orderId ? { ...order, status: data.status } : order
        )
      );
      toast.success(`Order #${data.orderId.slice(-6)} status updated: ${data.status}`);
    });

    return () => newSocket.close();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'Order Received': { icon: Package, color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50' },
      'In the Kitchen': { icon: ChefHat, color: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
      'Sent to Delivery': { icon: Truck, color: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50' },
      'Delivered': { icon: CheckCircle, color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50' },
    };
    return statusMap[status] || statusMap['Order Received'];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status !== 'Delivered';
    if (filter === 'completed') return order.status === 'Delivered';
    return true;
  });

  const pizzaImages = {
    'Margherita': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    'Pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    'BBQ Chicken': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'Veggie Delight': 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    'default': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">
            Track your pizza orders and view order history
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-3 mb-6"
        >
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === tab.value
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Orders List */}
        {!loading && (
          <AnimatePresence mode="wait">
            {filteredOrders.length > 0 ? (
              <motion.div
                key="orders-list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredOrders.map((order, idx) => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                    >
                      {/* Order Header */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                Order #{order._id.slice(-8).toUpperCase()}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text}`}>
                                <StatusIcon className="inline w-4 h-4 mr-1" />
                                {order.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(order.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                ₹{order.totalPrice?.toFixed(2) || '0.00'}
                              </span>
                            </div>
                          </div>

                          {/* Status Timeline Progress */}
                          <div className="hidden md:flex items-center gap-2">
                            {['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'].map((s, i) => {
                              const currentIndex = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'].indexOf(order.status);
                              const isCompleted = i <= currentIndex;
                              
                              return (
                                <div key={s} className="flex items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    isCompleted ? statusInfo.color : 'bg-gray-300'
                                  } text-white transition-all`}>
                                    {isCompleted ? '✓' : i + 1}
                                  </div>
                                  {i < 3 && (
                                    <div className={`w-8 h-1 ${isCompleted ? statusInfo.color : 'bg-gray-300'}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="p-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Order Items:</h4>
                        <div className="space-y-3">
                          {/* Pizza Details */}
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-red-100 flex-shrink-0">
                              <img
                                src={pizzaImages['default']}
                                alt="Pizza"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">Custom Pizza</h5>
                              <div className="text-sm text-gray-600 mt-1">
                                {order.pizzaDetails?.base && <p>Base: {order.pizzaDetails.base}</p>}
                                {order.pizzaDetails?.sauce && <p>Sauce: {order.pizzaDetails.sauce}</p>}
                                {order.pizzaDetails?.cheese && <p>Cheese: {order.pizzaDetails.cheese}</p>}
                                {order.pizzaDetails?.veggies?.length > 0 && (
                                  <p>Veggies: {order.pizzaDetails.veggies.join(', ')}</p>
                                )}
                                {order.pizzaDetails?.meat?.length > 0 && (
                                  <p>Meat: {order.pizzaDetails.meat.join(', ')}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delivery Info */}
                        {order.deliveryAddress && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <p>{order.deliveryAddress}</p>
                            </div>
                          </div>
                        )}

                        {/* Payment Info */}
                        {order.googlePayTransactionId && (
                          <div className="mt-2 text-xs text-gray-500">
                            Transaction ID: {order.googlePayTransactionId}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="no-orders"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-lg p-12 text-center"
              >
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'pending' && "You don't have any pending orders"}
                  {filter === 'completed' && "You don't have any completed orders"}
                  {filter === 'all' && "You haven't placed any orders yet"}
                </p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Order Your First Pizza
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
