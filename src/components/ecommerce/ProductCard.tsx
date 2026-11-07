import React, { useState } from 'react';
import { Plus, Check, Eye, Heart } from 'lucide-react';
import { Product } from '../../types/ecommerce';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
  isWishlisted = false,
  onToggleWishlist
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist(product);
    }
  };

  return (
    <article
      onClick={() => onSelect(product)}
      className="group cursor-pointer flex flex-col bg-white border border-[#E7E2DA] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md hover:border-stone-400"
    >
      {/* 4:3 Image Container */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F5F2EC]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Ambient Subtle Stock Callout */}
        {product.stockCount <= 5 && (
          <div className="absolute top-3 left-3 bg-[#1C1917]/85 backdrop-blur-xs text-white text-[10px] tracking-widest uppercase px-2 py-0.5 rounded">
            Only {product.stockCount} Made
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlist}
          title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-xs transition-all z-10 ${
            isWishlisted
              ? 'bg-[#1C1917] text-rose-400 shadow-md scale-105'
              : 'bg-white/80 hover:bg-white text-stone-600 hover:text-stone-900 shadow-2xs hover:scale-110'
          }`}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isWishlisted ? 'fill-rose-500 text-rose-500 stroke-none' : 'stroke-[1.75]'
            }`}
          />
        </button>

        {/* Hover Action Bar */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
          <button
            onClick={handleQuickAdd}
            className={`flex-1 py-2 px-3 rounded text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-sm transition-all ${
              justAdded
                ? 'bg-emerald-700 text-white'
                : 'bg-[#1C1917] hover:bg-stone-800 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="p-2 rounded bg-white/90 hover:bg-white text-stone-800 shadow-sm transition-colors"
            title="View Specifications"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Metadata Details */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Category & Designer Note - Unboxed */}
          <div className="flex items-center justify-between text-[11px] tracking-widest uppercase text-stone-500 font-sans mb-1.5">
            <span>{product.category}</span>
            <span>{product.designer.split(',')[0]}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif-luxury text-lg font-semibold text-[#1C1917] group-hover:text-stone-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Material & Tactile Subtitle */}
          <p className="text-xs text-stone-500 mt-1 line-clamp-1 font-sans">
            {product.subtitle}
          </p>
        </div>

        {/* Price & Stock Row */}
        <div className="mt-4 pt-3 border-t border-[#F2EEE9] flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-sans text-base font-semibold text-[#1C1917] tabular-nums">
              ${product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-stone-400 line-through tabular-nums">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          <span className="text-[11px] font-sans text-stone-500 tracking-wide">
            {product.leadTime.includes('In Stock') ? 'In Stock' : 'Studio Edition'}
          </span>
        </div>
      </div>
    </article>
  );
};
