/**
 * ========================================
 * Délices d'Afrique - ProductsSignature
 * Produits vedettes en carousel premium
 * ========================================
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import ProductCard from '../ProductCard';
import { SkeletonLoader } from '../../common/LoadingSpinner';
import Button from '../../common/Button';

const ProductsSignature = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignatureProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          where('status', '==', 'active'),
          where('inStock', '==', true),
          orderBy('createdAt', 'desc'),
          limit(6)
        );

        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(productsData);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSignatureProducts();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-cream-50">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-2 rounded-full mb-4"
            style={{ animation: 'fadeInDown 0.6s ease-out' }}
          >
            <Sparkles size={16} />
            <span className="font-heading text-sm font-bold uppercase tracking-wide">
              Nos Créations Signature
            </span>
          </div>

          {/* Titre */}
          <h2 
            className="font-display text-4xl md:text-5xl font-bold text-chocolate-900 mb-4"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.1s both' }}
          >
            Saveurs d'Exception
          </h2>

          {/* Description */}
          <p 
            className="font-body text-lg text-chocolate-600 leading-relaxed"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
          >
            Découvrez nos pâtisseries artisanales, créées avec passion par nos artisans locaux.
            Chaque création est une célébration des saveurs africaines authentiques.
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} variant="card" />
            ))}
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                style={{
                  animation: `fadeInUp 0.6s ease-out ${0.4 + index * 0.1}s both`
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* CTA vers menu complet */}
        <div 
          className="text-center"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.8s both' }}
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/menu')}
            rightIcon={<ArrowRight size={20} />}
          >
            Voir tout le catalogue
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsSignature;