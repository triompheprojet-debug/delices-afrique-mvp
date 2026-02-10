/**
 * ========================================
 * DÉLICES D'AFRIQUE - CartDrawer
 * Panier latéral modernisé
 * ========================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button, { GoldButton } from '../common/Button';
import { EmptyCart } from '../common/EmptyState';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    cartTotal,
    promo
  } = useCart();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  // Calculer le total final avec promo
  const finalTotal = Math.max(0, cartTotal - (promo?.discountAmount || 0));

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div 
          onClick={() => setIsCartOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      )}

      {/* Drawer */}
      <div 
        className={`
          fixed top-0 right-0 h-full w-full max-w-md
          bg-white z-50 shadow-2xl
          transform transition-transform duration-300 ease-out
          flex flex-col
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-chocolate-200 bg-gradient-to-r from-chocolate-900 to-chocolate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Mon Panier</h2>
              <p className="text-xs text-white/80">
                {cartItems.length} {cartItems.length > 1 ? 'articles' : 'article'}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Liste produits */}
        <div className="flex-1 overflow-y-auto p-5 bg-cream-50">
          {cartItems.length === 0 ? (
            <EmptyCart onBrowse={() => {
              setIsCartOpen(false);
              navigate('/menu');
            }} />
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem
                  key={item.cartId || item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-5 bg-white border-t border-chocolate-200 space-y-4">
            {/* Code promo actif */}
            {promo?.code && (
              <div className="bg-gold-50 border border-gold-200 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-gold-600 text-xl">🎁</span>
                  <div>
                    <p className="font-heading text-sm font-bold text-gold-800">
                      Code promo appliqué
                    </p>
                    <p className="font-body text-xs text-gold-600">
                      {promo.code}
                    </p>
                  </div>
                </div>
                <p className="font-accent text-lg font-bold text-gold-600">
                  -{promo.discountAmount.toLocaleString()} FCFA
                </p>
              </div>
            )}

            {/* Total */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm text-chocolate-600">
                <span>Sous-total</span>
                <span>{cartTotal.toLocaleString()} FCFA</span>
              </div>
              
              {promo?.discountAmount > 0 && (
                <div className="flex justify-between items-center text-sm text-success-600 font-bold">
                  <span>Réduction</span>
                  <span>-{promo.discountAmount.toLocaleString()} FCFA</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xl font-bold text-chocolate-900 pt-2 border-t border-chocolate-200">
                <span className="font-heading">Total</span>
                <span className="font-accent text-primary-600">
                  {finalTotal.toLocaleString()} FCFA
                </span>
              </div>
            </div>

            {/* Bouton commander */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCheckout}
              rightIcon={<ArrowRight size={20} />}
              className="shadow-lg"
            >
              Passer la commande
            </Button>

            {/* Lien continuer shopping */}
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-full font-body text-sm text-chocolate-600 hover:text-gold-600 transition-colors text-center"
            >
              Continuer mes achats →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/**
 * Item du panier
 */
const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-chocolate-200 hover:border-gold-300 transition-colors">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-20 h-20 bg-cream-100 rounded-lg overflow-hidden flex-shrink-0">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-chocolate-200 to-chocolate-300" />
          )}
        </div>

        {/* Infos */}
        <div className="flex-1 min-w-0">
          {/* Nom + Bouton supprimer */}
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-heading text-sm font-bold text-chocolate-900 line-clamp-2">
              {item.name}
            </h4>
            <button 
              onClick={() => onRemove(item.id)}
              className="text-chocolate-400 hover:text-red-600 transition-colors p-1"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Prix unitaire */}
          <p className="font-body text-sm text-chocolate-600 mb-3">
            {item.price.toLocaleString()} FCFA
          </p>

          {/* Contrôles quantité */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onUpdateQuantity(item.id, -1)}
              disabled={item.quantity <= 1}
              className="
                w-8 h-8 rounded-full
                bg-chocolate-100 hover:bg-chocolate-200
                text-chocolate-700
                flex items-center justify-center
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <Minus size={14} />
            </button>

            <span className="font-accent text-lg font-bold text-chocolate-900 min-w-[2rem] text-center">
              {item.quantity}
            </span>

            <button 
              onClick={() => onUpdateQuantity(item.id, 1)}
              className="
                w-8 h-8 rounded-full
                bg-gradient-to-br from-primary-600 to-primary-700
                hover:from-primary-700 hover:to-primary-800
                text-white
                flex items-center justify-center
                transition-all hover:scale-110
                shadow-md
              "
            >
              <Plus size={14} />
            </button>

            {/* Prix total ligne */}
            <span className="ml-auto font-accent text-base font-bold text-chocolate-900">
              {(item.price * item.quantity).toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;