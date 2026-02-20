/**
 * ========================================
 * Délices d'Afrique - ProductCard
 * Carte produit premium modernisée
 * ========================================
 */

import React from 'react';
import { ShoppingBag, Star, Badge, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, onClickImage }) => {
  const { addToCart } = useCart();

  return (
    <div
      className="
        group bg-white rounded-2xl shadow-md border border-chocolate-100
        overflow-hidden h-full flex flex-col
        hover:shadow-xl hover:border-gold-300
        transition-all duration-300
        cursor-pointer
      "
      style={{
        animation: 'fadeInUp 0.6s ease-out'
      }}
    >
      {/* IMAGE */}
      <div 
        className="relative h-56 overflow-hidden bg-cream-100"
        onClick={() => onClickImage && onClickImage(product)}
      >
        <img 
          src={product.image || '/images/placeholder-product.jpg'}
          alt={product.name} 
          className="
            w-full h-full object-cover
            group-hover:scale-110 transition-transform duration-500
          "
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge Stock */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-chocolate-900 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full">
              Épuisé
            </span>
          </div>
        )}

        {/* Badge "Nouveau" (si produit récent) */}
        {product.isNew && (
          <div className="absolute top-3 right-3 bg-gold-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full shadow-lg">
            Nouveau
          </div>
        )}

        {/* Badge "Artisanal" */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-chocolate-700 px-2.5 py-1 text-xs font-bold flex items-center gap-1 rounded-full shadow-md">
          <span>✨</span>
          Artisanal
        </div>
      </div>

      {/* CONTENU */}
      <div className="p-5 flex flex-col flex-1">
        {/* Catégorie + Note */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-gold-600 uppercase tracking-wide">
            {product.category || 'Pâtisserie'}
          </span>
          
          {/* Étoiles (toujours 5/5 pour simplifier) */}
          <div className="flex text-gold-400 text-xs gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
        </div>

        {/* Nom */}
        <h3 className="font-heading text-lg font-bold text-chocolate-900 mb-2 leading-tight line-clamp-2 group-hover:text-gold-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="font-body text-sm text-chocolate-600 line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>
        )}

        {/* Footer: Prix + Bouton */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-chocolate-100">
          {/* Prix */}
          <div>
            <p className="font-accent text-2xl font-bold text-chocolate-900">
              {product.price.toLocaleString()}
              <span className="text-xs font-body font-normal text-chocolate-600 ml-1">
                FCFA
              </span>
            </p>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (product.inStock) {
                addToCart(product);
              }
            }}
            disabled={!product.inStock}
            className={`
              p-3 rounded-full shadow-lg flex items-center gap-2
              transition-all duration-300
              ${product.inStock
                ? 'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white hover:scale-110'
                : 'bg-chocolate-200 text-chocolate-400 cursor-not-allowed'
              }
            `}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;