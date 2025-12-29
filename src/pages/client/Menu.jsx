import React, { useState } from 'react';
import ProductList from '../../components/client/ProductList';
import productsData from '../../data/products.json'; // Pour extraire les catégories

// On va déterminer les catégories uniques pour les filtres
const allCategories = ['Tout le Menu', ...new Set(productsData.map(p => p.category))];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState('Tout le Menu');

  // La catégorie passée au ProductList
  const categoryToFilter = activeCategory === 'Tout le Menu' ? null : activeCategory;

  return (
    <div className="pt-8 pb-20">
      <div className="container mx-auto px-4">
        
        {/* Titre de la Page */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-brand-brown">
            Notre Carte Complète
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Gâteaux, Tartes, Macarons... Trouvez votre délice du jour.
          </p>
        </div>

        {/* Barres de Filtres par Catégorie */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                px-6 py-2 rounded-full font-semibold transition-all text-sm
                ${activeCategory === category 
                  ? 'bg-brand-brown text-white shadow-md' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-brand-beige/20'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Affichage des produits filtrés */}
        <ProductList category={categoryToFilter} />

        {/* Message de réassurance/incitation à la commande */}
        <div className="mt-16 bg-brand-beige/30 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-serif font-bold text-brand-brown mb-2">
                Prêt(e) à commander ?
            </h3>
            <p className="text-gray-700">
                Ajoutez vos produits au panier. Pas de surprise, paiement simple au retrait ou à la livraison !
            </p>
        </div>
      </div>
    </div>
  );
};

export default Menu;