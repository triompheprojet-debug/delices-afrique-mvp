import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ChefHat, Award, Clock } from 'lucide-react';

const StatsSection = ({ stats }) => {
  const statsData = [
    { 
      icon: ShoppingBag, 
      value: `${stats.totalOrders}+`, 
      label: 'Commandes', 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/30'
    },
    { 
      icon: ChefHat, 
      value: `${stats.activeSuppliers}+`, 
      label: 'Créateurs', 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/20',
      border: 'border-blue-500/30'
    },
    { 
      icon: Award, 
      value: `${stats.satisfaction}%`, 
      label: 'Satisfaits', 
      color: 'text-green-500', 
      bg: 'bg-green-500/20',
      border: 'border-green-500/30'
    },
    { 
      icon: Clock, 
      value: stats.avgDelivery, 
      label: 'Livraison', 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30'
    }
  ];

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-900">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Grid 2x2 sur mobile, 4 colonnes sur desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {statsData.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`text-center p-4 sm:p-6 lg:p-8 rounded-xl lg:rounded-2xl bg-slate-800/40 border ${stat.border} hover:bg-slate-800/60 transition-all group`}
            >
              {/* Icône */}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${stat.bg} rounded-lg lg:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} className={`${stat.color} sm:w-6 sm:h-6 lg:w-7 lg:h-7`} strokeWidth={2} />
              </div>
              
              {/* Valeur */}
              <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-100 mb-1 sm:mb-2">
                {stat.value}
              </h3>
              
              {/* Label */}
              <p className="text-xs sm:text-sm lg:text-base text-slate-400 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
