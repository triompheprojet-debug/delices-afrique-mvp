/**
 * ========================================
 * DÉLICES D'AFRIQUE - LoadingSpinner
 * Indicateurs de chargement premium
 * ========================================
 */

import React from 'react';

/**
 * Composant LoadingSpinner
 * 
 * @param {string} variant - Variante du spinner ('gold', 'red', 'chocolate', 'white')
 * @param {string} size - Taille ('sm', 'md', 'lg', 'xl')
 * @param {string} text - Texte optionnel sous le spinner
 * @param {boolean} fullScreen - Affichage plein écran avec overlay
 * @param {string} className - Classes CSS additionnelles
 */
const LoadingSpinner = ({ 
  variant = 'gold', 
  size = 'md', 
  text = '', 
  fullScreen = false,
  className = '' 
}) => {
  // Tailles du spinner
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // Variantes de couleurs
  const variants = {
    gold: {
      primary: 'border-gold-500',
      secondary: 'border-gold-200',
      text: 'text-gold-600',
      glow: 'shadow-gold-sm'
    },
    red: {
      primary: 'border-primary-600',
      secondary: 'border-primary-200',
      text: 'text-primary-600',
      glow: 'shadow-red-sm'
    },
    chocolate: {
      primary: 'border-chocolate-600',
      secondary: 'border-chocolate-200',
      text: 'text-chocolate-600',
      glow: ''
    },
    white: {
      primary: 'border-white',
      secondary: 'border-white/30',
      text: 'text-white',
      glow: ''
    }
  };

  const variantClasses = variants[variant] || variants.gold;
  const sizeClass = sizes[size] || sizes.md;

  // Spinner rotatif
  const SpinnerElement = () => (
    <div className="relative inline-flex items-center justify-center">
      {/* Cercle extérieur */}
      <div 
        className={`
          ${sizeClass} 
          border-4 
          ${variantClasses.secondary}
          border-t-transparent
          rounded-full
          animate-spin
          ${variantClasses.glow}
        `}
        style={{
          animationDuration: '1s',
          animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
      
      {/* Cercle intérieur (effet double rotation) */}
      <div 
        className={`
          absolute
          ${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'}
          border-2
          ${variantClasses.primary}
          border-b-transparent
          rounded-full
          animate-spin
        `}
        style={{
          animationDuration: '0.7s',
          animationDirection: 'reverse',
          animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />
    </div>
  );

  // Affichage plein écran
  if (fullScreen) {
    return (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background-overlay backdrop-blur-sm"
        style={{
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div className="flex flex-col items-center gap-4 p-8 bg-background-elevated rounded-2xl shadow-2xl">
          <SpinnerElement />
          {text && (
            <p className={`font-heading text-lg font-medium ${variantClasses.text} animate-pulse`}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Affichage inline
  return (
    <div className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <SpinnerElement />
      {text && (
        <p className={`font-body text-sm font-medium ${variantClasses.text} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

/**
 * Variantes pré-configurées
 */
export const GoldSpinner = (props) => <LoadingSpinner {...props} variant="gold" />;
export const RedSpinner = (props) => <LoadingSpinner {...props} variant="red" />;
export const ChocolateSpinner = (props) => <LoadingSpinner {...props} variant="chocolate" />;
export const WhiteSpinner = (props) => <LoadingSpinner {...props} variant="white" />;

/**
 * Spinner avec points (alternative)
 */
export const DotsSpinner = ({ variant = 'gold', size = 'md', className = '' }) => {
  const variants = {
    gold: 'bg-gold-500',
    red: 'bg-primary-600',
    chocolate: 'bg-chocolate-600',
    white: 'bg-white'
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const dotClass = sizes[size] || sizes.md;
  const colorClass = variants[variant] || variants.gold;

  return (
    <div className={`inline-flex gap-2 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${dotClass} ${colorClass} rounded-full`}
          style={{
            animation: 'bounce 1.4s infinite ease-in-out both',
            animationDelay: `${i * 0.16}s`
          }}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Loader (pour chargement de contenu)
 */
export const SkeletonLoader = ({ 
  variant = 'text', 
  lines = 3, 
  className = '' 
}) => {
  if (variant === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 rounded shimmer"
            style={{ width: `${100 - Math.random() * 20}%` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="h-48 bg-gray-200 rounded-lg shimmer mb-4" />
        <div className="h-6 bg-gray-200 rounded shimmer mb-3" style={{ width: '70%' }} />
        <div className="h-4 bg-gray-200 rounded shimmer mb-2" />
        <div className="h-4 bg-gray-200 rounded shimmer" style={{ width: '85%' }} />
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="w-12 h-12 bg-gray-200 rounded-full shimmer" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded shimmer" style={{ width: '60%' }} />
          <div className="h-3 bg-gray-200 rounded shimmer" style={{ width: '40%' }} />
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSpinner;