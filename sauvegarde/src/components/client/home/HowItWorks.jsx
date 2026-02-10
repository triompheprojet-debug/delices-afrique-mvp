/**
 * ========================================
 * DÉLICES D'AFRIQUE - HowItWorks
 * Processus simple en 3-4 étapes
 * ========================================
 */

import React from 'react';
import { Search, ShoppingCart, Truck, Check } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search size={40} />,
      title: 'Choisissez vos délices',
      description: 'Parcourez notre catalogue de pâtisseries artisanales et sélectionnez vos favoris.',
      color: 'gold'
    },
    {
      icon: <ShoppingCart size={40} />,
      title: 'Commandez en ligne',
      description: 'Ajoutez au panier, personnalisez votre commande et validez en quelques clics.',
      color: 'primary'
    },
    {
      icon: <Truck size={40} />,
      title: 'Livraison ou Retrait',
      description: 'Recevez vos créations fraîches chez vous ou retirez-les directement en boutique.',
      color: 'success'
    },
    {
      icon: <Check size={40} />,
      title: 'Savourez !',
      description: 'Dégustez des pâtisseries fraîches, préparées avec amour par nos artisans.',
      color: 'chocolate'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 
            className="font-display text-4xl md:text-5xl font-bold text-chocolate-900 mb-4"
            style={{ animation: 'fadeInUp 0.6s ease-out' }}
          >
            Simple & <span className="text-gradient-gold">Rapide</span>
          </h2>

          <p 
            className="font-body text-lg text-chocolate-600 leading-relaxed"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}
          >
            Commander vos pâtisseries préférées n'a jamais été aussi facile.
            En quelques clics, régalez-vous !
          </p>
        </div>

        {/* Steps - Desktop (Horizontal) */}
        <div className="hidden md:block relative max-w-6xl mx-auto">
          {/* Ligne de connexion */}
          <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-gold-200 via-primary-200 to-success-200 -z-10" />

          {/* Steps Grid */}
          <div className="grid grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <StepCard 
                key={index}
                {...step}
                number={index + 1}
                delay={0.2 + index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Steps - Mobile (Vertical) */}
        <div className="md:hidden space-y-6 max-w-md mx-auto">
          {steps.map((step, index) => (
            <StepCardMobile
              key={index}
              {...step}
              number={index + 1}
              delay={0.2 + index * 0.1}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Carte étape (Desktop)
 */
const StepCard = ({ icon, title, description, color, number, delay }) => {
  const colors = {
    gold: {
      bg: 'bg-gold-100',
      icon: 'text-gold-600',
      number: 'bg-gold-600'
    },
    primary: {
      bg: 'bg-primary-100',
      icon: 'text-primary-600',
      number: 'bg-primary-600'
    },
    success: {
      bg: 'bg-success-100',
      icon: 'text-success-600',
      number: 'bg-success-600'
    },
    chocolate: {
      bg: 'bg-chocolate-100',
      icon: 'text-chocolate-600',
      number: 'bg-chocolate-600'
    }
  };

  const colorClasses = colors[color];

  return (
    <div 
      className="relative flex flex-col items-center text-center group"
      style={{ animation: `fadeInUp 0.8s ease-out ${delay}s both` }}
    >
      {/* Numéro */}
      <div className={`
        absolute -top-4 left-1/2 -translate-x-1/2
        w-8 h-8 ${colorClasses.number}
        text-white font-accent text-lg font-bold
        rounded-full flex items-center justify-center
        shadow-lg z-10
      `}>
        {number}
      </div>

      {/* Icône */}
      <div className={`
        w-28 h-28 ${colorClasses.bg}
        rounded-2xl flex items-center justify-center
        mb-4 shadow-md
        group-hover:scale-110 transition-transform duration-300
      `}>
        <div className={colorClasses.icon}>
          {icon}
        </div>
      </div>

      {/* Titre */}
      <h3 className="font-heading text-xl font-bold text-chocolate-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="font-body text-sm text-chocolate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

/**
 * Carte étape (Mobile)
 */
const StepCardMobile = ({ icon, title, description, color, number, delay, isLast }) => {
  const colors = {
    gold: {
      bg: 'bg-gold-100',
      icon: 'text-gold-600',
      number: 'bg-gold-600',
      line: 'bg-gold-300'
    },
    primary: {
      bg: 'bg-primary-100',
      icon: 'text-primary-600',
      number: 'bg-primary-600',
      line: 'bg-primary-300'
    },
    success: {
      bg: 'bg-success-100',
      icon: 'text-success-600',
      number: 'bg-success-600',
      line: 'bg-success-300'
    },
    chocolate: {
      bg: 'bg-chocolate-100',
      icon: 'text-chocolate-600',
      number: 'bg-chocolate-600',
      line: 'bg-chocolate-300'
    }
  };

  const colorClasses = colors[color];

  return (
    <div 
      className="relative flex gap-4"
      style={{ animation: `fadeInUp 0.6s ease-out ${delay}s both` }}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center">
        {/* Numéro */}
        <div className={`
          w-12 h-12 ${colorClasses.number}
          text-white font-accent text-xl font-bold
          rounded-full flex items-center justify-center
          shadow-lg shrink-0
        `}>
          {number}
        </div>

        {/* Ligne connectrice */}
        {!isLast && (
          <div className={`w-0.5 flex-1 ${colorClasses.line} mt-2`} />
        )}
      </div>

      {/* Contenu */}
      <div className="flex-1 pb-8">
        {/* Icône + Titre */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`
            w-14 h-14 ${colorClasses.bg}
            rounded-xl flex items-center justify-center
            shadow-sm
          `}>
            <div className={`${colorClasses.icon} scale-75`}>
              {icon}
            </div>
          </div>

          <h3 className="font-heading text-lg font-bold text-chocolate-900">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="font-body text-sm text-chocolate-600 leading-relaxed pl-[68px]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HowItWorks;