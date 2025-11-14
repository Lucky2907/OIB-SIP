import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const SpinWheel = ({ isOpen, onClose, onWinDiscount }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [hasSpun, setHasSpun] = useState(() => {
    return localStorage.getItem('hasSpunWheel') === 'true';
  });

  // Prize segments (8 segments)
  const prizes = [
    { id: 1, label: '10%\nOFF', value: 10, color: '#ef4444', probability: 0.25 },
    { id: 2, label: '5%\nOFF', value: 5, color: '#f59e0b', probability: 0.30 },
    { id: 3, label: '20%\nOFF', value: 20, color: '#10b981', probability: 0.15 },
    { id: 4, label: 'FREE\nDELIVERY', value: 'free-delivery', color: '#3b82f6', probability: 0.10 },
    { id: 5, label: '15%\nOFF', value: 15, color: '#8b5cf6', probability: 0.15 },
    { id: 6, label: 'TRY\nAGAIN', value: 0, color: '#6b7280', probability: 0.03 },
    { id: 7, label: '25%\nOFF', value: 25, color: '#ec4899', probability: 0.01 },
    { id: 8, label: '₹50\nOFF', value: 50, color: '#14b8a6', probability: 0.01 },
  ];

  const segmentAngle = 360 / prizes.length;

  const selectPrize = () => {
    const random = Math.random();
    let cumulativeProbability = 0;
    
    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }
    return prizes[0]; // Fallback
  };

  const handleSpin = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    
    const selectedPrize = selectPrize();
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    
    // Calculate rotation to land on selected prize
    const baseRotation = 360 * 5; // 5 full spins
    const prizeAngle = prizeIndex * segmentAngle;
    const offsetAngle = segmentAngle / 2; // Center of segment
    const finalRotation = baseRotation + (360 - prizeAngle) + offsetAngle;
    
    setRotation(finalRotation);

    // After spinning
    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      localStorage.setItem('hasSpunWheel', 'true');
      
      // Show prize
      if (selectedPrize.value === 0) {
        toast.error('Better luck next time! 😊');
      } else if (selectedPrize.value === 'free-delivery') {
        toast.success('🎉 You won FREE DELIVERY!');
        onWinDiscount && onWinDiscount({ type: 'delivery', value: 100, code: 'SPIN_FREE_DELIVERY' });
      } else if (typeof selectedPrize.value === 'number' && selectedPrize.value >= 50) {
        toast.success(`🎉 You won ₹${selectedPrize.value} OFF!`);
        onWinDiscount && onWinDiscount({ type: 'fixed', value: selectedPrize.value, code: `SPIN_${selectedPrize.value}` });
      } else {
        toast.success(`🎉 You won ${selectedPrize.value}% discount!`);
        onWinDiscount && onWinDiscount({ type: 'percentage', value: selectedPrize.value, code: `SPIN_${selectedPrize.value}` });
      }

      // Close after showing result
      setTimeout(() => {
        onClose();
      }, 3000);
    }, 5000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block mb-4"
              >
                <Gift size={48} className="text-orange-500" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Spin & Win!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {hasSpun ? 'You\'ve already spun today!' : 'Spin the wheel for a chance to win amazing discounts!'}
              </p>
            </div>

            {/* Wheel Container */}
            <div className="relative w-full max-w-md mx-auto mb-8">
              {/* Arrow Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-500 drop-shadow-lg" />
              </div>

              {/* Wheel */}
              <div className="relative w-full aspect-square">
                {/* Center Pin */}
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg flex items-center justify-center border-4 border-white dark:border-gray-800">
                    <Sparkles className="text-white" size={24} />
                  </div>
                </div>

                {/* Spinning Wheel */}
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full h-full rounded-full overflow-hidden shadow-2xl border-8 border-white dark:border-gray-700 relative"
                >
                  {/* Render each segment as a separate SVG slice */}
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {prizes.map((prize, index) => {
                      const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                      const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
                      const x1 = 100 + 100 * Math.cos(startAngle);
                      const y1 = 100 + 100 * Math.sin(startAngle);
                      const x2 = 100 + 100 * Math.cos(endAngle);
                      const y2 = 100 + 100 * Math.sin(endAngle);
                      
                      const largeArc = segmentAngle > 180 ? 1 : 0;
                      const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;
                      
                      // Calculate text position
                      const textAngle = (index * segmentAngle + segmentAngle / 2 - 90) * (Math.PI / 180);
                      const textRadius = 60;
                      const textX = 100 + textRadius * Math.cos(textAngle);
                      const textY = 100 + textRadius * Math.sin(textAngle);
                      const textRotation = index * segmentAngle + segmentAngle / 2;
                      
                      return (
                        <g key={prize.id}>
                          {/* Segment */}
                          <path
                            d={pathData}
                            fill={prize.color}
                            stroke="white"
                            strokeWidth="2"
                          />
                          {/* Multi-line Text */}
                          {prize.label.split('\n').map((line, lineIndex) => (
                            <text
                              key={lineIndex}
                              x={textX}
                              y={textY + (lineIndex - 0.5) * 8}
                              fill="white"
                              fontSize="9"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                              className="drop-shadow-lg"
                            >
                              {line}
                            </text>
                          ))}
                        </g>
                      );
                    })}
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Spin Button */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: hasSpun ? 1 : 1.05 }}
                whileTap={{ scale: hasSpun ? 1 : 0.95 }}
                onClick={handleSpin}
                disabled={isSpinning || hasSpun}
                className={`px-12 py-4 rounded-full font-bold text-lg shadow-lg transition-all ${
                  isSpinning || hasSpun
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-xl'
                }`}
              >
                {isSpinning ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles size={20} />
                    </motion.div>
                    Spinning...
                  </span>
                ) : hasSpun ? (
                  'Already Spun Today'
                ) : (
                  'SPIN NOW!'
                )}
              </motion.button>
              
              {!hasSpun && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  * One spin per day per user
                </p>
              )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 opacity-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles size={32} className="text-orange-500" />
              </motion.div>
            </div>
            <div className="absolute bottom-10 right-10 opacity-20">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              >
                <Gift size={28} className="text-red-500" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpinWheel;
