import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartDrawer = () => {
  const { isCartOpen, setIsCartOpen, cartItems, cartTotal } = useCart();
  const navigate = useNavigate();

  // Formatage du prix
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
  };

  // Si le panier est fermé, on ne l'affiche pas (ou on le sort de l'écran)
  if (!isCartOpen) return null;

  const handleCheckout = () => {
    setIsCartOpen(false); // On ferme le tiroir
    navigate('/checkout'); // On va vers la page de commande
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Fond sombre (Overlay) qui ferme le panier si on clique dessus */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Le Tiroir (Drawer) */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* En-tête du Panier */}
        <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-brand-brown text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} />
            <h2 className="font-serif font-bold text-xl">Votre Panier</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="hover:bg-white/20 p-2 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Liste des Produits */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-50" />
              <p>Votre panier est vide pour le moment.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 text-brand-red font-bold hover:underline"
              >
                Retourner au menu
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                {/* Image miniature */}
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded-md"
                />
                
                {/* Infos produit */}
                <div className="flex-grow">
                  <h4 className="font-bold text-brand-brown text-sm">{item.name}</h4>
                  <p className="text-brand-red font-bold text-sm">{formatPrice(item.price)}</p>
                </div>

                {/* Bouton Supprimer (pour le proto, on n'a pas encore codé la suppression dans le context, visuel seulement) */}
                <button className="text-gray-400 hover:text-red-500 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pied du Panier (Total + Action) */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50">
            {/* Total Estimé */}
            <div className="flex justify-between items-center mb-4 text-xl font-bold text-brand-brown">
              <span>Total estimé</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>

            {/* Message Important */}
            <p className="text-xs text-center text-gray-500 mb-4 bg-brand-beige/20 p-2 rounded">
              ⓘ Paiement à la livraison ou au retrait
            </p>

            {/* Bouton Commander */}
            <button 
              onClick={handleCheckout}
              className="w-full bg-brand-red hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              Commander maintenant
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;