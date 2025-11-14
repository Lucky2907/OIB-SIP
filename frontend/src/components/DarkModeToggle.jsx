import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleDarkMode}
      className="relative w-16 h-8 bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-colors duration-300"
      aria-label="Toggle dark mode"
    >
      <motion.div
        animate={{ x: isDarkMode ? 32 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center"
      >
        {isDarkMode ? (
          <Moon size={14} className="text-yellow-400" />
        ) : (
          <Sun size={14} className="text-orange-500" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default DarkModeToggle;
