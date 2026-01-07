import React from 'react';
import { ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product, onClickImage }) => {
  const { addToCart } = useCart();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -10 }} 
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col"
    >
      
      {/* IMAGE CLIQUABLE */}
      <div 
        className="relative h-48 sm:h-56 overflow-hidden bg-gray-100 cursor-zoom-in"
        onClick={() => onClickImage && onClickImage(product)} // Déclenche l'ouverture
      >
        <motion.img 
          whileHover={{ scale: 1.1 }} 
          transition={{ duration: 0.6 }}
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full">Épuisé</span>
          </div>
        )}
      </div>

      {/* CONTENU */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
           <span className="text-xs font-bold text-brand-beige uppercase tracking-wide">{product.category}</span>
           <div className="flex text-yellow-400 text-xs gap-0.5">
              {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor"/>)}
           </div>
        </div>

        <h3 className="font-serif font-bold text-lg text-gray-800 mb-1 leading-tight">{product.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{product.description || 'Délicieuse spécialité de la maison.'}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <span className="text-xl font-bold text-brand-brown">{product.price.toLocaleString()} <span className="text-xs">FCFA</span></span>
          
          <motion.button 
            whileTap={{ scale: 0.9 }} 
            whileHover={{ scale: 1.1, backgroundColor: "#E63946" }} 
            onClick={() => product.inStock && addToCart(product)}
            disabled={!product.inStock}
            className={`
              p-3 rounded-full shadow-lg flex items-center gap-2 transition-colors
              ${product.inStock ? 'bg-brand-brown text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            <ShoppingBag size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;