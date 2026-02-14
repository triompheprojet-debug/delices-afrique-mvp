import React from 'react';
import { MapPin } from 'lucide-react';
import LocationPicker from '../LocationPicker';

const DeliveryAddressForm = ({ 
  address, 
  location, 
  deliveryFee, 
  errors, 
  onAddressChange, 
  onLocationChange,
  isMobile = false,
  bakeryLocation
}) => {
  return (
    <div className="space-y-4">
      {!isMobile && (
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-purple-400" />
          Adresse de livraison
        </h3>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Adresse complète *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
          <textarea
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Quartier, rue, numéro de maison..."
            rows={3}
            className={`w-full bg-slate-800/50 border ${
              errors.address ? 'border-red-500' : 'border-slate-700'
            } rounded-lg py-3 px-10 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none`}
          />
        </div>
        {errors.address && (
          <p className="text-red-400 text-sm mt-1">{errors.address}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Position sur la carte *
        </label>
        <LocationPicker
          onLocationSelect={onLocationChange}
          selectedLocation={location}
          bakeryLocation={bakeryLocation}
        />
        {errors.location && (
          <p className="text-red-400 text-sm mt-1">{errors.location}</p>
        )}
      </div>

      {deliveryFee > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">Frais de livraison</span>
            <span className="text-purple-400 font-bold text-lg">
              {deliveryFee.toLocaleString()} F
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddressForm;