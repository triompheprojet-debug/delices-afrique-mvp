import React from 'react';
import { ShoppingBag, Gift, Truck } from 'lucide-react';

/**
 * Composant réutilisable pour afficher le récapitulatif de commande
 * Utilisé dans Cart, Checkout et Confirmation
 */
const OrderSummary = ({ 
  items, 
  subtotal, 
  promo, 
  deliveryFee = 0,
  total,
  showEdit = false,
  onEdit,
  compact = false 
}) => {
  
  if (!items || items.length === 0) return null;

  return (
    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl ${compact ? 'p-4' : 'p-5 sm:p-6'} space-y-4`}>
      
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-bold text-slate-100 flex items-center gap-2`}>
          <ShoppingBag size={compact ? 16 : 18} className="text-purple-400" />
          Récapitulatif
        </h3>
        {showEdit && onEdit && (
          <button
            onClick={onEdit}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Modifier
          </button>
        )}
      </div>

      {/* Liste produits */}
      <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
        {items.map((item, idx) => (
          <div 
            key={idx} 
            className="flex justify-between items-start gap-3 pb-3 border-b border-slate-700/30 last:border-0 last:pb-0"
          >
            <div className="flex-1 min-w-0">
              <p className={`${compact ? 'text-sm' : 'text-base'} font-medium text-slate-200 truncate`}>
                {item.name}
              </p>
              {!compact && item.category && (
                <p className="text-xs text-purple-400/70 mt-0.5">{item.category}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                {item.quantity} × {item.price.toLocaleString()} F
              </p>
            </div>
            <p className={`${compact ? 'text-sm' : 'text-base'} font-bold text-slate-100 whitespace-nowrap`}>
              {(item.quantity * item.price).toLocaleString()} F
            </p>
          </div>
        ))}
      </div>

      {/* Calculs */}
      <div className="space-y-2 pt-3 border-t border-slate-700/50">
        
        {/* Sous-total */}
        <div className="flex justify-between text-sm text-slate-300">
          <span>Sous-total</span>
          <span className="font-medium">{subtotal.toLocaleString()} F</span>
        </div>

        {/* Promo */}
        {promo && promo.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-400">
            <span className="flex items-center gap-1">
              <Gift size={14} />
              Réduction ({promo.code})
            </span>
            <span className="font-bold">-{promo.discountAmount.toLocaleString()} F</span>
          </div>
        )}

        {/* Livraison */}
        {deliveryFee > 0 && (
          <div className="flex justify-between text-sm text-slate-300">
            <span className="flex items-center gap-1">
              <Truck size={14} />
              Livraison
            </span>
            <span className="font-medium">{deliveryFee.toLocaleString()} F</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-700/50">
          <span className="text-base font-bold text-slate-100">Total</span>
          <span className="text-2xl font-bold text-purple-400">
            {total.toLocaleString()}
            <span className="text-sm text-slate-500 ml-1">F</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;