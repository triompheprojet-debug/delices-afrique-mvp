import React from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SuppliersSection = ({ suppliers, suppliersScrollRef, scroll }) => {
  if (suppliers.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-900 relative overflow-hidden">
      
      {/* Background décoratif subtil */}
      <div className="absolute top-1/2 left-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-purple-500/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center lg:flex lg:items-center lg:justify-between mb-8 sm:mb-10">
          <div className="mb-6 lg:mb-0">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 text-purple-400">
              <CheckCircle size={14} className="sm:w-4 sm:h-4" />
              <span>Artisans vérifiés</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 mb-2 sm:mb-3">
              Nos Créateurs
            </h2>
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
              Des artisans passionnés et talentueux
            </p>
          </div>
          
          {/* Boutons navigation - desktop uniquement, si beaucoup de créateurs */}
          {suppliers.length > 6 && (
            <div className="hidden lg:flex gap-2">
              <button
                onClick={() => scroll(suppliersScrollRef, 'left')}
                className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50 hover:border-purple-500/30"
                aria-label="Précédent"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll(suppliersScrollRef, 'right')}
                className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50 hover:border-purple-500/30"
                aria-label="Suivant"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Grid ou Scroll selon le nombre */}
        <div className="relative">
          {/* Dégradés latéraux sur desktop si scroll */}
          {suppliers.length > 6 && (
            <>
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
            </>
          )}

          <div 
            ref={suppliersScrollRef}
            className={`${
              suppliers.length <= 6 
                ? 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5' 
                : 'flex gap-3 sm:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth'
            }`}
          >
            {suppliers.map((supplier, index) => (
              <div 
                key={supplier.id || index}
                className={`${
                  suppliers.length > 6 ? 'flex-shrink-0 w-[100px] xs:w-[110px] sm:w-[130px]' : ''
                } bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 text-center snap-center hover:bg-slate-800/60 hover:border-purple-500/30 transition-all group cursor-pointer`}
              >
                <div className="relative mx-auto mb-3">
                  {/* Avatar avec dégradé unique */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18 rounded-xl lg:rounded-2xl bg-gradient-to-br ${
                    index % 5 === 0 ? 'from-purple-500 to-purple-600' :
                    index % 5 === 1 ? 'from-blue-500 to-blue-600' :
                    index % 5 === 2 ? 'from-pink-500 to-pink-600' :
                    index % 5 === 3 ? 'from-amber-500 to-amber-600' :
                    'from-green-500 to-green-600'
                  } text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg mx-auto group-hover:scale-105 transition-transform duration-300`}>
                    {supplier.name?.charAt(0) || 'C'}
                  </div>
                  
                  {/* Badge vérifié */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 sm:border-4 border-slate-900 flex items-center justify-center shadow-lg">
                    <CheckCircle size={10} className="text-white sm:w-3 sm:h-3" />
                  </div>
                </div>

                {/* Nom */}
                <h3 className="font-bold text-xs sm:text-sm text-slate-100 mb-1.5 sm:mb-2 line-clamp-2 leading-tight group-hover:text-purple-300 transition-colors">
                  {supplier.name}
                </h3>
                
                {/* Badge vérifié */}
                <div className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 px-2 py-0.5 sm:py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-[9px] sm:text-[10px] text-green-400 font-medium">Vérifié</span>
                </div>
              </div>
            ))}
          </div>

          {/* Indicateur scroll mobile */}
          {suppliers.length > 6 && (
            <div className="lg:hidden text-center mt-4">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <ChevronLeft size={12} />
                <span>Glissez pour voir plus</span>
                <ChevronRight size={12} />
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SuppliersSection;
