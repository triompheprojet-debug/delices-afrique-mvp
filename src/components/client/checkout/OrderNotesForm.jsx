import React from 'react';
import { FileText } from 'lucide-react';

const OrderNotesForm = ({ notes, onNotesChange, isMobile = false }) => {
  return (
    <div className="space-y-4">
      {!isMobile && (
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-purple-400" />
          Instructions spéciales
        </h3>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Notes pour la commande (optionnel)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Ex: Sonnez 2 fois, appelez en arrivant, etc."
          rows={4}
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 px-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
        />
        <p className="text-xs text-slate-500 mt-2">
          Ajoutez des informations utiles pour la livraison ou le retrait
        </p>
      </div>
    </div>
  );
};

export default OrderNotesForm;