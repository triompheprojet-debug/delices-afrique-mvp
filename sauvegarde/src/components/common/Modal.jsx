/**
 * ========================================
 * Délices d'Afrique - Modal
 * Modales réutilisables premium
 * ========================================
 */

import React, { useEffect } from 'react';
import Button from './Button';

/**
 * Composant Modal Premium
 * 
 * @param {boolean} isOpen - Modal ouvert/fermé
 * @param {function} onClose - Fonction de fermeture
 * @param {string} title - Titre de la modal
 * @param {ReactNode} children - Contenu de la modal
 * @param {ReactNode} footer - Pied de modal personnalisé
 * @param {string} size - Taille ('sm', 'md', 'lg', 'xl', 'full')
 * @param {boolean} showCloseButton - Afficher bouton fermeture
 * @param {boolean} closeOnOverlay - Fermer au clic sur overlay
 * @param {boolean} closeOnEscape - Fermer avec touche Escape
 * @param {string} variant - Variante de style ('default', 'gold', 'danger')
 * @param {string} className - Classes CSS additionnelles
 */
const Modal = ({ 
  isOpen = false,
  onClose,
  title = '',
  children,
  footer = null,
  size = 'md',
  showCloseButton = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  variant = 'default',
  className = ''
}) => {
  // Tailles
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Variantes
  const variants = {
    default: {
      header: 'border-b border-chocolate-200 bg-cream-50',
      title: 'text-chocolate-900',
      close: 'text-chocolate-600 hover:text-chocolate-900 hover:bg-chocolate-100'
    },
    gold: {
      header: 'border-b border-gold-200 bg-gradient-to-r from-gold-50 to-cream-100',
      title: 'text-gold-900',
      close: 'text-gold-600 hover:text-gold-900 hover:bg-gold-100'
    },
    danger: {
      header: 'border-b border-red-200 bg-red-50',
      title: 'text-red-900',
      close: 'text-red-600 hover:text-red-900 hover:bg-red-100'
    }
  };

  const variantClasses = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fermeture avec touche Escape
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-background-overlay backdrop-blur-sm"
        onClick={closeOnOverlay ? onClose : undefined}
        style={{
          animation: 'fadeIn 0.3s ease-out'
        }}
      />

      {/* Modal Container */}
      <div 
        className={`
          relative
          w-full ${sizeClass}
          bg-background-elevated
          rounded-2xl
          shadow-2xl
          overflow-hidden
          ${className}
        `}
        style={{
          animation: 'scaleIn 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`
            flex items-center justify-between
            px-6 py-4
            ${variantClasses.header}
          `}>
            {/* Titre */}
            {title && (
              <h3 className={`
                font-heading text-xl font-bold
                ${variantClasses.title}
              `}>
                {title}
              </h3>
            )}

            {/* Bouton de fermeture */}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`
                  ml-auto
                  w-8 h-8
                  flex items-center justify-center
                  rounded-full
                  transition-all duration-200
                  ${variantClasses.close}
                `}
                aria-label="Fermer"
              >
                <span className="text-xl">×</span>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-chocolate-200 bg-cream-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal de confirmation
 */
export const ConfirmModal = ({ 
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default',
  loading = false
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      variant={variant}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="font-body text-chocolate-700">{message}</p>
    </Modal>
  );
};

/**
 * Modal de succès
 */
export const SuccessModal = ({ 
  isOpen,
  onClose,
  title = 'Succès !',
  message = 'L\'opération a été effectuée avec succès.',
  buttonText = 'D\'accord'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center py-4">
        {/* Icône succès */}
        <div 
          className="
            w-16 h-16 mx-auto mb-4
            bg-success-100 text-success-600
            rounded-full
            flex items-center justify-center
          "
          style={{
            animation: 'scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s both'
          }}
        >
          <span className="text-3xl">✓</span>
        </div>

        {/* Titre */}
        <h3 className="font-heading text-2xl font-bold text-chocolate-900 mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="font-body text-chocolate-700 mb-6">
          {message}
        </p>

        {/* Bouton */}
        <Button
          variant="success"
          onClick={onClose}
          fullWidth
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

/**
 * Modal d'erreur
 */
export const ErrorModal = ({ 
  isOpen,
  onClose,
  title = 'Erreur',
  message = 'Une erreur s\'est produite.',
  buttonText = 'Fermer'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="danger"
      size="sm"
      showCloseButton={false}
    >
      <div className="text-center py-4">
        {/* Icône erreur */}
        <div 
          className="
            w-16 h-16 mx-auto mb-4
            bg-red-100 text-red-600
            rounded-full
            flex items-center justify-center
          "
          style={{
            animation: 'heartbeat 1s ease-in-out'
          }}
        >
          <span className="text-3xl">⚠</span>
        </div>

        {/* Titre */}
        <h3 className="font-heading text-2xl font-bold text-red-900 mb-3">
          {title}
        </h3>

        {/* Message */}
        <p className="font-body text-chocolate-700 mb-6">
          {message}
        </p>

        {/* Bouton */}
        <Button
          variant="danger"
          onClick={onClose}
          fullWidth
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
};

/**
 * Modal de chargement
 */
export const LoadingModal = ({ 
  isOpen,
  message = 'Chargement en cours...'
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Pas de fermeture possible
      size="sm"
      showCloseButton={false}
      closeOnOverlay={false}
      closeOnEscape={false}
    >
      <div className="text-center py-8">
        {/* Spinner */}
        <div className="mb-4">
          <div className="w-12 h-12 mx-auto border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin" />
        </div>

        {/* Message */}
        <p className="font-body text-chocolate-700 animate-pulse">
          {message}
        </p>
      </div>
    </Modal>
  );
};

/**
 * Drawer (Modal qui vient du côté)
 */
export const Drawer = ({ 
  isOpen,
  onClose,
  title = '',
  children,
  position = 'right', // 'left', 'right', 'top', 'bottom'
  size = 'md',
  className = ''
}) => {
  const positions = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full'
  };

  const sizes = {
    sm: position === 'left' || position === 'right' ? 'w-80' : 'h-64',
    md: position === 'left' || position === 'right' ? 'w-96' : 'h-96',
    lg: position === 'left' || position === 'right' ? 'w-[500px]' : 'h-[500px]'
  };

  const animations = {
    left: 'slideInLeft',
    right: 'slideInRight',
    top: 'slideInDown',
    bottom: 'fadeInUp'
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-background-overlay backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Drawer */}
      <div 
        className={`
          absolute
          ${positions[position]}
          ${sizes[size]}
          bg-background-elevated
          shadow-2xl
          overflow-y-auto
          ${className}
        `}
        style={{
          animation: `${animations[position]} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-chocolate-200 bg-cream-50">
          <h3 className="font-heading text-xl font-bold text-chocolate-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="
              w-8 h-8
              flex items-center justify-center
              rounded-full
              text-chocolate-600 hover:text-chocolate-900
              hover:bg-chocolate-100
              transition-all duration-200
            "
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;