/**
 * ========================================
 * DÉLICES D'AFRIQUE - PartnerProgram
 * Section majeure programme partenaire
 * ========================================
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, ShoppingCart, Coins, TrendingUp, Clock, BarChart3, CreditCard, Headphones, ArrowRight } from 'lucide-react';
import { GoldButton } from '../../common/Button';

const PartnerProgram = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-gold-50 via-cream-100 to-white relative overflow-hidden">
      
      {/* Pattern background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23F59E0B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 bg-gold-600 text-white px-5 py-2.5 rounded-full mb-6 shadow-lg"
            style={{ animation: 'fadeInDown 0.6s ease-out' }}
          >
            <Coins size={18} />
            <span className="font-heading text-sm font-bold uppercase tracking-wide">
              Programme Partenaire
            </span>
          </div>

          {/* Titre principal */}
          <h2 
            className="font-display text-4xl md:text-5xl font-bold text-chocolate-900 mb-6"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}
          >
            Gagnez de l'argent en partageant{' '}
            <span className="text-gradient-gold">vos produits préférés</span>
          </h2>

          {/* Sous-titre */}
          <p 
            className="font-body text-xl text-chocolate-600 leading-relaxed"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
          >
            Rejoignez notre réseau de partenaires et générez des revenus passifs.
            Simple, transparent, et sans investissement initial.
          </p>
        </div>

        {/* Comment ça marche - 3 étapes */}
        <div 
          className="grid md:grid-cols-3 gap-8 mb-16"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
        >
          <StepCard
            number="1"
            icon={<Share2 size={32} />}
            title="Partagez votre code"
            description="Recevez votre code unique et partagez-le avec vos amis, famille, et sur vos réseaux sociaux."
            color="primary"
          />
          <StepCard
            number="2"
            icon={<ShoppingCart size={32} />}
            title="Vos amis commandent"
            description="Ils bénéficient d'une réduction sur leur commande grâce à votre code promo."
            color="gold"
          />
          <StepCard
            number="3"
            icon={<Coins size={32} />}
            title="Vous gagnez"
            description="Vous recevez une commission sur chaque vente générée. Retirez vos gains quand vous voulez."
            color="success"
          />
        </div>

        {/* 3 Niveaux de partenariat */}
        <div className="mb-16">
          <h3 
            className="font-heading text-3xl font-bold text-center text-chocolate-900 mb-10"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
          >
            3 Niveaux pour maximiser vos gains
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            <LevelCard
              level="Standard"
              icon="⭐"
              minSales="0 ventes"
              commission="150 FCFA"
              discount="150 FCFA"
              features={[
                "Commission par vente",
                "Réduction client",
                "Dashboard personnel"
              ]}
              delay={0.5}
            />
            <LevelCard
              level="Actif"
              icon="🔥"
              minSales="30 ventes"
              commission="250 FCFA"
              discount="200 FCFA"
              features={[
                "Commissions augmentées",
                "Réductions plus élevées",
                "Support prioritaire"
              ]}
              highlighted
              delay={0.6}
            />
            <LevelCard
              level="Premium"
              icon="👑"
              minSales="150 ventes"
              commission="300 FCFA"
              discount="200 FCFA"
              features={[
                "Commissions maximales",
                "Statut VIP",
                "Accès anticipé nouveautés"
              ]}
              delay={0.7}
            />
          </div>
        </div>

        {/* Avantages */}
        <div 
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.8s both' }}
        >
          <BenefitCard
            icon={<TrendingUp size={24} />}
            title="Inscription gratuite"
            description="Aucun frais d'entrée"
          />
          <BenefitCard
            icon={<CreditCard size={24} />}
            title="Retrait flexible"
            description="Mobile Money & Espèces"
          />
          <BenefitCard
            icon={<BarChart3 size={24} />}
            title="Suivi temps réel"
            description="Dashboard complet"
          />
          <BenefitCard
            icon={<Headphones size={24} />}
            title="Support dédié"
            description="Assistance 24/7"
          />
        </div>

        {/* CTA Final */}
        <div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-gold-200"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.9s both' }}
        >
          <h3 className="font-heading text-2xl md:text-3xl font-bold text-chocolate-900 mb-4">
            Prêt à commencer ?
          </h3>
          <p className="font-body text-chocolate-600 mb-6 max-w-2xl mx-auto">
            Rejoignez des centaines de partenaires qui génèrent déjà des revenus avec Délices d'Afrique.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GoldButton
              size="lg"
              onClick={() => navigate('/partner/register')}
              className="shadow-gold-lg"
            >
              💰 Créer mon compte partenaire
            </GoldButton>

            <button
              onClick={() => navigate('/partner/rules')}
              className="
                font-heading font-semibold text-chocolate-700
                hover:text-gold-600 transition-colors
                flex items-center justify-center gap-2
              "
            >
              En savoir plus sur le programme
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Carte étape
 */
