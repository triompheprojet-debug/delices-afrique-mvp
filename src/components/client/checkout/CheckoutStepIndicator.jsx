import React from 'react';
import { CheckCircle } from 'lucide-react';

const CheckoutStepIndicator = ({ currentStep, totalSteps }) => {
  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {[...Array(totalSteps)].map((_, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
                ${i + 1 < currentStep
                  ? 'bg-purple-600 text-white'
                  : i + 1 === currentStep
                  ? 'bg-purple-600 text-white ring-4 ring-purple-600/30'
                  : 'bg-slate-700 text-slate-400'
                }
              `}
            >
              {i + 1 < currentStep ? <CheckCircle size={20} /> : i + 1}
            </div>
            <span className="text-xs text-slate-500 mt-1">Étape {i + 1}</span>
          </div>
          {i < totalSteps - 1 && (
            <div className="flex-1 h-1 mx-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  i + 1 < currentStep ? 'bg-purple-600 w-full' : 'bg-transparent w-0'
                }`}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default CheckoutStepIndicator;