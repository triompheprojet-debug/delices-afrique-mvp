import React, { useState } from 'react';
import { ShoppingBag, Award, Sparkles, CheckCircle, Eye, Plus, Minus, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompactProductCard = ({ 
  product, 
  onExpand, 
  isInCart, 
  onAddToCart, 
  onRemoveFromCart, // Assure-toi que cette fonction est bien passée par le parent
  onUpdateQuantity, 
  cartQuantity 
}) => {
  const [isAdded, setIsAdded] = useState(false);

  // Gestion de l'ajout via le bouton principal
  const handleAddToCart = (e) => {
    e?.stopPropagation();
    if (product.inStock) {
      onAddToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  // Gestion du clic sur le cœur (Lier au panier)
  const handleHeartClick = (e) => {
    e.stopPropagation(); // Empêche d'ouvrir la carte
    
    if (isInCart) {
      // Si déjà dans le panier, on le retire
      if (onRemoveFromCart) onRemoveFromCart(product.id);
    } else {
      // Sinon, on l'ajoute
      handleAddToCart();
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[220px] group relative bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/40 overflow-hidden flex flex-col hover:border-purple-500/30 hover:shadow-lg transition-all duration-300"
    >
      
      {/* IMAGE - Ratio corrigé */}
      {/* CHANGEMENT ICI : aspect-[4/3] au lieu de aspect-square pour éviter le vide vertical */}
      {/* CHANGEMENT ICI : Suppression de bg-slate-xxx pour éviter la barre de couleur si l'image ne remplit pas tout */}
      <div 
        className="relative w-full aspect-[4/3] overflow-hidden cursor-pointer"
        onClick={() => onExpand && onExpand(product)}
      >
        {/* Image */}
        <motion.img 
          whileHover={{ scale: 1.05 }} 
          transition={{ duration: 0.5, ease: 'easeOut' }}
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover" 
          loading="lazy"
        />

        {/* --- BOUTON CŒUR (Lié au Panier) --- */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleHeartClick}
          className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg group/heart hover:bg-slate-800 transition-colors"
        >
          <Heart 
            size={16} 
            className={`transition-colors duration-300 ${
              isInCart 
                ? 'fill-pink-500 text-pink-500' // Si dans le panier : Rempli Rose
                : 'text-slate-200 group-hover/heart:text-pink-400' // Sinon : Contour blanc
            }`} 
          />
        </motion.button>

        {/* Badge Fournisseur */}
        {product.supplierName && (
          <div className="absolute top-2 left-2 z-20 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 text-white px-2 py-1 rounded-lg shadow-lg flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
              {product.supplierName.charAt(0)}
            </div>
            <span className="text-[9px] font-bold truncate max-w-[80px]">
              {product.supplierName}
            </span>
          </div>
        )}

        {/* Badge "Premium" - En bas à gauche */}
        {product.isSignature && (
          <div className="absolute bottom-2 left-2 z-20 bg-gradient-to-br from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
            <Award size={8} />
            <span>Premium</span>
          </div>
        )}

        {/* Overlay gradient au hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        
        {/* Overlay si épuisé */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="bg-slate-700 text-slate-200 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg">
              Épuisé
            </div>
          </div>
        )}
      </div>

      {/* CONTENU */}
      <div className="p-2.5 flex flex-col flex-grow">
        
        {/* Nom du produit */}
        <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-100 leading-tight line-clamp-2 group-hover:text-purple-300 transition-colors duration-300 mb-1">
          {product.name}
        </h3>

        {/* Catégorie */}
        <span className="text-[9px] font-bold text-purple-400/70 uppercase tracking-widest mb-2">
          {product.category}
        </span>

        {/* Description */}
        {product.description && (
          <p className="hidden md:block text-slate-400 text-[10px] line-clamp-2 leading-relaxed mb-2">
            {product.description}
          </p>
        )}
        
        {/* Prix et Actions */}
        <div className="mt-auto">
            <div className="mb-2">
            <span className="text-sm sm:text-base font-bold text-slate-100">
                {product.price.toLocaleString()}
                <span className="text-[9px] text-slate-400 font-normal ml-0.5">F</span>
            </span>
            </div>

            <div className="space-y-1.5">
            {/* Bouton Ajouter / Contrôles Quantité */}
            {!isInCart ? (
                <AnimatePresence mode="wait">
                {isAdded ? (
                    <motion.div
                    key="added"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                    exit={{ scale: 0 }}
                    className="w-full bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center justify-center"
                    >
                    <CheckCircle size={14} />
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
                        relative overflow-hidden w-full p-2 rounded-lg shadow-lg 
                        flex items-center justify-center gap-1.5 font-bold text-xs
                        transition-all duration-300
                        ${product.inStock 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700' 
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }
                    `}
                    >
                    {product.inStock && (
                        <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                    )}
                    <ShoppingBag size={12} className="relative z-10" />
                    <span className="relative z-10">Ajouter</span>
                    </motion.button>
                )}
                </AnimatePresence>
            ) : (
                <div className="flex items-center justify-between bg-purple-600/20 border border-purple-600 rounded-lg p-1">
                <button
                    onClick={() => onUpdateQuantity(product.id, -1)}
                    className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                    <Minus size={12} className="text-white" />
                </button>
                <span className="text-xs font-bold text-purple-400 px-2">
                    {cartQuantity}
                </span>
                <button
                    onClick={() => onUpdateQuantity(product.id, 1)}
                    className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                    <Plus size={12} className="text-white" />
                </button>
                </div>
            )}

            {/* Bouton Détails */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onExpand(product)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-1"
            >
                <Eye size={10} />
                Plus d'infos
            </motion.button>
            </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
    </motion.div>
  );
};

export default CompactProductCard;