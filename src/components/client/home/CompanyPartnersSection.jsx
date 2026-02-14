import React from 'react';

const CompanyPartnersSection = ({ companyPartners }) => {
  return (
    <section className="py-10 sm:py-14 lg:py-16 bg-slate-900 overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Titre centré */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-100 mb-2 sm:mb-3">
            Ils nous font confiance
          </h2>
          <p className="text-slate-400 text-sm sm:text-base lg:text-lg">
            Des entreprises leaders qui collaborent avec nous
          </p>
        </div>

        {/* Container du défilement infini */}
        <div className="relative">
          {/* Dégradés sur les côtés pour l'effet de fondu */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 lg:w-24 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 lg:w-24 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>

          {/* Conteneur de défilement */}
          <div className="overflow-hidden py-4">
            <div className="flex animate-marquee">
              {/* Premier ensemble de logos */}
              {companyPartners.map((company, i) => (
                <div
                  key={`first-${i}`}
                  className="flex-shrink-0 w-[160px] xs:w-[180px] sm:w-[200px] lg:w-[220px] mx-2 sm:mx-3 lg:mx-4 bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-lg sm:rounded-xl p-5 sm:p-6 lg:p-8 flex items-center justify-center hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group"
                >
                  <img 
                    src={`/images/logo/${company.logo}`}
                    alt={company.name}
                    className="w-full h-auto max-h-12 sm:max-h-16 lg:max-h-20 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="text-slate-100 font-bold text-xs sm:text-sm text-center">${company.name}</div>`;
                    }}
                  />
                </div>
              ))}

              {/* Duplication des logos pour l'effet infini */}
              {companyPartners.map((company, i) => (
                <div
                  key={`second-${i}`}
                  className="flex-shrink-0 w-[160px] xs:w-[180px] sm:w-[200px] lg:w-[220px] mx-2 sm:mx-3 lg:mx-4 bg-white/5 backdrop-blur-sm border border-slate-700/30 rounded-lg sm:rounded-xl p-5 sm:p-6 lg:p-8 flex items-center justify-center hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group"
                >
                  <img 
                    src={`/images/logo/${company.logo}`}
                    alt={company.name}
                    className="w-full h-auto max-h-12 sm:max-h-16 lg:max-h-20 object-contain opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ filter: 'brightness(1.2) contrast(1.1)' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="text-slate-100 font-bold text-xs sm:text-sm text-center">${company.name}</div>`;
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Indicateur de défilement mobile */}
          <div className="sm:hidden text-center mt-3">
            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
              <span className="animate-pulse">⟵</span>
              <span>Défilement automatique</span>
              <span className="animate-pulse">⟶</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyPartnersSection;
