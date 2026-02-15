import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ShoppingBag, Minus, Plus, 
  Store, Sparkles, AlertCircle
} from 'lucide-react';

const ProductDetailModal = ({ 
  product, 
  onClose, 
  onAddToCart, 
  onRemoveFromCart,
  isInCart, 
  onUpdateQuantity, 
  cartQuantity 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  if (!product) return null;

  // --- LOGIQUE METADONNÉES ---
  const isNew = product.createdAt 
    ? (new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24) < 7 
    : false;

  const isAvailable = product.inStock && product.status === 'active';

  // Formatage Prix
  const formatPrice = (price) => price.toLocaleString('fr-FR');

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-3 md:p-4"
      >
        {/* Backdrop avec flou (Glass effect sombre) */}
        <div 
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />

        {/* Modal Container - Layout optimisé */}
        <motion.div
          layoutId={`product-${product.id}`}
          initial={{ y: '100%', opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: '100%', opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-full h-full sm:h-auto sm:w-[90vw] sm:max-w-6xl sm:max-h-[92vh] bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-elegant-lg overflow-hidden flex flex-col sm:flex-row z-10"
          onClick={(e) => e.stopPropagation()}
        >
          
          {/* --- ZONE IMAGE (IMMERSIVE) --- */}
          <div className="relative w-full h-[45vh] sm:h-full sm:w-1/2 flex-shrink-0 group overflow-hidden">
            {/* Image avec object-fit intelligent */}
            <img 
              src={product.image} 
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              loading="eager"
            />
            
            {/* Dégradé subtil - uniquement sur mobile en bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent sm:bg-gradient-to-r sm:from-transparent sm:via-transparent sm:to-slate-900/10 opacity-100"></div>

            {/* Bouton Fermer (Flottant Glass) - Position adaptative */}
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2.5 sm:p-3 rounded-full glass-effect text-white hover:bg-white/20 active:scale-95 transition-all z-20 shadow-lg"
              aria-label="Fermer"
            >
              <X size={20} className="sm:w-5 sm:h-5" />
            </button>

            {/* Badges - Position optimisée */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-2 items-start z-10">
              {isNew && (
                <span className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-purple-600 text-xs sm:text-sm font-bold text-white shadow-lg flex items-center gap-1.5 animate-pulse-soft backdrop-blur-sm">
                  <Sparkles size={14} className="sm:w-4 sm:h-4" /> Nouveau
                </span>
              )}
              {!isAvailable && (
                <span className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-red-500/90 text-xs sm:text-sm font-bold text-white shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
                  <AlertCircle size={14} className="sm:w-4 sm:h-4" /> Épuisé
                </span>
              )}
            </div>
          </div>

          {/* --- CONTENU --- */}
          <div className="flex-1 flex flex-col px-5 sm:px-6 md:px-8 pt-4 pb-5 sm:pb-6 -mt-6 sm:mt-0 relative z-10 overflow-hidden">
            
            {/* Header Produit */}
            <div className="mb-4 sm:mb-5 space-y-2 sm:space-y-3 flex-shrink-0">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                        <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-2xl sm:text-3xl md:text-4xl font-serif text-white leading-tight"
                        >
                            {product.name}
                        </motion.h2>
                        
                        {/* Chef / Supplier */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-center gap-2 text-slate-400 text-sm sm:text-base"
                        >
                            <Store size={16} className="text-purple-400 flex-shrink-0 sm:w-5 sm:h-5" />
                            <span className="font-medium tracking-wide uppercase truncate">{product.supplierName}</span>
                        </motion.div>
                    </div>

                    {/* Prix */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15 }}
                        className="text-right flex-shrink-0"
                    >
                         <span className="block text-2xl sm:text-3xl md:text-4xl font-bold gradient-text whitespace-nowrap">
                            {formatPrice(product.price)}
                         </span>
                         <span className="block text-xs sm:text-sm text-slate-500 font-medium mt-0.5">FCFA</span>
                    </motion.div>
                </div>
            </div>

            {/* Description épurée avec scroll */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4 sm:mb-5 min-h-0"
            >
                <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed font-light">
                    {product.description || "Une création artisanale d'exception, préparée avec passion pour éveiller vos sens. Chaque bouchée révèle un équilibre parfait entre tradition et modernité."}
                </p>
            </motion.div>

            {/* --- FOOTER ACTIONS --- */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-4 sm:pt-5 border-t border-slate-800/50 flex-shrink-0"
            >
              {isInCart ? (
                /* Mode Modification Panier */
                <div className="glass-effect rounded-2xl p-2 flex items-center justify-between gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onUpdateQuantity(product.id, -1)}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 active:scale-95 transition-all"
                    >
                        <Minus size={20} className="sm:w-6 sm:h-6" />
                    </motion.button>

                    <div className="flex flex-col items-center px-4">
                        <span className="text-2xl sm:text-3xl font-bold text-white">{cartQuantity}</span>
                        <span className="text-xs sm:text-sm uppercase tracking-wider text-slate-400 mt-0.5">Quantité</span>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onUpdateQuantity(product.id, 1)}
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 text-white flex items-center justify-center hover:from-purple-700 hover:to-purple-800 active:scale-95 transition-all shadow-lg shadow-purple-900/30"
                    >
                        <Plus size={20} className="sm:w-6 sm:h-6" />
                    </motion.button>
                </div>
              ) : (
                /* Mode Ajout Panier */
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAddToCart(product)}
                    disabled={!isAvailable}
                    className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-base sm:text-lg text-white flex items-center justify-center gap-3 transition-all shadow-lg ${
                        isAvailable 
                        ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 shadow-purple-900/40 hover:shadow-purple-900/60 hover:scale-[1.02]' 
                        : 'bg-slate-800 cursor-not-allowed text-slate-500'
                    }`}
                >
                    <ShoppingBag size={22} className="sm:w-6 sm:h-6" />
                    <span className="font-bold">{isAvailable ? 'Ajouter au panier' : 'Indisponible'}</span>
                    {isAvailable && (
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-sm sm:text-base backdrop-blur-sm font-semibold">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </motion.button>
              )}
            </motion.div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;