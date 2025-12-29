import React from 'react';
import ProductCard from './ProductCard';
import productsData from '../../data/products.json';

const ProductList = ({ category, limit }) => {
  
  // 1. Filtrage par catégorie (Si 'category' est défini)
  const filteredProducts = category 
    ? productsData.filter(product => product.category === category)
    : productsData;

  // 2. Limitation du nombre de produits (Si 'limit' est défini, ex: limit={4})
  const displayProducts = limit 
    ? filteredProducts.slice(0, limit) 
    : filteredProducts;

  // 3. Affichage
  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
        Aucun produit trouvé dans cette catégorie.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {displayProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;