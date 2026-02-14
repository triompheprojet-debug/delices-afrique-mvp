import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat } from 'lucide-react';

const LoadingScreen = ({ loading }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) return;

    // Animation de progression fluide
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        // Progression naturelle avec accélération puis décélération
        const increment = prev < 30 ? 12 : prev < 70 ? 8 : prev < 90 ? 5 : 3;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    return () => {
      clearInterval(progressInterval);
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center overflow-hidden"
      >
        {/* Animated background - Subtil et professionnel */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.03, 0.05, 0.03]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.04, 0.06, 0.04]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1
            }}
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-500 rounded-full blur-3xl"
          />
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-4 w-full max-w-md">
          
          {/* Logo animé - Simple et élégant */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              duration: 0.6
            }}
            className="mb-10 sm:mb-12"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 relative">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-2xl sm:rounded-3xl"
              />
              <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 text-white relative z-10" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Titre - Minimal et professionnel */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 sm:mb-10"
          >
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-100 mb-2">
              Délices d'Afrique
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Chargement en cours...
            </p>
          </motion.div>

          {/* Progress bar - Clean et moderne */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full mb-4"
          >
            <div className="h-1.5 sm:h-2 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full relative overflow-hidden"
              >
                {/* Shimmer effect */}
                <motion.div
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
            
            {/* Pourcentage - Optionnel, discret */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-xs sm:text-sm mt-3 font-medium"
            >
              {progress}%
            </motion.p>
          </motion.div>

          {/* Spinner minimaliste - 3 points */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-1.5 mt-6"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut'
                }}
                className="w-2 h-2 bg-purple-500 rounded-full"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