const StepCard = ({ number, icon, title, description, color }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    gold: 'from-gold-500 to-gold-600',
    success: 'from-success-500 to-success-600'
  };

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-chocolate-200 hover:shadow-xl transition-all group">
      {/* Numéro badge */}
      <div className={`
        absolute -top-4 -left-4 w-12 h-12
        bg-gradient-to-br ${colors[color]}
        text-white font-accent text-2xl font-bold
        rounded-full flex items-center justify-center
        shadow-lg group-hover:scale-110 transition-transform
      `}>
        {number}
      </div>

      {/* Icône */}
      <div className="text-chocolate-600 mb-4 mt-4">
        {icon}
      </div>

      {/* Titre */}
      <h4 className="font-heading text-xl font-bold text-chocolate-900 mb-2">
        {title}
      </h4>

      {/* Description */}
      <p className="font-body text-sm text-chocolate-600 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

/**
 * Carte niveau partenaire
 */
const LevelCard = ({ level, icon, minSales, commission, discount, features, highlighted, delay }) => (
  <div 
    className={`
      rounded-2xl p-6 border-2 transition-all
      ${highlighted 
        ? 'bg-gradient-to-br from-gold-50 to-gold-100 border-gold-400 shadow-gold scale-105' 
        : 'bg-white border-chocolate-200 shadow-lg hover:shadow-xl'
      }
    `}
    style={{ animation: `fadeInUp 0.6s ease-out ${delay}s both` }}
  >
    {/* Badge niveau */}
    {highlighted && (
      <div className="inline-flex items-center gap-2 bg-gold-600 text-white px-3 py-1 rounded-full text-xs font-bold mb-4">
        ⚡ Plus populaire
      </div>
    )}

    {/* Icône + Nom niveau */}
    <div className="flex items-center gap-3 mb-4">
      <span className="text-4xl">{icon}</span>
      <h4 className="font-heading text-2xl font-bold text-chocolate-900">
        {level}
      </h4>
    </div>

    {/* Seuil */}
    <p className="font-body text-sm text-chocolate-600 mb-4">
      Dès <strong>{minSales}</strong>
    </p>

    {/* Avantages financiers */}
    <div className="bg-white/80 rounded-xl p-4 mb-4 border border-chocolate-200">
      <div className="flex justify-between items-center mb-2">
        <span className="font-body text-xs text-chocolate-600">Commission</span>
        <span className="font-accent text-xl font-bold text-gold-600">{commission}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-body text-xs text-chocolate-600">Réduction client</span>
        <span className="font-accent text-xl font-bold text-primary-600">{discount}</span>
      </div>
    </div>

    {/* Features */}
    <ul className="space-y-2">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-2 font-body text-sm text-chocolate-700">
          <span className="text-success-600">✓</span>
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Carte bénéfice
 */
const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-5 shadow-md border border-chocolate-200 hover:shadow-lg transition-all group text-center">
    <div className="text-gold-600 mb-3 flex justify-center group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h5 className="font-heading text-base font-bold text-chocolate-900 mb-1">
      {title}
    </h5>
    <p className="font-body text-xs text-chocolate-600">
      {description}
    </p>
  </div>
);

export default PartnerProgram;