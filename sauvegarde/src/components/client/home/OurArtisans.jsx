/**
 * ========================================
 * DÉLICES D'AFRIQUE - OurArtisans
 * Section valorisant les artisans fournisseurs
 * ========================================
 */

import React, { useState, useEffect } from 'react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { ChefHat, CheckCircle, Package } from 'lucide-react';
import { SkeletonLoader } from '../../common/LoadingSpinner';

const OurArtisans = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const q = query(
          collection(db, 'suppliers'),
          where('status', '==', 'active'),
          limit(6)
        );

        const snapshot = await getDocs(q);
        const suppliersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Erreur chargement fournisseurs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-cream-50 to-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div 
            className="inline-flex items-center gap-2 bg-chocolate-100 text-chocolate-700 px-4 py-2 rounded-full mb-4"
            style={{ animation: 'fadeInDown 0.6s ease-out' }}
          >
            <ChefHat size={16} />
            <span className="font-heading text-sm font-bold uppercase tracking-wide">
              Nos Créateurs
            </span>
          </div>

          <h2 
            className="font-display text-4xl md:text-5xl font-bold text-chocolate-900 mb-4"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}
          >
            Les <span className="text-gradient-gold">Artisans</span> de l'Excellence
          </h2>

          <p 
            className="font-body text-lg text-chocolate-600 leading-relaxed"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
          >
            Découvrez les talents locaux qui créent nos pâtisseries artisanales.
            Chaque artisan apporte sa touche unique et son savoir-faire authentique.
          </p>
        </div>

        {/* Grid Artisans */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} variant="avatar" />
            ))}
          </div>
        ) : (
          <div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
          >
            {suppliers.map((supplier, index) => (
              <ArtisanCard 
                key={supplier.id} 
                supplier={supplier}
                delay={0.4 + index * 0.1}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <div 
          className="text-center mt-12"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.8s both' }}
        >
          <p className="font-body text-chocolate-600 mb-4">
            Vous êtes artisan pâtissier ?
          </p>
          <button className="font-heading font-semibold text-gold-600 hover:text-gold-700 underline transition-colors">
            Rejoignez notre réseau de créateurs →
          </button>
        </div>
      </div>
    </section>
  );
};

/**
 * Carte artisan
 */
const ArtisanCard = ({ supplier, delay }) => {
  // Générer une couleur de fond aléatoire douce
  const bgColors = [
    'bg-gradient-to-br from-gold-100 to-gold-200',
    'bg-gradient-to-br from-primary-100 to-primary-200',
    'bg-gradient-to-br from-chocolate-100 to-chocolate-200',
    'bg-gradient-to-br from-success-100 to-success-200',
    'bg-gradient-to-br from-cream-200 to-cream-300'
  ];

  const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];

  return (
    <div 
      className="flex flex-col items-center group cursor-pointer"
      style={{ animation: `fadeInUp 0.6s ease-out ${delay}s both` }}
    >
      {/* Avatar/Logo */}
      <div className="relative mb-3">
        <div className={`
          w-24 h-24 rounded-full
          ${randomBg}
          flex items-center justify-center
          shadow-lg
          border-4 border-white
          group-hover:scale-110 transition-transform duration-300
          overflow-hidden
        `}>
          {/* Si pas d'image, afficher initiales */}
          <span className="font-heading text-2xl font-bold text-chocolate-700">
            {supplier.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Badge vérifié */}
        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-success-500 rounded-full flex items-center justify-center border-2 border-white shadow-md">
          <CheckCircle size={14} className="text-white" />
        </div>
      </div>

      {/* Nom */}
      <h4 className="font-heading text-sm font-bold text-chocolate-900 text-center mb-1 px-2 line-clamp-1">
        {supplier.name}
      </h4>

      {/* Spécialité (si disponible) */}
      <p className="font-body text-xs text-chocolate-600 text-center mb-2">
        Artisan Pâtissier
      </p>

      {/* Badge produits */}
      <div className="flex items-center gap-1 bg-chocolate-100 px-2 py-1 rounded-full">
        <Package size={12} className="text-chocolate-600" />
        <span className="font-body text-xs font-medium text-chocolate-700">
          {/* Nombre de produits - à calculer si besoin */}
          Créateur
        </span>
      </div>
    </div>
  );
};

export default OurArtisans;