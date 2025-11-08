import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Pizza, 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  User, 
  LogOut, 
  Menu, 
  X,
  ChefHat
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount, toggleCart } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group"
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
                <Pizza className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                PizzaHub
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Fresh & Delicious</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <>
                <NavLink 
                  to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                  icon={LayoutDashboard}
                  isActive={isActive(user.role === 'admin' ? '/admin/dashboard' : '/dashboard')}
                >
                  Dashboard
                </NavLink>

                {user.role === 'user' && (
                  <>
                    <NavLink 
                      to="/my-orders" 
                      icon={ShoppingBag}
                      isActive={isActive('/my-orders')}
                    >
                      My Orders
                    </NavLink>
                    
                    {/* Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleCart}
                      className="relative p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all group"
                    >
                      <ShoppingCart className="w-5 h-5 text-orange-600" />
                      {getCartCount() > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                        >
                          {getCartCount()}
                        </motion.span>
                      )}
                    </motion.button>
                  </>
                )}

                {user.role === 'admin' && (
                  <>
                    <NavLink 
                      to="/admin/inventory" 
                      icon={Package}
                      isActive={isActive('/admin/inventory')}
                    >
                      Inventory
                    </NavLink>
                    <NavLink 
                      to="/admin/orders" 
                      icon={ChefHat}
                      isActive={isActive('/admin/orders')}
                    >
                      Orders
                    </NavLink>
                  </>
                )}

                {/* User Profile */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="hidden xl:block">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 text-gray-700 font-semibold hover:text-orange-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-3">
              {user ? (
                <>
                  <MobileNavLink 
                    to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                    icon={LayoutDashboard}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </MobileNavLink>

                  {user.role === 'user' && (
                    <>
                      <MobileNavLink 
                        to="/my-orders" 
                        icon={ShoppingBag}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </MobileNavLink>
                      <button
                        onClick={() => {
                          toggleCart();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 text-gray-700 font-semibold"
                      >
                        <ShoppingCart className="w-5 h-5 text-orange-600" />
                        <span>Cart ({getCartCount()})</span>
                      </button>
                    </>
                  )}

                  {user.role === 'admin' && (
                    <>
                      <MobileNavLink 
                        to="/admin/inventory" 
                        icon={Package}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Inventory
                      </MobileNavLink>
                      <MobileNavLink 
                        to="/admin/orders" 
                        icon={ChefHat}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Orders
                      </MobileNavLink>
                    </>
                  )}

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center text-gray-700 font-semibold border-2 border-gray-300 rounded-xl hover:border-orange-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Desktop Nav Link Component
const NavLink = ({ to, icon: Icon, children, isActive }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
        isActive
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
          : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </motion.div>
  </Link>
);

// Mobile Nav Link Component
const MobileNavLink = ({ to, icon: Icon, children, onClick }) => (
  <Link to={to} onClick={onClick}>
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 text-gray-700 hover:text-orange-600 font-semibold transition-all">
      <Icon className="w-5 h-5" />
      <span>{children}</span>
    </div>
  </Link>
);

export default Navbar;
