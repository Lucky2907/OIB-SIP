import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Cart = () => {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    clearCart 
  } = useCart();
  
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!window.google?.payments?.api) {
      toast.error('Google Pay not available. Please enable it in your browser.');
      return;
    }

    try {
      const totalAmount = getCartTotal();
      
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
          totalPrice: totalAmount.toFixed(2),
          currencyCode: 'INR',
          countryCode: 'IN',
        },
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
      const paymentToken = paymentData.paymentMethodData.tokenizationData.token;

      const googlePayOrder = await api.post('/orders/create-googlepay-order', {
        amount: totalAmount,
        currency: 'INR',
        paymentToken: paymentToken,
      });

      console.log('Google Pay order response:', googlePayOrder.data);

      // Ensure we have a valid transaction ID
      const transactionId = googlePayOrder.data?.transactionId || googlePayOrder.data?.data?.transactionId;
      
      if (!transactionId) {
        throw new Error('Payment transaction ID not received from server');
      }

      // Create order for each cart item
      const orderPromises = cart.map(item => {
        // Check if item has customization IDs (custom pizza) or is a ready-made pizza
        const orderData = {
          customPizza: {
            base: item.customizations?.baseId || item._id, // Use item._id for ready-made pizzas
            sauce: item.customizations?.sauceId || item._id,
            cheese: item.customizations?.cheeseId || null,
            veggies: item.customizations?.veggiesIds || [],
            meat: item.customizations?.meatIds || [],
          },
          totalPrice: (item.price + (item.customizations?.toppings?.reduce((sum, t) => sum + t.price, 0) || 0)) * item.quantity,
          paymentId: transactionId,
        };
        return api.post('/orders', orderData);
      });

      await Promise.all(orderPromises);
      
      toast.success('🎉 Payment Successful! Your orders have been placed.');
      clearCart();
      toggleCart();
      navigate('/my-orders');
    } catch (error) {
      console.error('Payment error:', error);
      if (error.message && error.message.includes('CANCELED')) {
        toast.error('❌ Payment Cancelled');
      } else {
        toast.error('❌ Payment Failed: ' + (error.response?.data?.message || error.message || 'Please try again'));
      }
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />

          {/* Cart Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6" />
                <h2 className="text-xl font-display font-bold">Your Cart</h2>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingCart className="w-24 h-24 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-2">Add some delicious pizzas!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.cartId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-gray-50 rounded-xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-pizza-sauce to-pizza-crust flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                            🍕
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.size || 'Medium'} • {item.crust || 'Regular'}
                        </p>
                        
                        {/* Toppings */}
                        {item.customizations?.toppings?.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1 truncate">
                            + {item.customizations.toppings.map(t => t.name).join(', ')}
                          </p>
                        )}

                        {/* Price & Quantity */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                            <button
                              onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Minus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-8 text-center font-medium text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                              <Plus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-primary-600">
                              ₹{((item.price + (item.customizations?.toppings?.reduce((sum, t) => sum + t.price, 0) || 0)) * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.cartId)}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span className="text-gray-700">Total</span>
                  <span className="text-2xl text-primary-600">
                    ₹{getCartTotal().toFixed(2)}
                  </span>
                </div>

                {/* Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-white text-gray-700 py-3 rounded-xl font-medium border-2 border-gray-200 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
