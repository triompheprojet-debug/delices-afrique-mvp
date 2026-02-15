import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useConfig } from '../../context/ConfigContext';
import { useCart } from '../../context/CartContext';

// Import groupé de tous les composants depuis index.js
import {
  CompactProductCard,
  ProductDetailModal,
  CategorySection,
  MobileFilterBar,
  DesktopFilterBar,
  MenuHero,
  EmptyState,
  LoadingState,
  useScrollDirection
} from '../../components/client/menu';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

const Menu = () => {
  const { config } = useConfig();
  const { addToCart, updateQuantity, removeFromCart, cartItems } = useCart();
  const { scrollDirection, isAtTop } = useScrollDirection();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [selectedSupplier, setSelectedSupplier] = useState('Tous');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [showFilters, setShowFilters] = useState(false);

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

  const suppliers = useMemo(() => {
    const uniqueSuppliers = [...new Set(products
      .filter(p => p.supplierName)
      .map(p => p.supplierName))];
    return ['Tous', ...uniqueSuppliers];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => p.status === 'active' && p.inStock);

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeCategory !== 'Tous') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (selectedSupplier !== 'Tous') {
      filtered = filtered.filter(p => p.supplierName === selectedSupplier);
    }

    if (priceRange !== 'all') {
      const ranges = {
        'low': [0, 2000],
        'mid': [2000, 5000],
        'high': [5000, Infinity]
      };
      const [min, max] = ranges[priceRange];
      filtered = filtered.filter(p => p.price >= min && p.price < max);
    }

    switch(sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, searchTerm, activeCategory, selectedSupplier, priceRange, sortBy]);

  const productsByCategory = useMemo(() => {
    const grouped = {};
    (config.categories || []).forEach(cat => {
      const catProducts = filteredProducts.filter(p => p.category === cat.name);
      if (catProducts.length > 0) {
        grouped[cat.name] = catProducts;
      }
    });
    return grouped;
  }, [filteredProducts, config.categories]);

  const activeFiltersCount = [
    activeCategory !== 'Tous',
    selectedSupplier !== 'Tous',
    priceRange !== 'all',
    sortBy !== 'default',
    searchTerm !== ''
  ].filter(Boolean).length;

  const resetFilters = () => {
    setActiveCategory('Tous');
    setSelectedSupplier('Tous');
    setPriceRange('all');
    setSortBy('default');
    setSearchTerm('');
  };

  // Afficher la barre si: en haut OU scroll up
  const showSearchBar = isAtTop || scrollDirection === 'up';

  return (
    <div className="min-h-screen bg-slate-950 pb-24">
      
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            isInCart={cartItems.some(item => item.id === selectedProduct?.id)}
            onUpdateQuantity={updateQuantity}
            cartQuantity={cartItems.find(item => item.id === selectedProduct?.id)?.quantity || 0}
          />
        )}
      </AnimatePresence>

      {/* Hero */}
      <MenuHero />

      {/* Barre filtres mobile intelligente (disparaît au scroll down) */}
      <MobileFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        suppliers={suppliers}
        categories={config.categories || []}
        resetFilters={resetFilters}
        showSearchBar={showSearchBar}
      />

      {/* Barre desktop (toujours visible) */}
      <DesktopFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        selectedSupplier={selectedSupplier}
        setSelectedSupplier={setSelectedSupplier}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        suppliers={suppliers}
        categories={config.categories || []}
        resetFilters={resetFilters}
      />

      {/* Contenu */}
      <div className="py-6">
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {activeCategory === 'Tous' ? (
              <div className="space-y-8">
                {Object.entries(productsByCategory).map(([catName, catProducts]) => (
                  <CategorySection
                    key={catName}
                    category={catName}
                    products={catProducts}
                    onProductClick={setSelectedProduct}
                    cartItems={cartItems}
                    onAddToCart={addToCart}
                    onRemoveFromCart={removeFromCart}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>
            ) : (
              <div className="px-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-slate-100 font-playfair">{activeCategory}</h3>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredProducts.map(product => {
                    const cartItem = cartItems.find(item => item.id === product.id);
                    return (
                      <CompactProductCard
                        key={product.id}
                        product={product}
                        onExpand={setSelectedProduct}
                        isInCart={!!cartItem}
                        onAddToCart={addToCart}
                        onRemoveFromCart={removeFromCart}
                        onUpdateQuantity={updateQuantity}
                        cartQuantity={cartItem?.quantity || 0}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {filteredProducts.length === 0 && (
              <EmptyState onReset={resetFilters} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;
