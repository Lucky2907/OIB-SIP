import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import './styles/App.css';

import Navbar from './components/Navbar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Cart from './components/Cart.jsx';
import Chatbot from './components/Chatbot.jsx';
import SpinWheel from './components/SpinWheel.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CustomizePizza from './pages/CustomizePizza.jsx';
import MyOrders from './pages/MyOrders.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminInventory from './pages/AdminInventory.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import DiagnosticTest from './pages/DiagnosticTest.jsx';

// Smart redirect based on auth status
const HomeRedirect = () => {
  const { user, loading } = React.useContext(AuthContext);
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

function App() {
  const [showSpinWheel, setShowSpinWheel] = React.useState(false);
  const [discount, setDiscount] = React.useState(null);

  const handleWinDiscount = (discountData) => {
    setDiscount(discountData);
    localStorage.setItem('spinWheelDiscount', JSON.stringify(discountData));
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App bg-white dark:bg-gray-900 min-h-screen transition-colors">
              <Navbar />
              <Cart />
              <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <div className="pt-20">
              <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/diagnostic" element={<DiagnosticTest />} />
              
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/customize-pizza"
                element={
                  <PrivateRoute>
                    <CustomizePizza />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-orders"
                element={
                  <PrivateRoute>
                    <MyOrders />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/inventory"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminInventory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <PrivateRoute adminOnly={true}>
                    <AdminOrders />
                  </PrivateRoute>
                }
              />
            </Routes>
            </div>
            <Chatbot />
            <SpinWheel 
              isOpen={showSpinWheel} 
              onClose={() => setShowSpinWheel(false)}
              onWinDiscount={handleWinDiscount}
            />
            
            {/* Floating Spin Wheel Button */}
            <AuthContext.Consumer>
              {({ user }) => user && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSpinWheel(true)}
                  className="fixed bottom-24 right-6 z-40 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
                  title="Spin & Win!"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <Gift size={28} />
                  </motion.div>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full"
                  >
                    WIN
                  </motion.span>
                </motion.button>
              )}
            </AuthContext.Consumer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
