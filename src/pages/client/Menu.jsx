import React, { useState, useEffect } from 'react';
import { Search, UtensilsCrossed, Sparkles } from 'lucide-react';
import ProductCard from '../../components/client/ProductCard'; 
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Tous', 'Gâteaux', 'Tartes', 'Viennoiseries', 'Boissons'];

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

  const filteredProducts = products.filter(product => {
    const matchCategory = activeCategory === 'Tous' || product.category === activeCategory;
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      
      {/* --- EN-TÊTE GOURMAND --- */}
      <div className="bg-brand-brown text-white py-16 px-4 text-center relative overflow-hidden">
        {/* Décorations d'arrière-plan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-beige/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center mb-4">
            <span className="bg-brand-beige/20 text-brand-beige px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <Sparkles size={14} /> Fait Maison
            </span>
          </div>
          <h4 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white">Notre Carte</h4>
          <p className="text-brand-beige text-lg max-w-xl mx-auto italic">
            "Chaque bouchée raconte une histoire de passion et d'authenticité."
          </p>
        </div>
      </div>

      {/* --- BARRE DE FILTRES STICKY --- */}
      <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row gap-6 items-center justify-between">
          
          {/* Catégories */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar justify-start md:justify-center">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-xl whitespace-nowrap transition-all duration-300 text-sm font-bold flex items-center gap-2 ${
                  activeCategory === cat 
                    ? 'bg-brand-brown text-white shadow-lg shadow-brand-brown/20 scale-105' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-brand-beige hover:text-brand-brown'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Recherche */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Envie d'un délice précis ?..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* --- GRILLE DE PRODUITS --- */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-brown"></div>
            <p className="text-brand-brown font-medium animate-pulse">Préparation des délices...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-grow bg-gray-200"></div>
                <h2 className="text-gray-400 font-serif text-xl uppercase tracking-widest flex items-center gap-2">
                    <UtensilsCrossed size={20}/> {activeCategory}
                </h2>
                <div className="h-[1px] flex-grow bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
              {filteredProducts.map(product => (
                <div key={product.id} className="transform hover:-translate-y-2 transition-transform duration-300">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl shadow-inner border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Aucun délice trouvé</h3>
            <p className="text-gray-500 mt-2">Essayez de modifier votre recherche ou changez de catégorie.</p>
            <button 
                onClick={() => {setSearchTerm(''); setActiveCategory('Tous')}}
                className="mt-6 text-brand-brown font-bold hover:underline"
            >
                Voir tout le menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;