import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

const DesktopFilterBar = ({
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
  return (
    <div className="hidden md:block sticky top-[65px] z-30 bg-slate-900 backdrop-blur-xl border-b border-slate-800 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        {/* Ligne principale: Recherche + Catégories + Bouton Filtres */}
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="w-72 relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-100 placeholder-slate-500 text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Catégories scrollables */}
          <div className="flex-1 overflow-x-auto no-scrollbar">
            <div className="flex gap-2">
              {['Tous', ...categories.filter(c => c.isFeatured).map(c => c.name)].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all flex-shrink-0 ${
                    activeCategory === cat 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton Filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 flex-shrink-0 ${
              showFilters || activeFiltersCount > 0 ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Filter size={18} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Panneau de filtres avancés (dépliable) */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-slate-800 mt-3 grid grid-cols-4 gap-3">
                <select 
                  value={activeCategory} 
                  onChange={(e) => setActiveCategory(e.target.value)} 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="Tous">Toutes catégories</option>
                  {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>

                <select 
                  value={selectedSupplier} 
                  onChange={(e) => setSelectedSupplier(e.target.value)} 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  {suppliers.map(sup => <option key={sup} value={sup}>{sup === 'Tous' ? 'Tous créateurs' : sup}</option>)}
                </select>

                <select 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(e.target.value)} 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="all">Tous les prix</option>
                  <option value="low">Moins de 2,000 F</option>
                  <option value="mid">2,000 - 5,000 F</option>
                  <option value="high">Plus de 5,000 F</option>
                </select>

                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)} 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="default">Par défaut</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                </select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="mt-3 flex justify-end pb-2">
                  <button 
                    onClick={resetFilters} 
                    className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
                  >
                    <X size={14} />
                    Réinitialiser tous les filtres
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DesktopFilterBar;