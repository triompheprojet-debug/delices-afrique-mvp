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

export default CategorySection;
