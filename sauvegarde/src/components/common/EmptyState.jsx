/**
 * ========================================
 * DÉLICES D'AFRIQUE - EmptyState
 * États vides élégants et informatifs
 * ========================================
 */

import React from 'react';

/**
 * Composant EmptyState
 * 
 * @param {string} icon - Emoji ou icône
 * @param {string} title - Titre principal
 * @param {string} description - Description
 * @param {ReactNode} action - Bouton d'action (optionnel)
 * @param {string} variant - Variante de style ('default', 'gold', 'minimal')
 * @param {string} illustration - Type d'illustration ('box', 'circle', 'none')
 * @param {string} className - Classes CSS additionnelles
 */
const EmptyState = ({ 
  icon = '📦',
  title = 'Aucun élément',
  description = '',
  action = null,
  variant = 'default',
  illustration = 'circle',
  className = '' 
}) => {
  // Variantes de style
  const variants = {
    default: {
      container: 'bg-cream-100 border border-cream-300',
      title: 'text-chocolate-800',
      description: 'text-chocolate-600',
      iconBg: 'bg-cream-200',
      iconText: 'text-chocolate-700'
    },
    gold: {
      container: 'bg-gradient-to-br from-gold-50 to-cream-100 border border-gold-200',
      title: 'text-gold-900',
      description: 'text-gold-700',
      iconBg: 'bg-gold-100',
      iconText: 'text-gold-600'
    },
    minimal: {
      container: 'bg-transparent border-0',
      title: 'text-chocolate-900',
      description: 'text-chocolate-500',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-600'
    }
  };

  const variantClasses = variants[variant] || variants.default;

  return (
    <div 
      className={`
        flex flex-col items-center justify-center 
        text-center p-12 rounded-2xl
        ${variantClasses.container}
        ${className}
      `}
      style={{
        animation: 'fadeInUp 0.5s ease-out'
      }}
    >
      {/* Illustration/Icon */}
      {illustration !== 'none' && (
        <div className="mb-6">
          {illustration === 'circle' && (
            <div 
              className={`
                w-24 h-24 
                ${variantClasses.iconBg}
                rounded-full 
                flex items-center justify-center
                shadow-sm
              `}
              style={{
                animation: 'scaleIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
              }}
            >
              <span className={`text-5xl ${variantClasses.iconText}`}>
                {icon}
              </span>
            </div>
          )}

          {illustration === 'box' && (
            <div 
              className={`
                w-32 h-32
                ${variantClasses.iconBg}
                rounded-2xl
                flex items-center justify-center
                shadow-md
                transform rotate-3
              `}
              style={{
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              <span className={`text-6xl ${variantClasses.iconText}`}>
                {icon}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Titre */}
      <h3 
        className={`
          font-heading text-2xl font-bold mb-3
          ${variantClasses.title}
        `}
        style={{
          animation: 'fadeInUp 0.5s ease-out 0.1s both'
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p 
          className={`
            font-body text-base max-w-md mb-6
            ${variantClasses.description}
          `}
          style={{
            animation: 'fadeInUp 0.5s ease-out 0.2s both'
          }}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div 
          style={{
            animation: 'fadeInUp 0.5s ease-out 0.3s both'
          }}
        >
          {action}
        </div>
      )}
    </div>
  );
};

/**
 * Variantes pré-configurées pour cas d'usage courants
 */

// Panier vide
export const EmptyCart = ({ onBrowse }) => (
  <EmptyState
    icon="🛒"
    title="Votre panier est vide"
    description="Découvrez nos délicieuses pâtisseries et ajoutez vos favoris !"
    variant="gold"
    illustration="circle"
    action={
      onBrowse && (
        <button
          onClick={onBrowse}
          className="
            px-6 py-3 
            bg-gradient-to-r from-gold-500 to-gold-600
            hover:from-gold-600 hover:to-gold-700
            text-white font-heading font-semibold
            rounded-xl shadow-lg hover:shadow-xl
            transition-all duration-300
            transform hover:scale-105
          "
        >
          Découvrir nos produits
        </button>
      )
    }
  />
);

// Aucune commande
export const EmptyOrders = ({ onShop }) => (
  <EmptyState
    icon="📋"
    title="Aucune commande"
    description="Vous n'avez pas encore passé de commande. Commencez dès maintenant !"
    variant="default"
    illustration="box"
    action={
      onShop && (
        <button
          onClick={onShop}
          className="
            px-6 py-3 
            bg-primary-600 hover:bg-primary-700
            text-white font-heading font-semibold
            rounded-xl shadow-lg hover:shadow-xl
            transition-all duration-300
          "
        >
          Commander maintenant
        </button>
      )
    }
  />
);

// Aucun résultat de recherche
export const EmptySearch = ({ searchTerm, onClear }) => (
  <EmptyState
    icon="🔍"
    title="Aucun résultat"
    description={
      searchTerm 
        ? `Aucun produit trouvé pour "${searchTerm}". Essayez avec d'autres mots-clés.`
        : "Lancez une recherche pour trouver vos pâtisseries préférées."
    }
    variant="minimal"
    illustration="circle"
    action={
      onClear && searchTerm && (
        <button
          onClick={onClear}
          className="
            px-4 py-2
            text-chocolate-700 hover:text-chocolate-900
            font-body font-medium
            border-2 border-chocolate-300 hover:border-chocolate-400
            rounded-lg
            transition-all duration-300
          "
        >
          Effacer la recherche
        </button>
      )
    }
  />
);

// Aucune vente (partenaire)
export const EmptySales = () => (
  <EmptyState
    icon="💰"
    title="Aucune vente pour le moment"
    description="Partagez votre code promo pour commencer à gagner des commissions !"
    variant="gold"
    illustration="circle"
  />
);

// Aucun produit (fournisseur)
export const EmptyProducts = ({ onAdd }) => (
  <EmptyState
    icon="🎂"
    title="Aucun produit"
    description="Commencez par ajouter vos premiers produits à votre catalogue."
    variant="default"
    illustration="box"
    action={
      onAdd && (
        <button
          onClick={onAdd}
          className="
            px-6 py-3 
            bg-gradient-to-r from-primary-600 to-primary-700
            hover:from-primary-700 hover:to-primary-800
            text-white font-heading font-semibold
            rounded-xl shadow-lg hover:shadow-xl
            transition-all duration-300
            transform hover:scale-105
          "
        >
          ➕ Ajouter un produit
        </button>
      )
    }
  />
);

// Fournisseur bloqué
export const BlockedSupplier = () => (
  <EmptyState
    icon="🔒"
    title="Compte temporairement bloqué"
    description="Votre compte est bloqué en attente du règlement de fin de journée. Contactez l'administrateur pour plus d'informations."
    variant="minimal"
    illustration="circle"
  />
);

// État de maintenance
export const MaintenanceMode = () => (
  <EmptyState
    icon="🔧"
    title="Maintenance en cours"
    description="Nous effectuons actuellement une maintenance. Nous serons de retour très bientôt !"
    variant="gold"
    illustration="box"
  />
);

// Boutique fermée
export const ShopClosed = ({ openingTime }) => (
  <EmptyState
    icon="🌙"
    title="Boutique fermée"
    description={
      openingTime 
        ? `Nous sommes actuellement fermés. Nous ouvrons à ${openingTime}.`
        : "Nous sommes actuellement fermés. Revenez pendant nos heures d'ouverture."
    }
    variant="default"
    illustration="circle"
  />
);

// Erreur de chargement
export const ErrorState = ({ onRetry, message }) => (
  <EmptyState
    icon="⚠️"
    title="Erreur de chargement"
    description={message || "Une erreur s'est produite. Veuillez réessayer."}
    variant="minimal"
    illustration="circle"
    action={
      onRetry && (
        <button
          onClick={onRetry}
          className="
            px-6 py-3 
            bg-chocolate-600 hover:bg-chocolate-700
            text-white font-heading font-semibold
            rounded-xl shadow-lg hover:shadow-xl
            transition-all duration-300
          "
        >
          🔄 Réessayer
        </button>
      )
    }
  />
);

export default EmptyState;