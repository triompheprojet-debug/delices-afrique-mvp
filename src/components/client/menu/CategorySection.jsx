import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CompactProductCard from './CompactProductCard';

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
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative mb-8 sm:mb-12">
      {/* Header Section - Design amélioré */}
      <div className="relative px-4 sm:px-6 mb-5 sm:mb-6">
        <div className="flex items-center justify-between gap-4">
          {/* Titre avec accent visuel */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative">
              {/* Barre décorative avec gradient */}
              <div className="w-1 sm:w-1.5 h-10 sm:h-12 bg-gradient-to-b from-purple-500 via-purple-600 to-pink-600 rounded-full shadow-lg shadow-purple-500/30"></div>
              <div className="absolute -inset-1 bg-purple-500/20 rounded-full blur-sm"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-serif leading-tight mb-1 truncate">
                {category}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-slate-400 font-medium">
                  {products.length} {products.length > 1 ? 'créations' : 'création'}
                </span>
                <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                <span className="text-xs sm:text-sm text-purple-400 font-semibold">
                  Disponible maintenant
                </span>
              </div>
            </div>
          </div>

          {/* Boutons de navigation - Design moderne */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                canScrollLeft 
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-105' 
                  : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={20} className={canScrollLeft ? 'group-hover:-translate-x-0.5 transition-transform' : ''} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                canScrollRight 
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-900/30 hover:shadow-purple-900/50 hover:scale-105' 
                  : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
              }`}
            >
              <ChevronRight size={20} className={canScrollRight ? 'group-hover:translate-x-0.5 transition-transform' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Conteneur de scroll avec gradients améliorés */}
      <div className="relative">
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleMouseEnter}
          onTouchEnd={handleMouseLeave}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-6 py-3 scroll-smooth"
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

        {/* Gradients de fade sur les côtés - Améliorés */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-10"></div>
      </div>

      {/* Ligne décorative en bas */}
      <div className="mt-6 sm:mt-8 mx-4 sm:mx-6">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
      </div>
    </div>
  );
};

export default CategorySection;