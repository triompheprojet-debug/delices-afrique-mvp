import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Award, Zap } from 'lucide-react';

const WhyChooseUsSection = () => {
  const features = [
    { 
      icon: Shield, 
      title: 'Paiement sécurisé', 
      desc: 'Transactions protégées',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      icon: Clock, 
      title: 'Livraison rapide', 
      desc: 'En moyenne 2h',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      icon: Award, 
      title: 'Qualité garantie', 
      desc: 'Ingrédients premium',
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    { 
      icon: Zap, 
      title: 'Support 24/7', 
      desc: 'Équipe disponible',
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-900">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Titre */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 mb-2 sm:mb-3">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
            Une expérience unique du début à la fin
          </p>
        </div>

        {/* Grid 2x2 mobile, 4 colonnes desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 text-center hover:bg-slate-800/60 hover:border-purple-500/30 transition-all group"
            >
              {/* Icône avec dégradé */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-4 sm:mb-5 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} className="text-white sm:w-7 sm:h-7 lg:w-8 lg:h-8" strokeWidth={2} />
              </div>
              
              {/* Titre */}
              <h3 className="font-bold text-sm sm:text-base lg:text-lg text-slate-100 mb-2 sm:mb-3">
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
