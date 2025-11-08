import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('pizzaCart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('pizzaCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) => 
          cartItem._id === item._id && 
          JSON.stringify(cartItem.customizations) === JSON.stringify(item.customizations)
      );

      if (existingItem) {
        toast.success('Quantity updated in cart!');
        return prevCart.map((cartItem) =>
          cartItem._id === item._id && 
          JSON.stringify(cartItem.customizations) === JSON.stringify(item.customizations)
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      toast.success('Added to cart!');
      return [...prevCart, { ...item, cartId: Date.now() }];
    });
  };

  const removeFromCart = (cartId) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
    toast.success('Removed from cart');
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    toast.success('Cart cleared');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const basePrice = item.price || 0;
      const toppingsPrice = item.customizations?.toppings?.reduce(
        (sum, topping) => sum + (topping.price || 0),
        0
      ) || 0;
      const itemTotal = (basePrice + toppingsPrice) * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isCartOpen,
        toggleCart,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
