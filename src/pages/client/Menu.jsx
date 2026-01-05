import React, { useState, useEffect } from 'react';
import { Search, UtensilsCrossed, Sparkles, Filter } from 'lucide-react';
import ProductCard from '../../components/client/ProductCard'; 
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext'; // 1. Import du Contexte

const Menu = () => {
  const { config } = useConfig(); // 2. Récupération des catégories dynamiques
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Construction de la liste des onglets (Tous + Catégories Config)
  // On utilise un tableau vide par défaut si config.categories n'est pas encore chargé
  const navCategories = ['Tous', ...(config.categories || []).filter(c => c.isFeatured).map(c => c.name)];

  useEffect(() => {
    // On récupère tous les produits
    const q = query(collection(db, "products"), orderBy("category"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Erreur :", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 4. Filtrage Global (Recherche uniquement ici, la catégorie est gérée au rendu)
  const searchResults = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      
      {/* --- EN-TÊTE --- */}
      <div className="bg-brand-brown text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-beige/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <span className="bg-brand-beige/20 text-brand-beige px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 animate-fade-in">
              <Sparkles size={14} /> Fait Maison
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white">Notre Carte</h1>
          <p className="text-brand-beige text-sm md:text-lg max-w-xl mx-auto italic px-4">
            "Chaque bouchée raconte une histoire de passion et d'authenticité."
          </p>
        </div>
      </div>

      {/* --- BARRE DE FILTRES STICKY --- */}
      <div className="sticky top-[64px] z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Navigation Catégories (Scrollable sur mobile) */}
          <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-1">
             <div className="flex gap-2">
                {navCategories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 text-sm font-bold flex items-center gap-2 ${
                      activeCategory === cat 
                        ? 'bg-brand-brown text-white shadow-lg shadow-brand-brown/20 scale-105' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-brand-brown'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>
          </div>

          {/* Recherche */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:bg-white transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* --- CONTENU DU MENU --- */}
      <div className="container mx-auto px-4 py-8 md:py-12 min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-40 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-brown"></div>
            <p className="text-gray-400 font-medium text-sm animate-pulse">Mise en place de la vitrine...</p>
          </div>
        ) : (
          <>
            {/* LOGIQUE D'AFFICHAGE */}
            {activeCategory === 'Tous' ? (
              // --- VUE "TOUS" : GROUPÉE PAR CATÉGORIE ---
              <div className="space-y-16">
                 {/* On parcourt les catégories définies dans la config pour garder l'ordre */}
                 {(config.categories || []).map(cat => {
                    // On filtre les produits qui appartiennent à cette catégorie ET qui correspondent à la recherche
                    const catProducts = searchResults.filter(p => p.category === cat.name);
                    
                    // Si aucun produit dans cette catégorie (après recherche), on n'affiche pas la section
                    if (catProducts.length === 0) return null;

                    return (
                       <div key={cat.id} className="animate-fade-in-up">
                          {/* Titre de Section */}
                          <div className="flex items-center gap-4 mb-6 md:mb-8">
                              <div className="h-8 w-1 bg-brand-brown rounded-full"></div>
                              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">
                                {cat.name}
                              </h2>
                              <div className="h-[1px] flex-grow bg-gray-200"></div>
                              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                {catProducts.length}
                              </span>
                          </div>

                          {/* Grille Produits */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                             {catProducts.map(product => (
                               <div key={product.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                                 <ProductCard product={product} />
                               </div>
                             ))}
                          </div>
                       </div>
                    );
                 })}
                 
                 {/* Gestion du cas où la recherche ne donne rien du tout */}
                 {searchResults.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Aucun produit ne correspond à votre recherche "{searchTerm}".</p>
                    </div>
                 )}
              </div>
            ) : (
              // --- VUE FILTRÉE (UNE SEULE CATÉGORIE) ---
              <div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="h-[1px] flex-grow bg-gray-200"></div>
                    <h2 className="text-gray-400 font-serif text-xl uppercase tracking-widest flex items-center gap-2">
                        <UtensilsCrossed size={20}/> {activeCategory}
                    </h2>
                    <div className="h-[1px] flex-grow bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 animate-fade-in">
                  {searchResults
                    .filter(p => p.category === activeCategory)
                    .map(product => (
                      <div key={product.id} className="transform hover:-translate-y-2 transition-transform duration-300">
                        <ProductCard product={product} />
                      </div>
                  ))}
                </div>
                
                {/* Message Vide Catégorie */}
                {searchResults.filter(p => p.category === activeCategory).length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Filter size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">C'est vide ici !</h3>
                    <p className="text-gray-500 mt-2 text-sm">Aucun produit trouvé dans "{activeCategory}".</p>
                    <button 
                        onClick={() => {setSearchTerm(''); setActiveCategory('Tous')}}
                        className="mt-4 text-brand-brown font-bold text-sm hover:underline"
                    >
                        Retourner au menu complet
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;