import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, ArrowRight } from 'lucide-react';

const TopAmbassadorsSection = ({ topPartners, showAllPartners }) => {
  if (topPartners.length === 0) return null;

  // Ne dupliquer que si on a 3+ ambassadeurs pour le défilement infini
  // Sinon, afficher en grid statique
  const shouldScroll = topPartners.length >= 3;
  const displayPartners = shouldScroll 
    ? [...topPartners, ...topPartners, ...topPartners] 
    : topPartners;

  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-950 relative overflow-hidden">
      
      {/* Background décoratif subtil */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-purple-500/3 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-amber-500/3 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
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

        {/* Grid statique ou Scroll infini selon le nombre */}
        <div className="relative overflow-hidden">
          <div className={shouldScroll 
            ? "flex gap-3 sm:gap-4 lg:gap-5 animate-marquee hover:pause-animation"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 justify-items-center"
          }>
            {displayPartners.slice(0, showAllPartners ? displayPartners.length : displayPartners.length).map((partner, index) => {
              // Pour le calcul de l'index original (pour les couleurs)
              const originalIndex = shouldScroll ? index % topPartners.length : index;
              
              return (
                <div 
                  key={shouldScroll ? `${partner.id}-${index}` : partner.id || index}
                  className={`${shouldScroll ? 'flex-shrink-0' : ''} w-[160px] sm:w-[200px] lg:w-[220px] relative rounded-xl lg:rounded-2xl p-4 sm:p-5 text-center group ${
                    originalIndex === 0 
                      ? 'bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-500/50 shadow-lg' 
                      : originalIndex === 1
                      ? 'bg-gradient-to-br from-slate-400/20 via-slate-400/10 to-transparent border-2 border-slate-400/50'
                      : originalIndex === 2
                      ? 'bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border-2 border-orange-500/50'
                      : 'bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 hover:border-purple-500/30'
                  }`}
                >
                  {/* Badge position */}
                  <div className={`absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-lg ${
                    originalIndex === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' 
                    : originalIndex === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' 
                    : originalIndex === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' 
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                  }`}>
                    {originalIndex < 3 ? (
                      <Award size={12} className="sm:w-4 sm:h-4" />
                    ) : (
                      `#${originalIndex + 1}`
                    )}
                  </div>

                  {/* Avatar */}
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold mx-auto mb-2 sm:mb-3 mt-1 sm:mt-2 shadow-xl border-2 sm:border-4 ${
                    originalIndex === 0 ? 'border-amber-400/30' : 'border-slate-700/30'
                  }`}>
                    {partner.fullName?.charAt(0) || 'P'}
                  </div>

                  {/* Nom */}
                  <h3 className="font-bold text-xs sm:text-sm text-slate-100 mb-1.5 sm:mb-2 line-clamp-1 px-1">
                    {partner.fullName || 'Ambassadeur'}
                  </h3>
                  
                  {/* Badge niveau */}
                  <div className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 ${
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
                  <div className="space-y-1.5 sm:space-y-2">
                    {/* Gains */}
                    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-2 sm:p-2.5 rounded-lg">
                      <p className="text-[9px] sm:text-[10px] text-slate-400 mb-0.5 sm:mb-1">Gains totaux</p>
                      <p className="font-bold text-sm sm:text-base text-green-400">
                        {partner.totalEarnings ? `${partner.totalEarnings.toLocaleString()} F` : '0 F'}
                      </p>
                    </div>
                    
                    {/* Ventes */}
                    <div className="flex items-center justify-between bg-slate-900/50 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg">
                      <span className="text-[9px] sm:text-[10px] text-slate-400">Ventes</span>
                      <span className="font-bold text-xs sm:text-sm text-slate-200">{partner.totalSales || 0}</span>
                    </div>
                  </div>

                  {/* Effet glow pour le top 3 */}
                  {originalIndex < 3 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 rounded-xl lg:rounded-2xl pointer-events-none"></div>
                  )}
                </div>
              );
            })}
          </div>
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