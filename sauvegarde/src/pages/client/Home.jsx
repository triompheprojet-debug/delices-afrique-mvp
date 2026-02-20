/**
 * ========================================
 * Délices d'Afrique - Home Page
 * Page d'accueil premium
 * ========================================
 */

import React from 'react';
import HeroSection from '../../components/client/home/HeroSection';
import TrustSection from '../../components/client/home/TrustSection';
import ProductsSignature from '../../components/client/home/ProductsSignature';
import PartnerProgram from '../../components/client/home/PartnerProgram';
import TopPartners from '../../components/client/home/TopPartners';
import OurArtisans from '../../components/client/home/OurArtisans';
import HowItWorks from '../../components/client/home/HowItWorks';
import CTASection from '../../components/client/home/CTASection';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero avec CTA double */}
      <HeroSection />

      {/* Indicateurs de confiance */}
      <TrustSection />

      {/* Produits vedettes */}
      <ProductsSignature />

      {/* Programme Partenaire (SECTION MAJEURE) */}
      <PartnerProgram />

      {/* Top 3 Partenaires */}
      <TopPartners />

      {/* Nos Artisans */}
      <OurArtisans />

      {/* Comment ça marche */}
      <HowItWorks />

      {/* CTA Final Double */}
      <CTASection />
    </div>
  );
};

export default Home;