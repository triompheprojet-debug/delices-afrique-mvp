import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

const MobileFilterBar = ({
  searchTerm,
  setSearchTerm,
  showFilters,
  setShowFilters,
  activeFiltersCount,
  activeCategory,
  setActiveCategory,
  selectedSupplier,
  setSelectedSupplier,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  suppliers,
  categories,
  resetFilters
}) => {
  // Nouvel état pour gérer l'ouverture du champ de recherche
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 gap-3">
        
        {/* 1. Zone Catégories (Indépendante et scrollable) */}
        <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {['Tous', ...categories.filter(c => c.isFeatured).map(c => c.name)].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 2. Zone Boutons (Recherche & Filtres via Icônes uniquement) */}
        <div className="flex items-center gap-2 flex-shrink-0 border-l border-slate-700/50 pl-3">
          {/* Bouton Recherche */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (showFilters) setShowFilters(false); // Ferme les filtres si on ouvre la recherche
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isSearchOpen || searchTerm
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {isSearchOpen ? <X size={16} /> : <Search size={16} />}
          </button>

          {/* Bouton Filtres */}
          <button
            onClick={() => {
              setShowFilters(!showFilters);
              if (isSearchOpen) setIsSearchOpen(false); // Ferme la recherche si on ouvre les filtres
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative ${
              showFilters || activeFiltersCount > 0
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {showFilters ? <X size={16} /> : <Filter size={16} />}
            {/* Badge de compteur de filtres actifs */}
            {activeFiltersCount > 0 && !showFilters && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-slate-900">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* --- PANNEAU DÉROULANT : RECHERCHE --- */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-900 border-t border-slate-800"
          >
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={16} />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Que recherchez-vous ?" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-slate-100 placeholder-slate-500 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PANNEAU DÉROULANT : FILTRES AVANCÉS --- */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-slate-900 border-t border-slate-800"
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Créateur</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {suppliers.map(sup => (
                      <option key={sup} value={sup}>{sup === 'Tous' ? 'Tous' : sup}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prix</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="all">Tous</option>
                    <option value="low">&lt; 2000 F</option>
                    <option value="mid">2000 - 5000 F</option>
                    <option value="high">&gt; 5000 F</option>
                  </select>
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="default">Pertinence</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="w-full mt-2 bg-slate-800/80 text-slate-300 hover:text-white font-medium flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs transition-colors border border-slate-700"
                >
                  <X size={14} />
                  Réinitialiser les filtres ({activeFiltersCount})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileFilterBar;