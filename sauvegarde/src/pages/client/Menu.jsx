import React, { useState, useEffect } from 'react';
import { Search, UtensilsCrossed, Sparkles, Filter, X } from 'lucide-react';
import ProductCard from '../../components/client/ProductCard'; 
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext';
import { motion, AnimatePresence } from 'framer-motion'; // Pour l'animation de la modale

// --- COMPOSANT MODAL INTERNE ---
const ImageModal = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique sur l'image
      >
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 p-2"
        >
          <X size={32} />
        </button>
        
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
        />
        
        <div className="mt-4 text-center">
            <h3 className="text-2xl font-serif font-bold text-white">{product.name}</h3>
            <p className="text-brand-beige text-lg font-bold">{product.price.toLocaleString()} FCFA</p>
            {product.description && <p className="text-gray-300 mt-2 max-w-2xl mx-auto">{product.description}</p>}
        </div>
      </motion.div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL MENU ---
const Menu = () => {
  const { config } = useConfig();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  
  // État pour le produit sélectionné (Zoom)
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navCategories = ['Tous', ...(config.categories || []).filter(c => c.isFeatured).map(c => c.name)];

  useEffect(() => {
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

  const searchResults = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      
      {/* MODALE D'IMAGE (Affiche si selectedProduct n'est pas null) */}
      <AnimatePresence>
        {selectedProduct && (
          <ImageModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        )}
      </AnimatePresence>

      {/* --- EN-TÊTE --- */}
      <div className="bg-brand-brown text-white py-12 md:py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-beige/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <motion.div className="relative z-10">
          <div className="flex justify-center mb-4">
            <motion.span 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-brand-beige/20 text-brand-beige px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2 animate-fade-in">
              <Sparkles size={14} /> Fait Maison
            </motion.span>
          </div>
          <motion.h4 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-sans-serif font-bold relative z-10 text-white"
          >
            Notre Carte
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}   
            className="text-brand-beige text-sm md:text-lg max-w-xl mx-auto italic px-4">
            "Chaque bouchée raconte une histoire de passion et d'authenticité."
          </motion.p>
        </motion.div>
      </div>

      {/* --- BARRE DE FILTRES STICKY --- */}
      <div className="sticky top-[64px] z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row gap-4 items-center justify-between">
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
            {activeCategory === 'Tous' ? (
              <div className="space-y-16">
                 {(config.categories || []).map(cat => {
                    const catProducts = searchResults.filter(p => p.category === cat.name);
                    if (catProducts.length === 0) return null;

                    return (
                       <div key={cat.id} className="animate-fade-in-up">
                          <div className="flex items-center gap-4 mb-6 md:mb-8">
                              <div className="h-8 w-1 bg-brand-brown rounded-full"></div>
                              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-800">{cat.name}</h2>
                              <div className="h-[1px] flex-grow bg-gray-200"></div>
                              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{catProducts.length}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                             {catProducts.map(product => (
                               <div key={product.id} className="transform hover:-translate-y-1 transition-transform duration-300">
                                 {/* On passe la fonction onClickImage ici */}
                                 <ProductCard 
                                    product={product} 
                                    onClickImage={setSelectedProduct} 
                                 />
                               </div>
                             ))}
                          </div>
                       </div>
                    );
                 })}
                 
                 {searchResults.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Aucun produit ne correspond à votre recherche "{searchTerm}".</p>
                    </div>
                 )}
              </div>
            ) : (
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
                        {/* On passe aussi la fonction ici */}
                        <ProductCard 
                            product={product} 
                            onClickImage={setSelectedProduct} 
                        />
                      </div>
                  ))}
                </div>
                
                {searchResults.filter(p => p.category === activeCategory).length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Filter size={24} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">C'est vide ici !</h3>
                    <p className="text-gray-500 mt-2 text-sm">Aucun produit trouvé dans "{activeCategory}".</p>
                    <button onClick={() => {setSearchTerm(''); setActiveCategory('Tous')}} className="mt-4 text-brand-brown font-bold text-sm hover:underline">
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