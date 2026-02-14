import React from 'react';
import { User, Phone } from 'lucide-react';

const CustomerInfoForm = ({ formData, errors, onInputChange, isMobile = false }) => {
  return (
    <div className="space-y-4">
      {!isMobile && (
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <User size={18} className="text-purple-400" />
          Informations client
        </h3>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nom complet *
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Votre nom"
            className={`w-full bg-slate-800/50 border ${
              errors.name ? 'border-red-500' : 'border-slate-700'
            } rounded-lg py-3 px-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors`}
          />
        </div>
        {errors.name && (
          <p className="text-red-400 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Numéro de téléphone *
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            placeholder="+242 06 000 00 00"
            className={`w-full bg-slate-800/50 border ${
              errors.phone ? 'border-red-500' : 'border-slate-700'
            } rounded-lg py-3 px-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors`}
          />
        </div>
        {errors.phone && (
          <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
        )}
      </div>
    </div>
  );
};

export default CustomerInfoForm;