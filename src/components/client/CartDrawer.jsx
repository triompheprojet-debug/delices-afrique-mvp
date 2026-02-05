import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'; 

const CartDrawer = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  // Si le panier est fermé, on ne retourne rien (ou on gère via CSS class pour l'animation)
  // Ici on utilise une classe CSS translate pour l'effet "glissement"
  
  const handleCheckout = () => {
    setIsCartOpen(false); // On ferme le sidebar
    navigate('/checkout'); // On va payer
  };

  return (
    <>
      {/* Overlay sombre (cliquer pour fermer) */}
      {isCartOpen && (
        <div 
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm"
        />
      )}

      {/* Le panneau latéral */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* En-tête */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-brand-brown text-white">
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} />
            <h2 className="text-xl font-serif font-bold">Mon Panier</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-white/20 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Liste des produits (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 h-[calc(100vh-200px)]">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingBag size={64} className="mb-4 opacity-20"/>
              <p>Votre panier est vide.</p>
              <button onClick={() => setIsCartOpen(false)} className="mt-4 text-brand-brown font-bold underline">Retour au menu</button>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  {/* Image Produit */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? <img src={item.image} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-gray-200"/>}
                  </div>

                  {/* Infos + Contrôles */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">{item.price.toLocaleString()} FCFA</p>

                    {/* CONTRÔLE QUANTITÉ */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-brand-brown text-white flex items-center justify-center hover:bg-brand-brown/90 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied de page (Total + Bouton) */}
        {cartItems.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full p-5 bg-white border-t border-gray-100">
            <div className="flex justify-between items-center mb-4 text-xl font-bold text-gray-800">
              <span>Total</span>
              <span className="text-brand-brown">{cartTotal.toLocaleString()} FCFA</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-brand-red text-white font-bold py-4 rounded-xl shadow-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              Passer la commande
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;