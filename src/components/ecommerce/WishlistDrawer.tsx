import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { Product } from '../../types/ecommerce';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (productId: string) => void;
  onMoveToBag: (product: Product) => void;
  onAddAllToBag: () => void;
  onSelectProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onMoveToBag,
  onAddAllToBag,
  onSelectProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-2xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E7E2DA] shadow-2xl flex flex-col justify-between animate-fade-in">
          {/* Header */}
          <div className="p-6 border-b border-[#E7E2DA] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span className="font-serif-luxury text-xl font-semibold text-[#1C1917] tracking-wider uppercase">
                Saved Works
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {wishlistProducts.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
              title="Close saved works"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader info note */}
          <div className="bg-[#F5F2EC] px-6 py-2.5 border-b border-[#E7E2DA] text-[11px] text-stone-600 font-sans flex items-center justify-between">
            <span>Synchronized across your devices via Firestore</span>
            <span className="text-stone-400">·</span>
            <span className="text-stone-500 font-medium">Atelier Curation</span>
          </div>

          {/* Wishlist Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 font-sans">
                <div className="w-16 h-16 rounded-full bg-[#F5F2EC] flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-stone-300 stroke-[1.5]" />
                </div>
                <h4 className="font-serif-luxury text-lg font-medium text-[#1C1917]">
                  No saved creations yet
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs leading-relaxed">
                  Click the heart icon on any architectural object to bookmark it for your private collection or interior project.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 rounded bg-[#1C1917] text-white text-xs font-semibold tracking-wider uppercase hover:bg-stone-800 transition-colors shadow-2xs"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-white border border-[#E7E2DA] rounded-lg shadow-2xs hover:border-stone-400 transition-all group"
                >
                  {/* Thumbnail */}
                  <div
                    onClick={() => {
                      onSelectProduct(product);
                      onClose();
                    }}
                    className="w-20 h-20 rounded bg-[#F5F2EC] overflow-hidden shrink-0 cursor-pointer relative"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info & Actions */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-[10px] tracking-widest uppercase text-stone-400 block truncate">
                          {product.category} · {product.designer.split(',')[0]}
                        </span>
                        <button
                          onClick={() => onRemoveFromWishlist(product.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove from saved works"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4
                        onClick={() => {
                          onSelectProduct(product);
                          onClose();
                        }}
                        className="font-serif-luxury text-sm font-semibold text-[#1C1917] hover:text-stone-700 cursor-pointer truncate mt-0.5"
                      >
                        {product.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F2EEE9]">
                      <span className="font-sans text-xs font-semibold text-[#1C1917] tabular-nums">
                        ${product.price.toLocaleString()}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            onSelectProduct(product);
                            onClose();
                          }}
                          className="p-1.5 rounded hover:bg-stone-100 text-stone-600 transition-colors text-xs"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onMoveToBag(product)}
                          className="px-2.5 py-1.5 rounded bg-[#1C1917] hover:bg-stone-800 text-white text-[11px] font-semibold tracking-wider uppercase transition-colors flex items-center gap-1 shadow-2xs"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Batch Action */}
          {wishlistProducts.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E7E2DA] space-y-3">
              <button
                onClick={onAddAllToBag}
                className="w-full py-3.5 px-6 rounded bg-[#1C1917] text-white hover:bg-stone-800 transition-all text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All to Bag ({wishlistProducts.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-stone-400">
                Saved items are permanently preserved in your personal patron portfolio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
