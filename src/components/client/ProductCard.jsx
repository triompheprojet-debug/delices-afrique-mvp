import React from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Check, X } from 'lucide-react';

// Ce composant doit être appelé dans Menu.jsx (ou Home.jsx)
// Exemple: <ProductCard product={monProduit} />
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  // La vérification clé
  const isOutOfStock = !product.inStock;

  // Fonction pour ajouter un produit (ne s'active que si en stock)
  const handleAddToCart = () => {
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl relative">
      
      {/* Image du produit */}
      <div className={`h-48 overflow-hidden relative ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}>
        <img 
          src={product.image || 'https://via.placeholder.com/400?text=Image Produit'} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
        />
        
        {/* BADGE ÉPUISÉ (Affiche uniquement si hors stock) */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-2xl transform -rotate-6">
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Détails et Bouton */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 line-clamp-1 mb-1">{product.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">{product.description || 'Délicieuse spécialité de la maison.'}</p>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xl font-bold text-brand-brown">
            {product.price.toLocaleString()} <span className="text-sm">FCFA</span>
          </span>
          
          {/* BOUTON D'AJOUT CONDITIONNEL */}
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-colors shadow-md
              ${isOutOfStock 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                : 'bg-brand-brown text-white hover:bg-brand-brown/90 active:scale-95'
              }`
            }
          >
            {isOutOfStock ? (
              <X size={18} /> 
            ) : (
              <ShoppingCart size={18} />
            )}
            {isOutOfStock ? 'Indisponible' : 'Ajouter'}
          </button> 
        </div>
      </div>
    </div>
  );
};

export default ProductCard;