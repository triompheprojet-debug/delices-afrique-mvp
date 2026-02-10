import React, { useState } from 'react';
import { ShoppingBag, Award, Sparkles, CheckCircle } from 'lucide-react';
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden h-full flex flex-col hover:border-purple-500/30 hover:shadow-elegant-lg transition-all duration-500"
    >
      
      {/* Badge "Signature" si produit premium */}
      {product.isSignature && (
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute top-3 left-3 z-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5"
        >
          <Award size={12} />
          Premium
        </motion.div>
      )}

      {/* IMAGE INTERACTIVE - Responsive optimisé */}
      <div 
        className="relative w-full aspect-square sm:aspect-[4/3] overflow-hidden bg-slate-900/50 cursor-zoom-in group/image"
        onClick={() => onClickImage && onClickImage(product)}
      >
        {/* Image avec lazy loading */}
        <motion.img 
          whileHover={{ scale: 1.05 }} 
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Overlay gradient au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500"></div>
        
        {/* Badge "Zoom" au hover - Desktop uniquement */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="hidden sm:flex absolute bottom-3 right-3 bg-slate-800/90 backdrop-blur-sm text-slate-200 px-3 py-1.5 rounded-full text-xs font-bold opacity-0 group-hover/image:opacity-100 transition-all duration-300 items-center gap-1.5"
        >
          <Sparkles size={12} />
          Agrandir
        </motion.div>

        {/* Overlay si épuisé */}
        {!product.inStock && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10"
          >
            <div className="bg-slate-700 text-slate-200 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
              Épuisé
            </div>
          </motion.div>
        )}
      </div>

      {/* CONTENU - Optimisé mobile */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        
        {/* En-tête : Catégorie uniquement */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">
            {product.category}
          </span>
        </div>

        {/* Nom du produit */}
        <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-100 mb-2 leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Description - Masquée sur mobile, visible sur desktop */}
        <p className="hidden sm:block text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
          {product.description || 'Délicieuse création artisanale préparée avec passion.'}
        </p>

        {/* Fournisseur - Desktop uniquement */}
        {product.supplierName && (
          <div className="hidden sm:flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
              {product.supplierName.charAt(0)}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Par <span className="text-purple-400 font-bold">{product.supplierName}</span>
            </span>
          </div>
        )}
        
        {/* Prix + Bouton CTA - Layout responsive */}
        <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 gap-3">
          
          {/* Prix */}
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-slate-100">
              {product.price.toLocaleString()}
              <span className="text-xs text-slate-400 font-normal ml-1">F</span>
            </span>
          </div>
          
          {/* Bouton Ajouter au Panier */}
          <AnimatePresence mode="wait">
            {isAdded ? (
              <motion.div
                key="added"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                exit={{ scale: 0 }}
                className="bg-green-500 text-white p-3 rounded-xl shadow-lg flex items-center justify-center"
              >
                <CheckCircle size={20} />
              </motion.div>
            ) : (
              <motion.button
                key="add"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileTap={{ scale: 0.9 }} 
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)"
                }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`
                  relative overflow-hidden p-3 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm
                  transition-all duration-300 flex-shrink-0
                  ${product.inStock 
                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700' 
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }
                `}
              >
                {/* Effet de brillance au hover */}
                {product.inStock && (
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  />
                )}
                <ShoppingBag size={18} className="relative z-10" />
                {/* Texte uniquement sur desktop */}
                <span className="hidden sm:inline relative z-10">Ajouter</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Effet de halo au hover - Subtil */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
    </motion.div>
  );
};

export default ProductCard;