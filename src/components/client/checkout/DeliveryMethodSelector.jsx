import React from 'react';
import { Truck, Package, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DeliveryMethodSelector = ({ 
  selectedMethod, 
  onMethodChange, 
  error, 
  isOpenNow,
  isMobile = false 
}) => {
  const methods = [
    {
      value: 'Livraison',
      icon: Truck,
      label: 'Livraison',
      description: 'Livraison à votre adresse'
    },
    {
      value: 'Retrait',
      icon: Package,
      label: 'Retrait en boutique',
      description: 'Récupérez votre commande'
    }
  ];

  return (
    <div className="space-y-4">
      {!isMobile && (
        <h3 className="text-lg font-bold text-slate-100 mb-4">
          Mode de récupération
        </h3>
      )}

      {!isOpenNow && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-400 mt-0.5 flex-shrink-0" size={18} />
          <div className="text-sm">
            <p className="text-amber-400 font-medium">Nous sommes actuellement fermés</p>
            <p className="text-slate-400 mt-1">
              Votre commande sera traitée dès notre prochaine ouverture
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.value;

          return (
            <motion.button
              key={method.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onMethodChange(method.value)}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    p-2 rounded-lg
                    ${isSelected ? 'bg-purple-500/20' : 'bg-slate-700/50'}
                  `}
                >
                  <Icon
                    size={24}
                    className={isSelected ? 'text-purple-400' : 'text-slate-400'}
                  />
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-bold mb-1 ${
                      isSelected ? 'text-purple-400' : 'text-slate-200'
                    }`}
                  >
                    {method.label}
                  </h4>
                  <p className="text-sm text-slate-400">{method.description}</p>
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default DeliveryMethodSelector;