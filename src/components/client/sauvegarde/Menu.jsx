import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Sparkles, Filter, X, ChevronDown,
  Heart, ShoppingBag, ChevronRight, ChevronLeft,
  Award, Eye, Plus, Minus, User, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useConfig } from '../../../context/ConfigContext';
import { useCart } from '../../../context/CartContext';

// ============================================
// HOOK POUR DÉTECTER DIRECTION SCROLL
// ============================================

const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsAtTop(currentScrollY < 10);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scroll down
        setScrollDirection('down');
      } else {
        // Scroll up
        setScrollDirection('up');
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return { scrollDirection, isAtTop };
};

// ============================================
// CARTE PRODUIT COMPACT
// ============================================

const CompactProductCard = ({ 
  product, 
  onExpand, 
  isInCart, 
  onAddToCart, 
  onRemoveFromCart,
  onUpdateQuantity, 
  cartQuantity 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleHeartClick = (e) => {
    e.stopPropagation();
    if (isInCart) {
      onRemoveFromCart(product.id);
    } else {
      onAddToCart(product);
    }
  };

  return (
    <motion.div
      layout
      className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[220px]"
    >
      <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-purple-500/50 transition-all">
        
        {/* Image */}
        <div className="relative aspect-square bg-slate-950 overflow-hidden group">
          {product.image ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img 
                src={product.image} 
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={32} className="text-slate-700" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

          {/* Badge créateur */}
          {product.supplierName && (
            <div className="absolute top-2 left-2 bg-purple-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
              <Award size={8} />
              <span className="max-w-[80px] truncate">{product.supplierName}</span>
            </div>
          )}

          {/* Cœur cliquable */}
          <button
            onClick={handleHeartClick}
            className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isInCart 
                ? 'bg-purple-600 shadow-lg shadow-purple-500/50' 
                : 'bg-slate-900/80 backdrop-blur-sm hover:bg-slate-800'
            }`}
          >
            <Heart 
              size={14} 
              className={isInCart ? 'fill-white text-white' : 'text-slate-400'} 
            />
          </button>

          {/* Prix */}
          <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg">
            <p className="text-sm font-bold text-purple-400">
              {product.price.toLocaleString()}
              <span className="text-[10px] text-slate-500 ml-0.5">F</span>
            </p>
          </div>
        </div>

        {/* Infos */}
        <div className="p-2.5">
          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wide">
            {product.category}
          </span>

          <h3 className="text-xs font-bold text-slate-100 mt-1 mb-1 line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-[10px] text-slate-500 line-clamp-2 mb-2">
              {product.description}
            </p>
          )}

          {/* Boutons */}
          <div className="space-y-1.5">
            {!isInCart ? (
              <button
                onClick={() => onAddToCart(product)}
                className="w-full bg-purple-600 text-white py-1.5 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-1"
              >
                <ShoppingBag size={12} />
                Ajouter
              </button>
            ) : (
              <div className="flex items-center justify-between bg-purple-600/20 border border-purple-600 rounded-lg p-1">
                <button
                  onClick={() => onUpdateQuantity(product.id, -1)}
                  className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center hover:bg-purple-700"
                >
                  <Minus size={12} className="text-white" />
                </button>
                <span className="text-xs font-bold text-purple-400 px-2">
                  {cartQuantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.id, 1)}
                  className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center hover:bg-purple-700"
                >
                  <Plus size={12} className="text-white" />
                </button>
              </div>
            )}

            <button
              onClick={() => onExpand(product)}
              className="w-full bg-slate-800 text-slate-300 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-1"
            >
              <Eye size={10} />
              Plus d'infos
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// MODAL DÉTAILS OPTIMISÉE MOBILE
// ============================================

const ProductDetailModal = ({ 
  product, 
  onClose, 
  onAddToCart, 
  onRemoveFromCart,
  isInCart, 
  onUpdateQuantity, 
  cartQuantity 
}) => {
  if (!product) return null;

  const handleHeartClick = () => {
    if (isInCart) {
      onRemoveFromCart(product.id);
      onClose();
    } else {
      onAddToCart(product);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl"
      onClick={onClose}
    >
      {/* Modal compacte mobile */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 bg-slate-900 rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle drag (indicateur visuel) */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
        </div>

        {/* Image compacte */}
        <div className="relative h-[180px] bg-slate-950">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-slate-700" />
            </div>
          )}

          {/* Actions top */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            {/* Badge créateur */}
            {product.supplierName && (
              <div className="bg-purple-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Award size={12} />
                {product.supplierName}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {/* Cœur */}
              <button
                onClick={handleHeartClick}
                className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg ${
                  isInCart 
                    ? 'bg-purple-600 shadow-purple-500/50' 
                    : 'bg-slate-900/80 backdrop-blur-sm'
                }`}
              >
                <Heart 
                  size={16} 
                  className={isInCart ? 'fill-white text-white' : 'text-slate-400'} 
                />
              </button>

              {/* Fermer */}
              <button 
                onClick={onClose}
                className="w-9 h-9 bg-slate-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu compact */}
        <div className="p-4 space-y-3">
          {/* Catégorie */}
          <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
            {product.category}
          </span>
          
          {/* Nom */}
          <h2 className="text-xl font-bold text-slate-100 font-playfair leading-tight">
            {product.name}
          </h2>

          {/* Prix compact */}
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Prix</span>
            <span className="text-2xl font-bold text-purple-400">
              {product.price.toLocaleString()}
              <span className="text-sm text-slate-500 ml-1">F</span>
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-slate-400 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Info créateur compact */}
          {product.supplierName && (
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500 font-medium">Créé par</p>
                <p className="text-sm text-blue-400 font-bold truncate">{product.supplierName}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isInCart ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3.5 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              Ajouter au panier
            </motion.button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-purple-600/20 border-2 border-purple-600 rounded-xl p-2.5">
                <button
                  onClick={() => onUpdateQuantity(product.id, -1)}
                  className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-700"
                >
                  <Minus size={16} className="text-white" strokeWidth={3} />
                </button>
                <div className="text-center">
                  <p className="text-xl font-bold text-purple-400">{cartQuantity}</p>
                  <p className="text-xs text-slate-500">dans le panier</p>
                </div>
                <button
                  onClick={() => onUpdateQuantity(product.id, 1)}
                  className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-700"
                >
                  <Plus size={16} className="text-white" strokeWidth={3} />
                </button>
              </div>
              
              <button
                onClick={onClose}
                className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          )}
        </div>

        {/* Padding bottom safe area */}
        <div className="h-4"></div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// SECTION CATÉGORIE
// ============================================

const CategorySection = ({ 
  category, 
  products, 
  onProductClick, 
  cartItems, 
  onAddToCart,
  onRemoveFromCart, 
  onUpdateQuantity 
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const autoScrollRef = useRef(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [products]);

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;

    const scroll = () => {
      if (!scrollRef.current) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      if (scrollLeft >= scrollWidth - clientWidth) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 1, behavior: 'auto' });
      }
    };

    autoScrollRef.current = setInterval(scroll, 30);

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [autoScroll]);

  const handleMouseEnter = () => setAutoScroll(false);
  const handleMouseLeave = () => setAutoScroll(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-4 px-4">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
        <div className="flex-1">
          <h3 className="text-xl sm:text-2xl font-bold text-slate-100 font-playfair">
            {category}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {products.length} {products.length > 1 ? 'créations' : 'création'}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              canScrollLeft 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              canScrollRight 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseEnter}
          onTouchEnd={handleMouseLeave}
          className="flex gap-3 overflow-x-auto no-scrollbar px-4 py-2 scroll-smooth"
        >
          {products.map(product => {
            const cartItem = cartItems.find(item => item.id === product.id);
            return (
              <CompactProductCard
                key={product.id}
                product={product}
                onExpand={onProductClick}
                isInCart={!!cartItem}
                onAddToCart={onAddToCart}
                onRemoveFromCart={onRemoveFromCart}
                onUpdateQuantity={onUpdateQuantity}
                cartQuantity={cartItem?.quantity || 0}
              />
            );
          })}
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
};

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
      
      <ProductDetailModal 
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
        isInCart={cartItems.some(item => item.id === selectedProduct?.id)}
        onUpdateQuantity={updateQuantity}
        cartQuantity={cartItems.find(item => item.id === selectedProduct?.id)?.quantity || 0}
      />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-950 via-slate-950 to-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 px-4 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full mb-4"
            >
              <Sparkles size={14} className="text-purple-400" />
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Artisanat Premium
              </span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-5xl font-bold text-white mb-3 font-playfair"
            >
              Notre Sélection
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Exclusive
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-sm sm:text-base max-w-md mx-auto"
            >
              Créations uniques des meilleurs artisans
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Barre filtres intelligente (disparaît au scroll down) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: showSearchBar ? 0 : -200 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="md:hidden sticky top-[64px] z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg"
      >
        <div className="px-4 py-3">
          
          {/* Recherche */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-100 placeholder-slate-500 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`w-full px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Filter size={16} />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Filtres avancés */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  
                  <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                  >
                    <option value="Tous">Toutes catégories</option>
                    {(config.categories || []).map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                  >
                    {suppliers.map(sup => (
                      <option key={sup} value={sup}>{sup === 'Tous' ? 'Tous créateurs' : sup}</option>
                    ))}
                  </select>

                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                  >
                    <option value="all">Tous les prix</option>
                    <option value="low">Moins de 2,000 F</option>
                    <option value="mid">2,000 - 5,000 F</option>
                    <option value="high">Plus de 5,000 F</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm"
                  >
                    <option value="default">Par défaut</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Nom A-Z</option>
                  </select>

                  {activeFiltersCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="w-full text-sm text-purple-400 hover:text-purple-300 font-medium py-2"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pills catégories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 pb-1">
            {['Tous', ...(config.categories || []).filter(c => c.isFeatured).map(c => c.name)].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-bold transition-all flex-shrink-0 ${
                  activeCategory === cat
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Barre desktop (toujours visible) */}
      <div className="hidden md:block sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-lg">
        {/* Contenu identique à la version premium précédente */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-slate-100 placeholder-slate-500"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <X size={18} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${
                showFilters || activeFiltersCount > 0 ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
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

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="pt-4 border-t border-slate-800 grid grid-cols-4 gap-4">
                  <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm">
                    <option value="Tous">Toutes catégories</option>
                    {(config.categories || []).map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>

                  <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm">
                    {suppliers.map(sup => <option key={sup} value={sup}>{sup === 'Tous' ? 'Tous créateurs' : sup}</option>)}
                  </select>

                  <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm">
                    <option value="all">Tous les prix</option>
                    <option value="low">Moins de 2,000 F</option>
                    <option value="mid">2,000 - 5,000 F</option>
                    <option value="high">Plus de 5,000 F</option>
                  </select>

                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm">
                    <option value="default">Par défaut</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="name">Nom A-Z</option>
                  </select>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="mt-4 flex justify-end">
                    <button onClick={resetFilters} className="text-sm text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1">
                      <X size={14} />
                      Réinitialiser
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-4 pb-2">
            {['Tous', ...(config.categories || []).filter(c => c.isFeatured).map(c => c.name)].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
                  activeCategory === cat ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 animate-pulse text-sm">Chargement...</p>
          </div>
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 px-4"
              >
                <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter size={28} className="text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Aucun produit trouvé</h3>
                <p className="text-slate-500 text-sm mb-6">Essayez une autre recherche</p>
                <button
                  onClick={resetFilters}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors text-sm"
                >
                  Voir tous les produits
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Menu;