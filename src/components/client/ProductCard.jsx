import React from 'react';
import { Plus, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';


const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  // Formatage du prix (ex: 15000 => 15 000 FCFA)
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full">
      
      {/* --- Zone Image --- */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges (Promo / Nouveau) */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isPromoted && (
            <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
              PROMO
            </span>
          )}
          {product.isNew && (
            <span className="bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              NOUVEAU
            </span>
          )}
        </div>
      </div>

      {/* --- Zone Infos --- */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-brand-beige uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        <h3 className="text-xl font-serif font-bold text-brand-brown mb-2 leading-tight">
          {product.name}
        </h3>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description}
        </p>

        {/* --- Zone Action & Prix --- */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex flex-col">
            {product.isPromoted && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price * 1.2)} {/* Faux prix barré pour l'effet */}
              </span>
            )}
            <span className="text-lg font-bold text-brand-red">
              {formatPrice(product.price)}
            </span>
          </div>

          <button 
          onClick={() => addToCart(product)} // <-- Fonction d'ajout
          className="bg-brand-brown hover:bg-brand-beige text-white p-3 rounded-full transition-colors shadow-lg group-hover:scale-105 active:scale-95 flex items-center justify-center"
          title="Ajouter au panier"
        >
          <Plus size={20} />
        </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;