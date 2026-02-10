/**
 * ========================================
 * DÉLICES D'AFRIQUE - HeroSection
 * Section hero premium avec impact visuel
 * ========================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, ShieldCheck, Clock, Headphones } from 'lucide-react';
import Button, { GoldButton } from '../../common/Button';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-white">
      
      {/* Pattern background subtil */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B91C1C' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Image hero à droite (Desktop) */}
      <div className="hidden lg:block absolute right-0 top-0 h-full w-1/2">
        <div className="relative h-full w-full">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cream-50 via-cream-50/80 to-transparent z-10" />
          
          {/* Image */}
          <img
            src="/images/hero-pastry.jpg"
            alt="Pâtisseries artisanales"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center' }}
          />
          
          {/* Badge flottant "Artisanal" */}
          <div 
            className="absolute top-12 right-12 z-20 bg-white/95 backdrop-blur-md px-6 py-3 rounded-full shadow-xl border border-gold-200"
            style={{ animation: 'float 3s ease-in-out infinite' }}
          >
            <p className="font-heading text-sm font-bold text-gold-600 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              100% Artisanal
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 lg:px-8 relative z-20">
        <div className="max-w-2xl lg:max-w-xl">
          
          {/* Badge localisation */}
          <div 
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md mb-6 border border-chocolate-200"
            style={{ animation: 'fadeInDown 0.8s ease-out' }}
          >
            <MapPin className="text-primary-600" size={16} />
            <span className="font-body text-sm font-medium text-chocolate-700">
              Pointe-Noire, Congo
            </span>
            <ShieldCheck className="text-success-600" size={16} />
          </div>

          {/* Titre principal */}
          <h1 
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-chocolate-900 leading-tight mb-6"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.2s both' }}
          >
            La Gastronomie Africaine{' '}
            <span className="text-gradient-gold">Réinventée</span>
          </h1>

          {/* Sous-titre */}
          <p 
            className="font-heading text-lg md:text-xl text-chocolate-600 mb-8 leading-relaxed"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.4s both' }}
          >
            Pâtisseries artisanales & saveurs authentiques livrées directement chez vous.
            Commandez en ligne, savourez l'excellence.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 mb-12"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.6s both' }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/menu')}
              rightIcon={<ArrowRight size={20} />}
              className="shadow-lg hover:shadow-xl"
            >
              Découvrir nos créations
            </Button>

            <GoldButton
              size="lg"
              onClick={() => navigate('/partner/register')}
              className="shadow-gold hover:shadow-gold-lg"
            >
              💰 Devenir Partenaire
            </GoldButton>
          </div>

          {/* Badges de confiance */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            style={{ animation: 'fadeInUp 0.8s ease-out 0.8s both' }}
          >
            <TrustBadge 
              icon={<ShieldCheck size={20} />}
              text="Paiement sécurisé"
            />
            <TrustBadge 
              icon={<Clock size={20} />}
              text="Livraison 2h"
            />
            <TrustBadge 
              icon={<Headphones size={20} />}
              text="Support 24/7"
            />
            <TrustBadge 
              icon={<span className="text-xl">✓</span>}
              text="Qualité garantie"
            />
          </div>
        </div>
      </div>

      {/* Image mobile (en bas) */}
      <div className="lg:hidden w-full h-64 mt-12">
        <img
          src="/images/hero-pastry.jpg"
          alt="Pâtisseries artisanales"
          className="w-full h-full object-cover rounded-t-3xl shadow-2xl"
        />
      </div>
    </section>
  );
};

/**
 * Badge de confiance
 */
const TrustBadge = ({ icon, text }) => (
  <div className="flex flex-col items-center gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-chocolate-200 hover:border-gold-300 transition-all group">
    <div className="text-gold-600 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <p className="font-body text-xs font-medium text-chocolate-700 text-center">
      {text}
    </p>
  </div>
);

export default HeroSection;