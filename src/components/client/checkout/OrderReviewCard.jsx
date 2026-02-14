import React from 'react';
import { User, Truck, Package, MapPin, Calendar, CreditCard, FileText, Edit2 } from 'lucide-react';

const OrderReviewCard = ({ 
  formData, 
  config, 
  onEdit 
}) => {
  return (
    <div className="space-y-6">
      {/* Infos client */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <User size={18} className="text-purple-400" />
            Informations client
          </h3>
          <button
            onClick={onEdit}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            <Edit2 size={14} />
            Modifier
          </button>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Nom</span>
            <span className="text-slate-100 font-medium">{formData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Téléphone</span>
            <span className="text-slate-100 font-medium">{formData.phone}</span>
          </div>
        </div>
      </div>

      {/* Mode récupération */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {formData.method === 'Livraison' ? (
              <Truck size={18} className="text-purple-400" />
            ) : (
              <Package size={18} className="text-purple-400" />
            )}
            {formData.method}
          </h3>
          <button
            onClick={onEdit}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            <Edit2 size={14} />
            Modifier
          </button>
        </div>

        <div className="space-y-2 text-sm">
          {formData.method === 'Livraison' ? (
            <>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-1">Adresse</p>
                  <p className="text-slate-100 font-medium">{formData.address}</p>
                </div>
              </div>
              {formData.deliveryFee > 0 && (
                <div className="flex justify-between pt-2 border-t border-slate-700/30">
                  <span className="text-slate-400">Frais de livraison</span>
                  <span className="text-purple-400 font-bold">
                    {formData.deliveryFee.toLocaleString()} F
                  </span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs mb-1">Lieu</p>
                  <p className="text-slate-100 font-medium">{config.address || 'Boutique principale'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-xs mb-1">Date et heure</p>
                  <p className="text-slate-100 font-medium">
                    {formData.scheduledDate} à {formData.scheduledTime}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Paiement */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CreditCard size={18} className="text-purple-400" />
            Paiement
          </h3>
          <button
            onClick={onEdit}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            <Edit2 size={14} />
            Modifier
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-2xl">{formData.paymentMethod === 'Espèces' ? '💵' : '📱'}</div>
          <div>
            <p className="text-slate-100 font-medium">{formData.paymentMethod}</p>
            <p className="text-xs text-slate-400">
              À la {formData.method === 'Livraison' ? 'livraison' : 'réception'}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {formData.notes && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-100 mb-3 flex items-center gap-2">
            <FileText size={18} className="text-purple-400" />
            Instructions
          </h3>
          <p className="text-sm text-slate-300 italic">"{formData.notes}"</p>
        </div>
      )}
    </div>
  );
};

export default OrderReviewCard;