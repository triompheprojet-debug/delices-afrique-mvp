import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const MenuHero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Images depuis le dossier public/images/menuHero
  const backgroundImages = [
    '/images/menuHero/image1.jpg',
    '/images/menuHero/image2.jpg',
    '/images/menuHero/image3.jpg',
    '/images/menuHero/image4.jpg',
    '/images/menuHero/image5.jpg',
    '/images/menuHero/image6.jpg',
  ];

  // Changer d'image toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] overflow-hidden">
      {/* Carousel d'images en arrière-plan */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={backgroundImages[currentImageIndex]}
              alt="Pâtisserie"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>

        {/* Overlay gradient subtil pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/80"></div>
        
        {/* Vignette subtile sur les côtés */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40"></div>
      </div>

      {/* Effets lumineux subtils */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Contenu minimal */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge discret */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 px-4 py-2 rounded-full mb-6 sm:mb-8"
          >
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200 tracking-wide">
              Notre Menu
            </span>
          </motion.div>

          {/* Titre épuré */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 font-serif leading-tight"
          >
            <span className="gradient-text">
              Découvrez nos Créations
            </span>
          </motion.h1>

          {/* Sous-titre court */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light"
          >
            Des saveurs authentiques, un savoir-faire d'exception
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default MenuHero;