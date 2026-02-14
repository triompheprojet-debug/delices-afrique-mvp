import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronLeft, ChevronRight, Users, ArrowRight } from 'lucide-react';

const TopAmbassadorsSection = ({ topPartners, showAllPartners, partnersScrollRef, scroll }) => {
  if (topPartners.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-950 relative overflow-hidden">
      
      {/* Background décoratif subtil */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-500/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-amber-500/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center lg:flex lg:items-center lg:justify-between mb-8 sm:mb-10">
          <div className="mb-6 lg:mb-0">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 text-amber-400">
              <Award size={14} className="sm:w-4 sm:h-4" />
              <span>Classement du mois</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 mb-2 sm:mb-3">
              Top Ambassadeurs
            </h2>
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
              Nos meilleurs performers et leurs gains
            </p>
          </div>
          
          {/* Boutons navigation desktop */}
          {topPartners.length > 4 && (
            <div className="hidden lg:flex gap-2">
              <button
                onClick={() => scroll(partnersScrollRef, 'left')}
                className="bg-slate-800/50 hover:bg-slate-700 text-slate-300 p-3 rounded-xl transition-all border border-slate-700/50 hover:border-purple-500/30"
                aria-label="Précédent"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll(partnersScrollRef, 'right')}
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
          {topPartners.length > 4 && (
            <>
              <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
              <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>
            </>
          )}

          <div 
            ref={partnersScrollRef}
            className={`${
              topPartners.length <= 4 
                ? 'grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6' 
                : 'flex gap-4 sm:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar scroll-smooth'
            }`}
          >
            {topPartners.slice(0, showAllPartners ? topPartners.length : 8).map((partner, index) => (
              <div 
                key={partner.id || index}
                className={`${
                  topPartners.length > 4 ? 'flex-shrink-0 w-[180px] xs:w-[200px] sm:w-[220px] lg:w-[240px]' : ''
                } relative rounded-xl lg:rounded-2xl p-5 sm:p-6 text-center snap-center transition-all duration-300 group ${
                  index === 0 
                    ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/50 shadow-lg' 
                    : index === 1
                    ? 'bg-gradient-to-br from-slate-400/20 via-slate-400/10 to-transparent border-2 border-slate-400/50'
                    : index === 2
                    ? 'bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border-2 border-orange-500/50'
                    : 'bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 hover:border-purple-500/30'
                }`}
              >
                {/* Badge position */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-lg ${
                  index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                  : index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' 
                  : index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                  : 'bg-gradient-to-br from-slate-600 to-slate-700'
                }`}>
                  {index < 3 ? (
                    <Award size={14} className="sm:w-4 sm:h-4" />
                  ) : (
                    `#${index + 1}`
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 mt-2 shadow-xl border-4 ${
                  index === 0 ? 'border-amber-400/30' : 'border-slate-700/30'
                } group-hover:scale-105 transition-transform duration-300`}>
                  {partner.fullName?.charAt(0) || 'P'}
                </div>

                {/* Nom */}
                <h3 className="font-bold text-sm sm:text-base text-slate-100 mb-2 line-clamp-1 px-2">
                  {partner.fullName || 'Ambassadeur'}
                </h3>
                
                {/* Badge niveau */}
                <div className={`inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold mb-3 sm:mb-4 ${
                  partner.level === 'Premium' 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : partner.level === 'Actif'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-slate-700/50 text-slate-300 border border-slate-600/30'
                }`}>
                  <Award size={10} className="sm:w-3 sm:h-3" />
                  <span>{partner.level || 'Standard'}</span>
                </div>

                {/* Stats */}
                <div className="space-y-2 sm:space-y-3">
                  {/* Gains */}
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-2.5 sm:p-3 rounded-lg">
                    <p className="text-[10px] sm:text-xs text-slate-400 mb-1">Gains totaux</p>
                    <p className="font-bold text-base sm:text-lg text-green-400">
                      {partner.totalEarnings ? `${partner.totalEarnings.toLocaleString()} F` : '0 F'}
                    </p>
                  </div>
                  
                  {/* Ventes */}
                  <div className="flex items-center justify-between bg-slate-900/50 px-2.5 sm:px-3 py-2 rounded-lg">
                    <span className="text-[10px] sm:text-xs text-slate-400">Ventes</span>
                    <span className="font-bold text-xs sm:text-sm text-slate-200">{partner.totalSales || 0}</span>
                  </div>
                </div>

                {/* Effet glow pour le top 3 */}
                {index < 3 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 rounded-xl lg:rounded-2xl pointer-events-none"></div>
                )}
              </div>
            ))}
          </div>

          {/* Indicateur scroll mobile */}
          {topPartners.length > 4 && (
            <div className="lg:hidden text-center mt-4">
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                <ChevronLeft size={12} />
                <span>Glissez pour voir plus</span>
                <ChevronRight size={12} />
              </p>
            </div>
          )}
        </div>

        {/* CTA devenir ambassadeur */}
        <div className="text-center mt-10 sm:mt-12 lg:mt-14">
          <Link to="/partner/register">
            <button 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-3.5 lg:py-4 rounded-xl lg:rounded-2xl font-bold shadow-lg hover:shadow-purple-500/30 transition-all inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-base group"
            >
              <Users size={18} className="sm:w-5 sm:h-5" />
              <span>Devenir ambassadeur</span>
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform sm:w-5 sm:h-5" />
            </button>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 mt-3 sm:mt-4">
            Rejoignez nos ambassadeurs actifs
          </p>
        </div>
      </div>
    </section>
  );
};

export default TopAmbassadorsSection;
