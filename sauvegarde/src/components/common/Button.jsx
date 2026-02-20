/**
 * ========================================
 * Délices d'Afrique - Button
 * Boutons premium avec variantes
 * ========================================
 */

import React from 'react';
import { DotsSpinner } from './LoadingSpinner';

/**
 * Composant Button Premium
 * 
 * @param {string} variant - Variante ('primary', 'gold', 'outline', 'ghost', 'danger', 'success')
 * @param {string} size - Taille ('sm', 'md', 'lg', 'xl')
 * @param {boolean} fullWidth - Largeur complète
 * @param {boolean} loading - État de chargement
 * @param {boolean} disabled - Bouton désactivé
 * @param {ReactNode} leftIcon - Icône à gauche
 * @param {ReactNode} rightIcon - Icône à droite
 * @param {string} className - Classes CSS additionnelles
 * @param {function} onClick - Fonction au clic
 * @param {string} type - Type HTML ('button', 'submit', 'reset')
 * @param {ReactNode} children - Contenu du bouton
 */
const Button = ({ 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  onClick,
  type = 'button',
  children,
  ...props
}) => {
  // Tailles
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Variantes
  const variants = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-700
      hover:from-primary-700 hover:to-primary-800
      active:from-primary-800 active:to-primary-900
      text-white shadow-md hover:shadow-lg
      border-0
    `,
    gold: `
      bg-gradient-to-r from-gold-500 to-gold-600
      hover:from-gold-600 hover:to-gold-700
      active:from-gold-700 active:to-gold-800
      text-white shadow-gold-sm hover:shadow-gold
      border-0
    `,
    outline: `
      bg-transparent
      border-2 border-chocolate-400
      hover:border-chocolate-600 hover:bg-chocolate-50
      active:bg-chocolate-100
      text-chocolate-700 hover:text-chocolate-900
      shadow-none
    `,
    ghost: `
      bg-transparent
      hover:bg-chocolate-100
      active:bg-chocolate-200
      text-chocolate-700 hover:text-chocolate-900
      border-0 shadow-none
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-700 hover:to-red-800
      active:from-red-800 active:to-red-900
      text-white shadow-md hover:shadow-lg
      border-0
    `,
    success: `
      bg-gradient-to-r from-success-600 to-success-700
      hover:from-success-700 hover:to-success-800
      active:from-success-800 active:to-success-900
      text-white shadow-md hover:shadow-lg
      border-0
    `,
    white: `
      bg-white
      hover:bg-gray-50
      active:bg-gray-100
      text-chocolate-800 hover:text-chocolate-900
      border border-gray-300 hover:border-gray-400
      shadow-sm hover:shadow-md
    `
  };

  // État désactivé/loading
  const isDisabled = disabled || loading;
  const disabledClasses = isDisabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]';

  return (
    <button
      type={type}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-heading font-semibold
        rounded-xl
        transition-all duration-300
        ${sizes[size] || sizes.md}
        ${variants[variant] || variants.primary}
        ${fullWidth ? 'w-full' : ''}
        ${disabledClasses}
        ${className}
      `}
      {...props}
    >
      {/* Icône gauche */}
      {leftIcon && !loading && (
        <span className="inline-flex">{leftIcon}</span>
      )}

      {/* Spinner de chargement */}
      {loading && (
        <DotsSpinner 
          variant={variant === 'outline' || variant === 'ghost' ? 'chocolate' : 'white'} 
          size="sm" 
        />
      )}

      {/* Contenu */}
      <span>{children}</span>

      {/* Icône droite */}
      {rightIcon && !loading && (
        <span className="inline-flex">{rightIcon}</span>
      )}
    </button>
  );
};

/**
 * Variantes pré-configurées
 */

// Bouton Primary (Rouge)
export const PrimaryButton = (props) => <Button {...props} variant="primary" />;

// Bouton Gold (Premium)
export const GoldButton = (props) => <Button {...props} variant="gold" />;

// Bouton Outline
export const OutlineButton = (props) => <Button {...props} variant="outline" />;

// Bouton Ghost (transparent)
export const GhostButton = (props) => <Button {...props} variant="ghost" />;

// Bouton Danger
export const DangerButton = (props) => <Button {...props} variant="danger" />;

// Bouton Success
export const SuccessButton = (props) => <Button {...props} variant="success" />;

// Bouton White
export const WhiteButton = (props) => <Button {...props} variant="white" />;

/**
 * Groupe de boutons
 */
export const ButtonGroup = ({ children, className = '' }) => (
  <div className={`inline-flex gap-2 ${className}`}>
    {children}
  </div>
);

/**
 * Bouton icône uniquement
 */
export const IconButton = ({ 
  icon, 
  variant = 'ghost', 
  size = 'md', 
  className = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-14 h-14 text-xl'
  };

  return (
    <Button
      variant={variant}
      className={`
        ${sizes[size]}
        p-0
        rounded-full
        ${className}
      `}
      {...props}
    >
      {icon}
    </Button>
  );
};

/**
 * Bouton avec badge
 */
export const BadgeButton = ({ 
  badge, 
  badgeVariant = 'gold',
  children, 
  className = '',
  ...props 
}) => {
  const badgeVariants = {
    gold: 'bg-gold-500 text-white',
    red: 'bg-primary-600 text-white',
    success: 'bg-success-600 text-white'
  };

  return (
    <div className="relative inline-block">
      <Button className={className} {...props}>
        {children}
      </Button>
      {badge && (
        <span 
          className={`
            absolute -top-2 -right-2
            min-w-[20px] h-5
            px-1.5
            flex items-center justify-center
            ${badgeVariants[badgeVariant]}
            text-xs font-bold
            rounded-full
            shadow-md
            animate-pulse
          `}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

/**
 * Bouton lien (style bouton mais comportement lien)
 */
export const LinkButton = ({ 
  href, 
  external = false,
  children,
  className = '',
  ...props 
}) => {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`
        inline-flex items-center justify-center gap-2
        font-heading font-semibold
        px-5 py-2.5 text-base
        rounded-xl
        transition-all duration-300
        cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      {...props}
    >
      {children}
      {external && <span className="text-sm">↗</span>}
    </a>
  );
};

export default Button;