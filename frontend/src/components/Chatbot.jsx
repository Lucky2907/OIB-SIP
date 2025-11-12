import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Pizza, ShoppingCart, User, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm PizzaBot, your personal pizza ordering assistant! How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [orders, setOrders] = useState([]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Safe context usage with fallbacks
  const authContext = useContext(AuthContext);
  const cartContext = useContext(CartContext);
  const user = authContext?.user || null;
  const cart = cartContext?.cart || [];

  // Hide chatbot on auth pages
  const hideOnPages = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
  const shouldHide = hideOnPages.some(page => location.pathname.startsWith(page));

  // Fetch user orders
  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchOrders();
    }
  }, [user, isOpen]);

  if (shouldHide) {
    return null; // Don't render chatbot on auth pages
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predefined quick actions
  const quickActions = [
    { icon: Pizza, label: 'Order Pizza', action: 'order' },
    { icon: ShoppingCart, label: 'View Cart', action: 'cart' },
    { icon: User, label: 'My Orders', action: 'orders' },
    { icon: HelpCircle, label: 'Help', action: 'help' }
  ];

  // Knowledge base about the website
  const knowledgeBase = {
    greetings: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
    order: ['order', 'pizza', 'buy', 'purchase', 'get pizza', 'want pizza'],
    menu: ['menu', 'pizzas', 'what pizzas', 'options', 'choices', 'available'],
    customize: ['customize', 'custom', 'personalize', 'make my own', 'build'],
    cart: ['cart', 'basket', 'checkout', 'my items'],
    orders: ['my orders', 'order history', 'track', 'previous orders'],
    account: ['account', 'profile', 'login', 'register', 'sign up', 'sign in'],
    help: ['help', 'support', 'how to', 'guide', 'instructions'],
    price: ['price', 'cost', 'how much', 'expensive', 'cheap'],
    delivery: ['delivery', 'deliver', 'shipping', 'when'],
    payment: ['payment', 'pay', 'gpay', 'google pay'],
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();

    // Greetings
    if (knowledgeBase.greetings.some(word => message.includes(word))) {
      return "Hello! 👋 Welcome to our Pizza Hub! I can help you:\n\n• Browse our delicious pizzas 🍕\n• Customize your own pizza\n• Track your orders\n• Answer any questions\n\nWhat would you like to do?";
    }

    // Order/Menu
    if (knowledgeBase.order.some(word => message.includes(word)) || 
        knowledgeBase.menu.some(word => message.includes(word))) {
      setTimeout(() => navigate('/dashboard'), 1500);
      return "Great choice! 🍕 We have amazing pizzas like:\n\n• Margherita Pizza - ₹299\n• Pepperoni Pizza - ₹399\n• Veggie Supreme - ₹349\n• BBQ Chicken - ₹449\n\nTaking you to our menu now...";
    }

    // Customize
    if (knowledgeBase.customize.some(word => message.includes(word))) {
      setTimeout(() => navigate('/dashboard'), 1500);
      return "Awesome! 🎨 You can create your dream pizza by:\n\n1. Choose your base (Thin/Thick/Cheese Burst)\n2. Pick your sauce\n3. Select size (Regular/Medium/Large)\n4. Add toppings\n5. Extra cheese & veggies\n\nLet me take you to our pizzas page!";
    }

    // Cart
    if (knowledgeBase.cart.some(word => message.includes(word))) {
      if (cart && cart.length > 0) {
        const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
        const cartItems = cart.map((item, i) => 
          `${i + 1}. ${item.name} - ₹${item.totalPrice}`
        ).join('\n');
        
        return `🛒 Your Cart (${cart.length} items):\n\n${cartItems}\n\n💰 Total: ₹${cartTotal}\n\nClick the cart icon in the top-right to checkout!`;
      } else {
        return "🛒 Your cart is empty!\n\n• Browse our delicious pizzas\n• Customize your favorite\n• Add to cart\n\nStart ordering now! 🍕";
      }
    }

    // Orders
    if (knowledgeBase.orders.some(word => message.includes(word))) {
      if (!user) {
        setTimeout(() => navigate('/login'), 1500);
        return "� Please login to view your orders!\n\nRedirecting you to login page...";
      }
      
      if (orders && orders.length > 0) {
        const recentOrders = orders.slice(0, 3).map((order, i) => {
          const statusEmoji = order.status === 'delivered' ? '✅' : 
                             order.status === 'preparing' ? '👨‍🍳' : 
                             order.status === 'out-for-delivery' ? '🚚' : '⏳';
          return `${statusEmoji} Order #${order._id.slice(-6)}\n   Status: ${order.status}\n   Total: ₹${order.totalAmount}\n   Items: ${order.items?.length || 0}`;
        }).join('\n\n');
        
        setTimeout(() => navigate('/my-orders'), 1500);
        return `📦 Your Recent Orders:\n\n${recentOrders}\n\nTaking you to My Orders page for full details...`;
      } else {
        setTimeout(() => navigate('/dashboard'), 1500);
        return "📦 You haven't placed any orders yet!\n\n🍕 Ready to order your first pizza?\n\nLet me take you to our menu...";
      }
    }

    // Account
    if (knowledgeBase.account.some(word => message.includes(word))) {
      setTimeout(() => navigate('/login'), 1500);
      return "👤 To manage your account:\n\n• Login/Register for faster checkout\n• Save delivery addresses\n• Track order history\n• Get exclusive offers\n\nRedirecting you to login...";
    }

    // Pricing
    if (knowledgeBase.price.some(word => message.includes(word))) {
      return "💰 Our Pizza Pricing:\n\n• Margherita: ₹299\n• Pepperoni: ₹399\n• Veggie Supreme: ₹349\n• BBQ Chicken: ₹449\n• Custom Pizza: Starting at ₹299\n\nPrices vary based on size and toppings!";
    }

    // Delivery
    if (knowledgeBase.delivery.some(word => message.includes(word))) {
      return "🚚 Delivery Information:\n\n• Average delivery: 30-45 minutes\n• Free delivery on orders above ₹500\n• Real-time order tracking\n• Contact driver directly\n\nWe deliver hot & fresh!";
    }

    // Payment
    if (knowledgeBase.payment.some(word => message.includes(word))) {
      return "💳 Payment Methods:\n\n• Google Pay (GPay) ✅\n• 100% Secure checkout\n• Instant confirmation\n\nWe currently accept Google Pay for seamless transactions!";
    }

    // Help
    if (knowledgeBase.help.some(word => message.includes(word))) {
      return "📚 How to Order:\n\n1. Browse pizzas on Dashboard\n2. Click any pizza to customize\n3. Choose size, crust, toppings\n4. Add to cart\n5. Checkout with Google Pay\n6. Track your order!\n\nNeed specific help? Just ask!";
    }

    // Default response
    return "I can help you with:\n\n🍕 Browse & order pizzas\n🎨 Customize your pizza\n🛒 View cart & checkout\n📦 Track your orders\n💰 Check prices\n🚚 Delivery info\n\nWhat would you like to know?";
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      type: 'user',
      text: input,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot typing
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        text: getBotResponse(input),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  const handleQuickAction = (action) => {
    let message = '';
    switch (action) {
      case 'order':
        message = 'I want to order a pizza';
        break;
      case 'cart':
        message = 'Show my cart';
        break;
      case 'orders':
        message = 'My orders';
        break;
      case 'help':
        message = 'I need help';
        break;
      default:
        message = 'Help';
    }

    // Send message directly instead of setting input
    const userMessage = {
      type: 'user',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate bot typing
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        text: getBotResponse(message),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botResponse]);
    }, 500);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all duration-300"
          >
            <MessageCircle size={28} />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Pizza size={32} />
                  <span className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">PizzaBot</h3>
                  <p className="text-xs text-orange-100">Online • Always here to help!</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 shadow-md rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-orange-100' : 'text-gray-400'}`}>
                      {msg.time}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-white border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick Actions:</p>
              <div className="grid grid-cols-4 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      <Icon size={20} className="text-orange-500" />
                      <span className="text-xs text-gray-600">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
