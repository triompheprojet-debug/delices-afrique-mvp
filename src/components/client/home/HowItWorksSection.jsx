import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Clock } from 'lucide-react';

const HowItWorksSection = () => {
  return (
    <section className="py-8 sm:py-16 bg-slate-950">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Titre centré sur mobile */}
        <div className="text-center mb-6 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-100 mb-2 sm:mb-4">
            Commander en 3 étapes
          </h2>
          <p className="text-slate-400 text-xs sm:text-base">
            Simple, rapide et sécurisé
          </p>
        </div>

        {/* Grid 3 colonnes SUR TOUTES TAILLES */}
        <div className="grid grid-cols-3 gap-2 sm:gap-10 max-w-5xl mx-auto">
          {[
            { 
              icon: ShoppingBag, 
              title: 'Choisissez', 
              desc: 'Parcourez le catalogue',
              color: 'bg-blue-600',
              step: '1'
            },
            { 
              icon: MapPin, 
              title: 'Commandez', 
              desc: 'Validez l\'adresse',
              color: 'bg-purple-600',
              step: '2'
            },
            { 
              icon: Clock, 
              title: 'Savourez', 
              desc: 'Recevez en 2h',
              color: 'bg-green-600',
              step: '3'
            }
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative text-center"
            >
              {/* Ligne de connexion - desktop uniquement */}
              {i < 2 && (
                <div className="hidden sm:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-slate-700 to-transparent"></div>
              )}

              <div className={`${step.color} w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-5 shadow-xl`}>
                <step.icon size={20} className="text-white sm:w-8 sm:h-8" strokeWidth={2} />
              </div>

              <h3 className="font-serif text-sm sm:text-2xl font-bold text-slate-100 mb-1 sm:mb-3">
                {step.title}
              </h3>
              <p className="text-slate-400 text-[10px] sm:text-base leading-relaxed px-1">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
