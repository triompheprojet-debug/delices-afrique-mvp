/**
 * ========================================
 * DÉLICES D'AFRIQUE - TrustSection
 * Indicateurs de confiance et statistiques
 * ========================================
 */

import React from 'react';
import { Package, Users, Star, Clock } from 'lucide-react';

const TrustSection = () => {
  const stats = [
    {
      icon: <Package size={32} />,
      value: '500+',
      label: 'Commandes livrées',
      color: 'primary'
    },
    {
      icon: <Users size={32} />,
      value: '50+',
      label: 'Artisans partenaires',
      color: 'gold'
    },
    {
      icon: <Star size={32} />,
      value: '98%',
      label: 'Clients satisfaits',
      color: 'success'
    },
    {
      icon: <Clock size={32} />,
      value: '2h',
      label: 'Livraison moyenne',
      color: 'chocolate'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={index} 
              {...stat} 
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Carte statistique
 */
const StatCard = ({ icon, value, label, color, delay }) => {
  const colors = {
    primary: {
      icon: 'text-primary-600',
      bg: 'bg-primary-50',
      border: 'border-primary-200'
    },
    gold: {
      icon: 'text-gold-600',
      bg: 'bg-gold-50',
      border: 'border-gold-200'
    },
    success: {
      icon: 'text-success-600',
      bg: 'bg-success-50',
      border: 'border-success-200'
    },
    chocolate: {
      icon: 'text-chocolate-600',
      bg: 'bg-chocolate-50',
      border: 'border-chocolate-200'
    }
  };

  const colorClasses = colors[color] || colors.gold;

  return (
    <div 
      className={`
        flex flex-col items-center text-center p-6 rounded-2xl
        border-2 ${colorClasses.border}
        ${colorClasses.bg}
        hover:shadow-lg transition-all duration-300
        group cursor-default
      `}
      style={{ 
        animation: `fadeInUp 0.8s ease-out ${delay}s both` 
      }}
    >
      {/* Icône */}
      <div className={`
        ${colorClasses.icon}
        mb-4
        group-hover:scale-110 transition-transform duration-300
      `}>
        {icon}
      </div>

      {/* Valeur */}
      <p className="font-accent text-4xl md:text-5xl font-bold text-chocolate-900 mb-2">
        {value}
      </p>

      {/* Label */}
      <p className="font-body text-sm text-chocolate-600">
        {label}
      </p>
    </div>
  );
};

export default TrustSection;