import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, ChevronLeft, ShoppingCart, Plus, Minus, Check, 
  Pizza, Flame, CircleDot, Leaf, Cookie, Clock, DollarSign, Star 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CustomizePizza = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  
  // Size and crust options with prices
  const sizes = [
    { value: 'Small', price: 0, icon: '🍕' },
    { value: 'Medium', price: 50, icon: '🍕🍕' },
    { value: 'Large', price: 100, icon: '🍕🍕🍕' },
  ];

  const crusts = [
    { value: 'Regular', price: 0, desc: 'Classic thin crust' },
    { value: 'Thick', price: 30, desc: 'Fluffy thick crust' },
    { value: 'Stuffed', price: 60, desc: 'Cheese stuffed crust' },
  ];
  
  const [step, setStep] = useState(1);
  const [inventory, setInventory] = useState({
    bases: [],
    sauces: [],
    cheese: [],
    veggies: [],
    meat: [],
  });
  
  const [selectedPizza, setSelectedPizza] = useState({
    name: location.state?.pizza?.name || 'Custom Pizza',
    baseId: location.state?.pizza?._id || null,
    base: null,
    sauce: null,
    cheese: null,
    veggies: [],
    meat: [],
    size: 'Small', // Start with Small (₹0)
    crust: 'Regular', // Start with Regular (₹0)
  });
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Redirect to dashboard if no pizza was selected
    if (!location.state?.pizza) {
      toast.error('Please select a pizza from the menu first');
      navigate('/dashboard');
      return;
    }
    fetchInventory();
  }, []);

  useEffect(() => {
    // Calculate price as soon as base is selected (base is mandatory)
    if (selectedPizza.base) {
      calculatePrice();
    }
  }, [selectedPizza, quantity]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [bases, sauces, cheese, veggies, meat] = await Promise.all([
        api.get('/inventory/category/base'),
        api.get('/inventory/category/sauce'),
        api.get('/inventory/category/cheese'),
        api.get('/inventory/category/veggies'),
        api.get('/inventory/category/meat'),
      ]);

      setInventory({
        bases: bases.data.data || [],
        sauces: sauces.data.data || [],
        cheese: cheese.data.data || [],
        veggies: veggies.data.data || [],
        meat: meat.data.data || [],
      });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load options');
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = async () => {
    try {
      const response = await api.post('/orders/calculate-price', {
        base: selectedPizza.base,
        sauce: selectedPizza.sauce,
        cheese: selectedPizza.cheese,
        veggies: selectedPizza.veggies,
        meat: selectedPizza.meat,
      });
      setTotalPrice(response.data.totalPrice || 0);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  // Get final price including size and crust extras
  const getFinalPrice = () => {
    let finalPrice = totalPrice;
    
    // Add size price
    const sizePrice = sizes.find(s => s.value === selectedPizza.size)?.price || 0;
    finalPrice += sizePrice;
    
    // Add crust price
    const crustPrice = crusts.find(c => c.value === selectedPizza.crust)?.price || 0;
    finalPrice += crustPrice;
    
    return finalPrice;
  };

  const handleSelect = (category, itemId) => {
    if (category === 'veggies' || category === 'meat') {
      const current = selectedPizza[category];
      if (current.includes(itemId)) {
        setSelectedPizza({
          ...selectedPizza,
          [category]: current.filter((id) => id !== itemId),
        });
      } else {
        setSelectedPizza({
          ...selectedPizza,
          [category]: [...current, itemId],
        });
      }
    } else {
      setSelectedPizza({ ...selectedPizza, [category]: itemId });
    }
  };

  const handleNext = () => {
    // Only base and sauce are mandatory
    if (step === 1 && !selectedPizza.base) {
      toast.error('Please select a base');
      return;
    }
    if (step === 2 && !selectedPizza.sauce) {
      toast.error('Please select a sauce');
      return;
    }
    // Cheese, veggies, and meat are optional - no validation needed
    setStep(step + 1);
  };

  const handleSkip = () => {
    // Allow skipping optional steps (cheese, veggies, meat)
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleAddToCart = () => {
    // Only base and sauce are required
    if (!selectedPizza.base || !selectedPizza.sauce) {
      toast.error('Please select at least base and sauce');
      return;
    }

    const cartItem = {
      _id: selectedPizza.baseId || Date.now().toString(),
      name: 'Custom Pizza',
      price: totalPrice,
      quantity: quantity,
      size: selectedPizza.size,
      crust: selectedPizza.crust,
      customizations: {
        // Store IDs for order creation
        baseId: selectedPizza.base,
        sauceId: selectedPizza.sauce,
        cheeseId: selectedPizza.cheese || null,
        veggiesIds: selectedPizza.veggies || [],
        meatIds: selectedPizza.meat || [],
        // Store names for display
        base: inventory.bases?.find(b => b._id === selectedPizza.base)?.name,
        sauce: inventory.sauces?.find(s => s._id === selectedPizza.sauce)?.name,
        cheese: selectedPizza.cheese ? inventory.cheese?.find(c => c._id === selectedPizza.cheese)?.name : null,
        veggies: selectedPizza.veggies?.map(id => ({
          name: inventory.veggies?.find(v => v._id === id)?.name,
          price: inventory.veggies?.find(v => v._id === id)?.price || 0,
        })) || [],
        meat: selectedPizza.meat?.map(id => ({
          name: inventory.meat?.find(m => m._id === id)?.name,
          price: inventory.meat?.find(m => m._id === id)?.price || 0,
        })) || [],
      },
    };

    addToCart(cartItem);
    toast.success('Added to cart! 🍕');
  };

  const handlePayment = async () => {
    // Only base and sauce are required
    if (!selectedPizza.base || !selectedPizza.sauce) {
      toast.error('Please select at least base and sauce');
      return;
    }

    // Check if inventory is loaded
    if (!inventory || !inventory.bases || !inventory.sauces) {
      toast.error('Loading menu items... Please try again in a moment');
      return;
    }

    if (!window.google?.payments?.api) {
      toast.error('Google Pay not available. Please enable it in your browser.');
      return;
    }

    try {
      const paymentsClient = new window.google.payments.api.PaymentsClient({ environment: 'TEST' });

      const paymentDataRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [{
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA'],
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleMerchantId',
            },
          },
        }],
        merchantInfo: {
          merchantId: '12345678901234567890',
          merchantName: 'Pizza App',
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPriceLabel: 'Total',
          totalPrice: (getFinalPrice() * quantity).toFixed(2),
          currencyCode: 'INR',
          countryCode: 'IN',
        },
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      const paymentToken = paymentData.paymentMethodData.tokenizationData.token;

      const googlePayOrder = await api.post('/orders/create-googlepay-order', {
        amount: getFinalPrice() * quantity,
        currency: 'INR',
        paymentToken: paymentToken,
      });

      console.log('Google Pay order response:', googlePayOrder.data);

      // Ensure we have a valid transaction ID
      const transactionId = googlePayOrder.data?.transactionId || googlePayOrder.data?.data?.transactionId;
      
      if (!transactionId) {
        throw new Error('Payment transaction ID not received from server');
      }

      // Build order data with safe navigation
      const baseItem = inventory.bases.find(b => b._id === selectedPizza.base);
      const sauceItem = inventory.sauces.find(s => s._id === selectedPizza.sauce);
      const cheeseItem = selectedPizza.cheese ? inventory.cheese?.find(c => c._id === selectedPizza.cheese) : null;
      
      console.log('Building order data:', {
        inventory,
        selectedPizza,
        baseItem,
        sauceItem,
        cheeseItem
      });
      
      const veggieNames = selectedPizza.veggies && inventory.veggies 
        ? selectedPizza.veggies.map(id => {
            const item = inventory.veggies.find(v => v._id === id);
            return item?.name;
          }).filter(Boolean)
        : [];
      
      const meatNames = selectedPizza.meat && inventory.meat
        ? selectedPizza.meat.map(id => {
            const item = inventory.meat.find(m => m._id === id);
            return item?.name;
          }).filter(Boolean)
        : [];

      const orderData = {
        customPizza: {
          base: selectedPizza.base,
          sauce: selectedPizza.sauce,
          cheese: selectedPizza.cheese || null,
          veggies: selectedPizza.veggies || [],
          meat: selectedPizza.meat || [],
        },
        totalPrice: getFinalPrice() * quantity,
        paymentId: transactionId,
      };

      console.log('Sending order data:', orderData);

      const orderResponse = await api.post('/orders', orderData);
      console.log('Order response:', orderResponse);
      
      toast.success('🎉 Payment Successful! Your order has been placed.');
      navigate('/my-orders');
    } catch (error) {
      console.error('Payment error:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      if (error.message && error.message.includes('CANCELED')) {
        toast.error('❌ Payment Cancelled');
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Please try again';
        toast.error('❌ Payment Failed: ' + errorMsg);
      }
    }
  };

  const steps = [
    { id: 1, title: 'Base', icon: Pizza, items: inventory.bases },
    { id: 2, title: 'Sauce', icon: Flame, items: inventory.sauces },
    { id: 3, title: 'Cheese', icon: CircleDot, items: inventory.cheese },
    { id: 4, title: 'Veggies', icon: Leaf, items: inventory.veggies, multi: true },
    { id: 5, title: 'Meat', icon: Cookie, items: inventory.meat, multi: true },
    { id: 6, title: 'Summary', icon: Check },
  ];

  const currentStepData = steps[step - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-2">
            Customize Your Pizza
          </h1>
          <p className="text-xl text-gray-600">
            Build your perfect pizza, one step at a time
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              
              return (
                <div key={s.id} className="flex items-center">
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-white text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold hidden sm:inline">{s.title}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-gray-400 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
              >
                {/* Step Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                    <StepIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Step {step}: {currentStepData.title}
                    </h2>
                    <p className="text-gray-600">
                      {currentStepData.multi ? 'Select multiple options' : 'Choose one option'}
                    </p>
                  </div>
                </div>

                {/* Step Content */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
                  </div>
                ) : step < 6 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStepData.items?.map((item) => {
                      const isSelected = currentStepData.multi
                        ? selectedPizza[currentStepData.title.toLowerCase()].includes(item._id)
                        : selectedPizza[currentStepData.title.toLowerCase()] === item._id;

                      const isOutOfStock = (item.quantity || 0) <= 0;

                      return (
                        <motion.button
                          key={item._id}
                          whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                          whileTap={{ scale: isOutOfStock ? 1 : 0.98 }}
                          onClick={() => !isOutOfStock && handleSelect(currentStepData.title.toLowerCase(), item._id)}
                          disabled={isOutOfStock}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 shadow-lg'
                              : isOutOfStock
                              ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-orange-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-1"
                            >
                              <Check className="w-4 h-4" />
                            </motion.div>
                          )}
                          
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                <span className="text-orange-600 font-semibold">
                                  ₹{item.price}
                                </span>
                                {isOutOfStock && (
                                  <span className="text-xs text-red-500 font-semibold">
                                    Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  // Summary Step
                  <div className="space-y-6">
                    {/* Size Selection */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Select Size</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {sizes.map((size) => (
                          <button
                            key={size.value}
                            onClick={() => setSelectedPizza({ ...selectedPizza, size: size.value })}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              selectedPizza.size === size.value
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            <div className="text-3xl mb-2">{size.icon}</div>
                            <div className="font-semibold">{size.value}</div>
                            {size.price > 0 && (
                              <div className="text-sm text-orange-600">+₹{size.price}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Crust Selection */}
                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Select Crust</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {crusts.map((crust) => (
                          <button
                            key={crust.value}
                            onClick={() => setSelectedPizza({ ...selectedPizza, crust: crust.value })}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${
                              selectedPizza.crust === crust.value
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            <div className="font-semibold mb-1">{crust.value}</div>
                            <div className="text-sm text-gray-600 mb-2">{crust.desc}</div>
                            {crust.price > 0 && (
                              <div className="text-sm text-orange-600">+₹{crust.price}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl p-6">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Pizza className="w-5 h-5" />
                        Your Pizza Summary
                      </h3>
                      <div className="space-y-2 text-sm">
                        {/* Pizza Name */}
                        <div className="flex justify-between pb-2 mb-2 border-b-2 border-orange-300">
                          <span className="text-gray-900 font-bold text-base">Pizza:</span>
                          <span className="font-bold text-orange-600 text-base">
                            {selectedPizza.name}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base:</span>
                          <span className="font-semibold">
                            {inventory.bases?.find(b => b._id === selectedPizza.base)?.name || 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sauce:</span>
                          <span className="font-semibold">
                            {inventory.sauces?.find(s => s._id === selectedPizza.sauce)?.name || 'Not selected'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cheese:</span>
                          <span className="font-semibold">
                            {selectedPizza.cheese 
                              ? inventory.cheese?.find(c => c._id === selectedPizza.cheese)?.name 
                              : 'None'}
                          </span>
                        </div>
                        {selectedPizza.veggies && selectedPizza.veggies.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Veggies:</span>
                            <span className="font-semibold">
                              {selectedPizza.veggies.map(id => 
                                inventory.veggies?.find(v => v._id === id)?.name
                              ).filter(Boolean).join(', ') || 'None'}
                            </span>
                          </div>
                        )}
                        {selectedPizza.meat && selectedPizza.meat.length > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Meat:</span>
                            <span className="font-semibold">
                              {selectedPizza.meat.map(id => 
                                inventory.meat?.find(m => m._id === id)?.name
                              ).filter(Boolean).join(', ') || 'None'}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-gray-300">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-semibold">{selectedPizza.size}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Crust:</span>
                          <span className="font-semibold">{selectedPizza.crust}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleBack}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      step === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-500'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Back
                  </button>

                  {step < 6 ? (
                    <div className="flex gap-3">
                      {/* Show Skip button for optional steps (cheese, veggies, meat) */}
                      {(step === 3 || step === 4 || step === 5) && (
                        <button
                          onClick={handleSkip}
                          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-600 rounded-xl font-semibold hover:border-gray-400 transition-all"
                        >
                          Skip (Optional)
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        {(step === 3 || step === 4 || step === 5) ? 'Continue' : 'Next'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddToCart}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                      <button
                        onClick={handlePayment}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        <Check className="w-5 h-5" />
                        Order Now
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Price Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 sticky top-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-orange-500" />
                Price Summary
              </h3>

              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <span className="font-semibold text-gray-700">Quantity</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 bg-white rounded-lg border-2 border-gray-300 hover:border-orange-500 transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-xl w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 bg-white rounded-lg border-2 border-gray-300 hover:border-orange-500 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Pizza Base Price</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>
                  {step === 6 && (
                    <>
                      {sizes.find(s => s.value === selectedPizza.size)?.price > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Size ({selectedPizza.size})</span>
                          <span>+₹{sizes.find(s => s.value === selectedPizza.size)?.price.toFixed(2)}</span>
                        </div>
                      )}
                      {crusts.find(c => c.value === selectedPizza.crust)?.price > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Crust ({selectedPizza.crust})</span>
                          <span>+₹{crusts.find(c => c.value === selectedPizza.crust)?.price.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Quantity (×{quantity})</span>
                    <span>₹{(getFinalPrice() * quantity).toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t-2 border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-orange-600">
                      ₹{(getFinalPrice() * quantity).toFixed(2)}
                    </span>
                  </div>
                  {totalPrice === 0 && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Select base to see price
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>30 min delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Premium ingredients</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Satisfaction guaranteed</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePizza;
