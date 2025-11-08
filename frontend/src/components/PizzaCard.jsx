import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const PizzaCard = ({ pizza, onCustomize }) => {
  const { addToCart } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart({
      ...pizza,
      quantity: 1,
      customizations: { toppings: [] },
      size: 'Medium',
      crust: 'Regular',
    });
  };

  const handleCustomize = () => {
    if (onCustomize) {
      onCustomize(pizza);
    }
  };

  const pizzaImages = {
    'Margherita': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    'Pepperoni': 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400',
    'BBQ Chicken': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'Veggie Delight': 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=400',
    'Hawaiian': 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400',
    'Meat Lovers': 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=400',
    'default': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
  };

  const imageUrl = pizzaImages[pizza.name] || pizzaImages['default'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group relative"
      onClick={handleCustomize}
    >
      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsFavorite(!isFavorite);
        }}
        className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:scale-110 transition-transform"
      >
        <Heart
          className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
        />
      </button>

      {/* Stock Badge */}
      {pizza.stock <= 0 && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          Out of Stock
        </div>
      )}
      {pizza.stock > 0 && pizza.stock <= 10 && (
        <div className="absolute top-4 left-4 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
          Only {pizza.stock} left!
        </div>
      )}

      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
        <img
          src={imageUrl}
          alt={pizza.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title & Category */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-xl font-display font-bold text-gray-900 mb-1">
              {pizza.name}
            </h3>
            <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
              {pizza.category || 'Pizza'}
            </span>
          </div>
        </div>

        {/* Description */}
        {pizza.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {pizza.description}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < (pizza.rating || 4)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-gray-500 ml-1">
            ({pizza.reviews || Math.floor(Math.random() * 100) + 50})
          </span>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-2xl font-bold text-primary-600">
              ₹{pizza.price}
            </span>
            <span className="text-sm text-gray-500 ml-1">onwards</span>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleQuickAdd}
              disabled={pizza.stock <= 0}
              className={`p-3 rounded-xl shadow-md transition-all duration-200 ${
                pizza.stock <= 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg text-white'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Customize Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleCustomize}
          disabled={pizza.stock <= 0}
          className={`w-full mt-3 py-3 rounded-xl font-semibold transition-all duration-200 ${
            pizza.stock <= 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:shadow-lg hover:from-orange-500 hover:to-red-600'
          }`}
        >
          {pizza.stock <= 0 ? 'Out of Stock' : 'Customize Now'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PizzaCard;
