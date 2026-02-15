import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Sparkles } from 'lucide-react';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-50 bg-slate-900/98 backdrop-blur-xl border-b border-slate-800/50 shadow-2xl">
      {/* Barre principale */}
      <div className="flex items-center justify-between px-3 py-3 gap-3">
        
        {/* Zone Catégories avec scroll horizontal amélioré */}
        <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-0.5 scroll-smooth">
          {['Tous', ...categories.filter(c => c.isFeatured).map(c => c.name)].map(cat => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-2 rounded-xl whitespace-nowrap text-xs font-bold transition-all duration-300 flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Boutons d'action - Design moderne */}
        <div className="flex items-center gap-2 flex-shrink-0 pl-3 border-l border-slate-700/50">
          {/* Bouton Recherche */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (showFilters) setShowFilters(false);
            }}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              isSearchOpen || searchTerm
                ? 'bg-gradient-to-br from-pink-600 to-pink-700 text-white shadow-lg shadow-pink-900/40 scale-95'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
            }`}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isSearchOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isSearchOpen ? <X size={18} /> : <Search size={18} />}
            </motion.div>
            {searchTerm && !isSearchOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
            )}
          </button>

          {/* Bouton Filtres */}
          <button
            onClick={() => {
              setShowFilters(!showFilters);
              if (isSearchOpen) setIsSearchOpen(false);
            }}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
              showFilters || activeFiltersCount > 0
                ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-900/40 scale-95'
                : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
            }`}
          >
            <motion.div
              initial={false}
              animate={{ rotate: showFilters ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {showFilters ? <X size={18} /> : <Filter size={18} />}
            </motion.div>
            {activeFiltersCount > 0 && !showFilters && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-gradient-to-br from-pink-500 to-pink-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-slate-900 shadow-lg"
              >
                {activeFiltersCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* Panneau déroulant : RECHERCHE */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-slate-900 border-t border-slate-800/50"
          >
            <div className="p-4">
              <div className="relative group">
                <Search 
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:text-pink-300 transition-colors" 
                  size={18} 
                />
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Rechercher une pâtisserie..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border-2 border-slate-700/50 rounded-xl focus:outline-none focus:border-pink-500/50 focus:bg-slate-800 text-slate-100 placeholder-slate-500 text-sm transition-all"
                />
                {searchTerm && (
                  <motion.button
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-pink-400 transition-colors"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </div>
              {searchTerm && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-xs text-slate-500 flex items-center gap-1.5"
                >
                  <Sparkles size={12} className="text-pink-400" />
                  Recherche en cours...
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panneau déroulant : FILTRES AVANCÉS */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden bg-slate-900 border-t border-slate-800/50"
          >
            <div className="p-4 space-y-4">
              {/* Grille des filtres */}
              <div className="grid grid-cols-2 gap-3">
                {/* Créateur */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
                    Créateur
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(e.target.value)}
                      className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-xl px-3 py-3 text-slate-100 text-xs font-medium focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                    >
                      {suppliers.map(sup => (
                        <option key={sup} value={sup}>{sup === 'Tous' ? 'Tous les créateurs' : sup}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Prix */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1 h-3 bg-pink-500 rounded-full"></div>
                    Gamme de prix
                  </label>
                  <div className="relative">
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-xl px-3 py-3 text-slate-100 text-xs font-medium focus:outline-none focus:border-pink-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">Tous les prix</option>
                      <option value="low">&lt; 2000 FCFA</option>
                      <option value="mid">2000 - 5000 FCFA</option>
                      <option value="high">&gt; 5000 FCFA</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Tri (sur toute la largeur) */}
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <div className="w-1 h-3 bg-purple-500 rounded-full"></div>
                    Trier par
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-slate-800/50 border-2 border-slate-700/50 rounded-xl px-3 py-3 text-slate-100 text-xs font-medium focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="default">Pertinence</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                      <option value="name">Nom A-Z</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton Réinitialiser */}
              {activeFiltersCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={resetFilters}
                  className="w-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-slate-300 hover:text-white font-bold flex items-center justify-center gap-2 py-3 rounded-xl text-xs transition-all border border-slate-700/50 shadow-lg"
                >
                  <X size={16} />
                  Réinitialiser les filtres ({activeFiltersCount})
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileFilterBar;