/**
 * ========================================
 * DÉLICES D'AFRIQUE - Input
 * Champs de saisie stylisés premium
 * ========================================
 */

import React, { useState } from 'react';

/**
 * Composant Input Premium
 * 
 * @param {string} type - Type d'input ('text', 'email', 'password', 'number', 'tel', 'date', 'time')
 * @param {string} label - Label du champ
 * @param {string} placeholder - Placeholder
 * @param {string} value - Valeur
 * @param {function} onChange - Fonction de changement
 * @param {string} error - Message d'erreur
 * @param {string} helperText - Texte d'aide
 * @param {boolean} required - Champ requis
 * @param {boolean} disabled - Champ désactivé
 * @param {ReactNode} leftIcon - Icône à gauche
 * @param {ReactNode} rightIcon - Icône à droite
 * @param {string} variant - Variante de style ('default', 'gold', 'minimal')
 * @param {string} size - Taille ('sm', 'md', 'lg')
 * @param {string} className - Classes CSS additionnelles
 */
const Input = ({ 
  type = 'text',
  label = '',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Tailles
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  // Variantes
  const variants = {
    default: {
      container: '',
      input: `
        bg-white
        border-2 ${error ? 'border-red-400' : isFocused ? 'border-gold-400' : 'border-chocolate-200'}
        focus:border-gold-500
        text-chocolate-900
      `,
      label: 'text-chocolate-700',
      helper: 'text-chocolate-600'
    },
    gold: {
      container: '',
      input: `
        bg-gradient-to-br from-gold-50 to-cream-100
        border-2 ${error ? 'border-red-400' : isFocused ? 'border-gold-500' : 'border-gold-200'}
        focus:border-gold-600
        text-chocolate-900
      `,
      label: 'text-gold-800',
      helper: 'text-gold-700'
    },
    minimal: {
      container: '',
      input: `
        bg-transparent
        border-b-2 ${error ? 'border-red-400' : isFocused ? 'border-chocolate-600' : 'border-chocolate-300'}
        focus:border-chocolate-700
        rounded-none
        text-chocolate-900
      `,
      label: 'text-chocolate-600',
      helper: 'text-chocolate-500'
    }
  };

  const variantClasses = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          className={`
            block mb-2
            font-heading font-medium text-sm
            ${variantClasses.label}
          `}
        >
          {label}
          {required && <span className="text-primary-600 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Icône gauche */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-chocolate-500">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full
            ${sizeClass}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${variantClasses.input}
            rounded-xl
            font-body
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-gold-200
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:text-chocolate-400
          `}
          {...props}
        />

        {/* Icône droite */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-chocolate-500">
            {rightIcon}
          </div>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="mt-2 text-sm text-red-600 font-body flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}

      {/* Texte d'aide */}
      {helperText && !error && (
        <p className={`mt-2 text-sm font-body ${variantClasses.helper}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Textarea Premium
 */
export const Textarea = ({ 
  label = '',
  placeholder = '',
  value = '',
  onChange,
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  rows = 4,
  maxLength = null,
  variant = 'default',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const variants = {
    default: {
      input: `
        bg-white
        border-2 ${error ? 'border-red-400' : isFocused ? 'border-gold-400' : 'border-chocolate-200'}
        focus:border-gold-500
        text-chocolate-900
      `,
      label: 'text-chocolate-700',
      helper: 'text-chocolate-600'
    },
    gold: {
      input: `
        bg-gradient-to-br from-gold-50 to-cream-100
        border-2 ${error ? 'border-red-400' : isFocused ? 'border-gold-500' : 'border-gold-200'}
        focus:border-gold-600
        text-chocolate-900
      `,
      label: 'text-gold-800',
      helper: 'text-gold-700'
    }
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <label 
          className={`
            block mb-2
            font-heading font-medium text-sm
            ${variantClasses.label}
          `}
        >
          {label}
          {required && <span className="text-primary-600 ml-1">*</span>}
        </label>
      )}

      {/* Textarea */}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full
          px-4 py-3
          ${variantClasses.input}
          rounded-xl
          font-body text-base
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-gold-200
          disabled:opacity-50 disabled:cursor-not-allowed
          placeholder:text-chocolate-400
          resize-vertical
        `}
        {...props}
      />

      {/* Compteur de caractères */}
      {maxLength && (
        <div className="mt-1 text-right text-sm text-chocolate-500">
          {value.length} / {maxLength}
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="mt-2 text-sm text-red-600 font-body flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}

      {/* Texte d'aide */}
      {helperText && !error && (
        <p className={`mt-2 text-sm font-body ${variantClasses.helper}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Select Premium
 */
export const Select = ({ 
  label = '',
  value = '',
  onChange,
  options = [],
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  placeholder = 'Sélectionner...',
  variant = 'default',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const variants = {
    default: {
      input: `
        bg-white
        border-2 ${error ? 'border-red-400' : isFocused ? 'border-gold-400' : 'border-chocolate-200'}
        focus:border-gold-500
        text-chocolate-900
      `,
      label: 'text-chocolate-700'
    },
    gold: {
      input: `
        bg-gradient-to-br from-gold-50 to-cream-100
        border-2 ${error ? 'border-red-400' : isFocused ? 'border-gold-500' : 'border-gold-200'}
        focus:border-gold-600
        text-chocolate-900
      `,
      label: 'text-gold-800'
    }
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          className={`
            block mb-2
            font-heading font-medium text-sm
            ${variantClasses.label}
          `}
        >
          {label}
          {required && <span className="text-primary-600 ml-1">*</span>}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          w-full
          px-4 py-3
          ${variantClasses.input}
          rounded-xl
          font-body text-base
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-gold-200
          disabled:opacity-50 disabled:cursor-not-allowed
          appearance-none
          bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e')]
          bg-no-repeat
          bg-[length:1.5em]
          bg-[right_0.5rem_center]
          pr-10
        `}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-2 text-sm text-red-600 font-body flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-2 text-sm font-body text-chocolate-600">
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * Checkbox Premium
 */
export const Checkbox = ({ 
  label = '',
  checked = false,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="
          w-5 h-5
          rounded
          border-2 border-chocolate-300
          text-gold-600
          focus:ring-2 focus:ring-gold-200
          transition-all duration-200
          cursor-pointer
        "
        {...props}
      />
      <span className="font-body text-chocolate-800 select-none">
        {label}
      </span>
    </label>
  );
};

/**
 * Input avec recherche/filtre
 */
export const SearchInput = ({ 
  value = '',
  onChange,
  onClear,
  placeholder = 'Rechercher...',
  className = '',
  ...props
}) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      leftIcon={<span>🔍</span>}
      rightIcon={
        value && onClear && (
          <button
            onClick={onClear}
            className="text-chocolate-500 hover:text-chocolate-700 transition-colors"
          >
            ✕
          </button>
        )
      }
      className={className}
      {...props}
    />
  );
};

export default Input;