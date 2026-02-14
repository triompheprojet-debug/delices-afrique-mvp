import React from 'react';
import { CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentMethodSelector = ({ 
  selectedMethod, 
  onMethodChange, 
  error, 
  deliveryMethod,
  isMobile = false 
}) => {
  const methods = [
    {
      value: 'Espèces',
      emoji: '💵',
      label: 'Espèces',
      description: `À la ${deliveryMethod === 'Livraison' ? 'livraison' : 'réception'}`
    },
    {
      value: 'Mobile Money',
      emoji: '📱',
      label: 'Mobile Money',
      description: `À la ${deliveryMethod === 'Livraison' ? 'livraison' : 'réception'}`
    }
  ];

  return (
    <div className="space-y-4">
      {!isMobile && (
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-purple-400" />
          Mode de paiement
        </h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => {
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
                <div className="text-3xl">{method.emoji}</div>
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

export default PaymentMethodSelector;