import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../ProductCard';

const FeaturedProductsSection = ({ featuredProducts, setSelectedProduct, productsScrollRef, scroll }) => {
  if (featuredProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-950">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Header */}
        <div className="text-center lg:flex lg:items-center lg:justify-between mb-8 sm:mb-10">
          <div className="mb-6 lg:mb-0">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 mb-2 sm:mb-3">
              Nos Créations
            </h2>
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
              Découvrez nos pâtisseries d'exception
            </p>
          </div>
          
          {/* Boutons navigation - desktop uniquement */}
          <div className="hidden lg:flex gap-2">
            <button
              onClick={() => scroll(productsScrollRef, 'left')}
              className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50 hover:border-purple-500/30"
              aria-label="Précédent"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll(productsScrollRef, 'right')}
              className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50 hover:border-purple-500/30"
              aria-label="Suivant"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carrousel - scroll horizontal avec cards plus compactes */}
        <div className="relative">
          {/* Dégradés latéraux pour effet fade - visible sur desktop */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
          <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

          <div 
            ref={productsScrollRef}
            className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth"
          >
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id || index} 
                className="flex-shrink-0 w-[200px] xs:w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] snap-center"
              >
                <ProductCard 
                  product={product}
                  onProductClick={setSelectedProduct}
                />
              </div>
            ))}
          </div>
          
          {/* Indicateur scroll mobile */}
          <div className="lg:hidden text-center mt-3">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <ChevronLeft size={12} />
              <span>Glissez pour voir plus</span>
              <ChevronRight size={12} />
            </p>
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