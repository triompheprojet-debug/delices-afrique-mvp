/**
 * ========================================
 * Délices d'Afrique - CTASection
 * Double appel à l'action final
 * ========================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Sparkles } from 'lucide-react';
import Button, { GoldButton } from '../../common/Button';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background avec pattern africain subtil */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500 via-gold-600 to-primary-600" />
      
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Titre principal */}
        <div 
          className="text-center mb-12"
          style={{ animation: 'fadeInUp 0.8s ease-out' }}
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Prêt à savourer l'excellence ?
          </h2>
          <p className="font-heading text-xl text-white/90 max-w-2xl mx-auto">
            Rejoignez des centaines de gourmands et partenaires qui font confiance à Délices d'Afrique
          </p>
        </div>

        {/* Double CTA */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* CTA Client */}
          <div 
            className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 hover:scale-105 transition-transform duration-300"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
          >
            {/* Icône */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <ShoppingBag size={32} className="text-white" />
            </div>

            {/* Contenu */}
            <h3 className="font-heading text-2xl font-bold text-chocolate-900 mb-3">
              Pour les Gourmands
            </h3>
            <p className="font-body text-chocolate-600 mb-6 leading-relaxed">
              Découvrez nos pâtisseries artisanales et régalez-vous avec des créations authentiques.
            </p>

            {/* Liste bénéfices */}
            <ul className="space-y-2 mb-6">
              <BenefitItem text="Livraison rapide en 2h" />
              <BenefitItem text="Produits frais garantis" />
              <BenefitItem text="Large choix d'artisans" />
            </ul>

            {/* Bouton */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate('/menu')}
              className="shadow-lg"
            >
              Commander maintenant
            </Button>
          </div>

          {/* CTA Partenaire */}
          <div 
            className="bg-gradient-to-br from-white/95 to-gold-50/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border-2 border-gold-400/50 hover:scale-105 transition-transform duration-300 relative overflow-hidden"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}
          >
            {/* Badge "Populaire" */}
            <div className="absolute top-4 right-4 bg-gold-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
              ⚡ Populaire
            </div>

            {/* Icône */}
            <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 rounded-2xl flex items-center justify-center mb-6 shadow-gold">
              <Sparkles size={32} className="text-white" />
            </div>

            {/* Contenu */}
            <h3 className="font-heading text-2xl font-bold text-chocolate-900 mb-3">
              Pour les Entrepreneurs
            </h3>
            <p className="font-body text-chocolate-600 mb-6 leading-relaxed">
              Gagnez de l'argent en partageant nos produits avec votre réseau. Simple et rentable.
            </p>

            {/* Liste bénéfices */}
            <ul className="space-y-2 mb-6">
              <BenefitItem text="Inscription 100% gratuite" gold />
              <BenefitItem text="Commissions attractives" gold />
              <BenefitItem text="Retrait flexible" gold />
            </ul>

            {/* Bouton */}
            <GoldButton
              size="lg"
              fullWidth
              onClick={() => navigate('/partner/register')}
              className="shadow-gold-lg"
            >
              💰 Devenir Partenaire
            </GoldButton>
          </div>
        </div>

        {/* Petite note de confiance */}
        <div 
          className="text-center mt-12"
          style={{ animation: 'fadeInUp 0.8s ease-out 0.5s both' }}
        >
          <p className="font-body text-white/80 text-sm">
            ✓ Paiement sécurisé • ✓ Support 24/7 • ✓ Satisfaction garantie
          </p>
        </div>
      </div>
    </section>
  );
};

/**
 * Item de bénéfice
 */
const BenefitItem = ({ text, gold }) => (
  <li className="flex items-center gap-2 font-body text-sm text-chocolate-700">
    <span className={`${gold ? 'text-gold-600' : 'text-success-600'} shrink-0`}>
      ✓
    </span>
    {text}
  </li>
);

export default CTASection;