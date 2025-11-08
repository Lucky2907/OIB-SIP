import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Pizza, ChefHat, Clock, Award, TrendingUp, Sparkles } from 'lucide-react';
import PizzaCard from '../components/PizzaCard';
import api from '../utils/api';
import toast from 'react-hot-toast';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPizzas: 0,
    featured: 0,
    newArrivals: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory');
      const allItems = response.data.data || [];
      // Filter to show only pizzas (not ingredients like base, sauce, cheese, etc.)
      const pizzas = allItems.filter(item => item.category === 'pizza');
      setInventory(pizzas);
      
      setStats({
        totalPizzas: pizzas.length,
        featured: pizzas.filter(p => p.stock > 10).length,
        newArrivals: Math.floor(pizzas.length / 3),
      });
    } catch (error) {
      toast.error('Failed to load pizzas');
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomizePizza = (pizza) => {
    navigate('/customize-pizza', { state: { pizza } });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section with Carousel */}
      <section className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block text-7xl mb-4"
            >
              🍕
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
              Craft Your Perfect Pizza
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              From classic favorites to bold new creations - your perfect slice awaits!
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/customize-pizza')}
                className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                Start Customizing
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all"
              >
                Browse Menu
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: Pizza, label: 'Total Pizzas', value: stats.totalPizzas, color: 'from-orange-500 to-red-500' },
            { icon: Sparkles, label: 'Featured', value: stats.featured, color: 'from-purple-500 to-pink-500' },
            { icon: TrendingUp, label: 'New Arrivals', value: stats.newArrivals, color: 'from-blue-500 to-cyan-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4"
            >
              <div className={`p-4 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { icon: ChefHat, title: 'Expert Chefs', desc: 'Crafted by professionals' },
            { icon: Clock, title: 'Fast Delivery', desc: '30 minutes or free' },
            { icon: Award, title: 'Quality First', desc: 'Premium ingredients' },
            { icon: Pizza, title: 'Custom Made', desc: 'Exactly how you like' },
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="inline-flex p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-full mb-4">
                <feature.icon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Pizza Menu */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
            Our Delicious Menu
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our carefully curated selection of pizzas, or create your own masterpiece!
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {inventory.map((pizza) => (
              <motion.div key={pizza._id} variants={itemVariants}>
                <PizzaCard 
                  pizza={{
                    ...pizza,
                    stock: pizza.quantity || 0,
                  }} 
                  onCustomize={handleCustomizePizza} 
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && inventory.length === 0 && (
          <div className="text-center py-20">
            <Pizza className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No pizzas available right now</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-display font-bold mb-4">
              Ready to Create Your Dream Pizza?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Customize every detail - from the base to the toppings!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/customize-pizza')}
              className="bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              Start Building Now
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
