import React, { useState } from 'react';
import { ShoppingBag, Award, Sparkles, CheckCircle, ChefHat } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ProductCard = ({ product, onClickImage }) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (product.inStock) {
      addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-slate-800/40 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-slate-700/40 overflow-hidden flex flex-col hover:border-purple-500/30 hover:shadow-lg transition-all duration-300"
    >
      
      {/* IMAGE - Ratio optimisé : Correction ici (aspect-[4/3] au lieu de aspect-square) */}
      <div 
        className="relative w-full aspect-[4/3] overflow-hidden bg-slate-900/50 cursor-pointer"
        onClick={() => onClickImage && onClickImage(product)}
      >
        {/* Image avec lazy loading */}
        <motion.img 
          whileHover={{ scale: 1.05 }} 
          transition={{ duration: 0.5, ease: 'easeOut' }}
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Badge Fournisseur - En haut de l'image */}
        {product.supplierName && (
          <div className="absolute top-2 left-2 z-20 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 text-white px-2 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {product.supplierName.charAt(0)}
            </div>
            <span className="text-[10px] sm:text-xs font-bold truncate max-w-[120px]">
              {product.supplierName}
            </span>
          </div>
        )}

        {/* Badge "Premium" si produit signature */}
        {product.isSignature && (
          <div className="absolute top-2 right-2 z-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-2 py-1 rounded-lg text-[9px] sm:text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
            <Award size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden xs:inline">Premium</span>
          </div>
        )}

        {/* Overlay gradient au hover - Desktop */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        {/* Badge "Zoom" au hover - Desktop uniquement */}
        <div className="hidden lg:flex absolute bottom-2 right-2 bg-slate-800/80 backdrop-blur-sm text-slate-200 px-2 py-1 rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 items-center gap-1">
          <Sparkles size={10} />
          Agrandir
        </div>

        {/* Overlay si épuisé */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-slate-700 text-slate-200 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-lg">
              Épuisé
            </div>
          </div>
        )}
      </div>

      {/* CONTENU - Ultra compact, zéro espaces vides */}
      <div className="p-2.5 sm:p-3 flex flex-col">
        
        {/* Nom du produit */}
        <h3 className="font-serif font-bold text-sm sm:text-base lg:text-lg text-slate-100 leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors duration-300 mb-1.5 sm:mb-2">
          {product.name}
        </h3>

        {/* Catégorie */}
        <span className="text-[9px] sm:text-[10px] font-bold text-purple-400/70 uppercase tracking-widest mb-2">
          {product.category}
        </span>

        {/* Description - Desktop uniquement */}
        {product.description && (
          <p className="hidden lg:block text-slate-400 text-xs line-clamp-2 leading-relaxed mb-2">
            {product.description}
          </p>
        )}
        
        {/* Prix + Bouton */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Prix */}
          <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-100">
            {product.price.toLocaleString()}
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-normal ml-0.5">F</span>
          </span>
          
          {/* Bouton Ajouter au Panier */}
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.div
                key="added"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                exit={{ scale: 0 }}
                className="bg-green-500 text-white p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-lg flex items-center justify-center"
              >
                <CheckCircle size={18} className="sm:w-5 sm:h-5" />
              </motion.div>
            ) : (
              <motion.button
                key="add"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileTap={{ scale: 0.9 }} 
                whileHover={{ scale: 1.05 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`
                  relative overflow-hidden p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl shadow-lg 
                  flex items-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm
                  transition-all duration-300 flex-shrink-0
                  ${product.inStock 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {product.inStock && (
                  <motion.div 
                    className="hidden lg:block absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                )}
                <ShoppingBag size={16} className="relative z-10 sm:w-[18px] sm:h-[18px]" />
                <span className="hidden lg:inline relative z-10">Ajouter</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="hidden sm:block absolute -inset-0.5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
    </motion.div>
  );
};

export default ProductCard;