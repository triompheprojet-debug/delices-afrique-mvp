import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ProductCard';

const FeaturedProductsSection = ({ featuredProducts, setSelectedProduct }) => {
  if (featuredProducts.length === 0) return null;

  // Dupliquer pour l'effet infini
  const extendedProducts = [...featuredProducts, ...featuredProducts, ...featuredProducts];

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-950">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 mb-2 sm:mb-3">
            Nos Créations
          </h2>
          <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
            Découvrez nos pâtisseries d'exception
          </p>
        </div>

        {/* Scroll horizontal infini */}
        <div className="relative overflow-hidden">
          <div className="flex gap-3 sm:gap-4 lg:gap-5 animate-marquee hover:pause-animation">
            {extendedProducts.map((product, index) => (
              <div 
                key={`${product.id}-${index}`} 
                className="flex-shrink-0 w-[200px] xs:w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px]"
              >
                <ProductCard 
                  product={product}
                  onProductClick={setSelectedProduct}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bouton voir tout */}
        <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <Link to="/menu">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-xl lg:rounded-2xl font-bold shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2 text-sm sm:text-base">
              Voir tout le catalogue
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductsSection;