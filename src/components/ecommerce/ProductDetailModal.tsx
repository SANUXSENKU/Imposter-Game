import React, { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Truck, RotateCcw, ArrowRight, Minus, Plus, Heart } from 'lucide-react';
import { Product } from '../../types/ecommerce';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, finish: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist
}) => {
  const [activeImage, setActiveImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedFinish, setSelectedFinish] = useState('Standard Finish');
  const [addedSuccess, setAddedSuccess] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImage(product.image);
      setQuantity(1);
      setAddedSuccess(false);
      // Sensible finish default based on category
      if (product.category === 'Furniture') setSelectedFinish('Natural Oiled Timber');
      else if (product.category === 'Lighting') setSelectedFinish('Satin Brushed Brass');
      else setSelectedFinish('Studio Original');
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!product) return null;

  const galleryImages = [product.image, ...(product.additionalImages || [])];

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedFinish);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-5xl bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-xs transition-colors"
          title="Close specification view"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Presentation & Gallery */}
        <div className="w-full md:w-1/2 bg-[#F3EFEA] flex flex-col justify-between p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#E7E2DA]">
          <div className="relative aspect-4/3 sm:aspect-square w-full rounded-lg overflow-hidden bg-white shadow-2xs">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            {product.stockCount <= 5 && (
              <div className="absolute top-3 left-3 bg-[#1C1917]/85 text-white text-[10px] tracking-widest uppercase px-2.5 py-1 rounded">
                Only {product.stockCount} in Atelier inventory
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {galleryImages.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded border overflow-hidden shrink-0 transition-all ${
                    activeImage === img
                      ? 'border-[#1C1917] ring-1 ring-[#1C1917]'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Provenance Footer Badge */}
          <div className="mt-4 pt-3 border-t border-[#E5DFD6] flex items-center justify-between text-xs text-stone-600 font-sans">
            <span>{product.origin}</span>
            <span>Design: {product.designer}</span>
          </div>
        </div>

        {/* Right Column: Contiguous PDP Purchase Module */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between max-h-[80vh] md:max-h-[90vh]">
          <div>
            {/* Category Breadcrumb */}
            <div className="text-[11px] tracking-widest uppercase font-semibold text-stone-500 font-sans mb-1">
              {product.category} · Collection No. 08
            </div>

            {/* Product Title */}
            <h2 className="font-serif-luxury text-2xl sm:text-3xl font-semibold text-[#1C1917] leading-tight">
              {product.name}
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-stone-600 mt-1 font-sans">
              {product.subtitle}
            </p>

            {/* Pricing Section */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-sans text-2xl font-bold text-[#1C1917] tabular-nums">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-stone-400 line-through text-sm tabular-nums">
                  ${product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-xs text-stone-500 font-sans">VAT included · Duty paid</span>
            </div>

            {/* Lead Time & Dispatch */}
            <div className="mt-2 text-xs text-emerald-800 font-medium font-sans flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></div>
              <span>{product.leadTime}</span>
            </div>

            {/* Description */}
            <div className="mt-5 text-stone-700 text-xs sm:text-sm leading-relaxed border-t border-[#E7E2DA] pt-4 font-sans">
              {product.description}
            </div>

            {/* Finish / Material Variant Selector */}
            <div className="mt-5">
              <label className="block text-xs font-semibold tracking-wider uppercase text-stone-700 mb-2">
                Curated Finish
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {product.category === 'Furniture' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedFinish('Natural Oiled White Oak')}
                      className={`p-2.5 rounded border text-left transition-all ${
                        selectedFinish === 'Natural Oiled White Oak'
                          ? 'border-[#1C1917] bg-[#1C1917] text-white font-medium'
                          : 'border-[#E7E2DA] bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      Natural Oiled Oak
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFinish('Smoked Dark Oak')}
                      className={`p-2.5 rounded border text-left transition-all ${
                        selectedFinish === 'Smoked Dark Oak'
                          ? 'border-[#1C1917] bg-[#1C1917] text-white font-medium'
                          : 'border-[#E7E2DA] bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      Smoked Dark Oak
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedFinish('Atelier Standard')}
                      className={`p-2.5 rounded border text-left transition-all ${
                        selectedFinish === 'Atelier Standard'
                          ? 'border-[#1C1917] bg-[#1C1917] text-white font-medium'
                          : 'border-[#E7E2DA] bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      Atelier Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFinish('Raw Tactile Hone')}
                      className={`p-2.5 rounded border text-left transition-all ${
                        selectedFinish === 'Raw Tactile Hone'
                          ? 'border-[#1C1917] bg-[#1C1917] text-white font-medium'
                          : 'border-[#E7E2DA] bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      Raw Tactile Hone
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Specifications & Dimensions */}
            <div className="mt-5 space-y-2 bg-[#F5F2EC] p-3.5 rounded-lg border border-[#E7E2DA] text-xs font-sans">
              <div className="flex justify-between text-stone-700">
                <span className="text-stone-500">Dimensions</span>
                <span className="font-medium text-right">{product.dimensions}</span>
              </div>
              <div className="flex justify-between text-stone-700">
                <span className="text-stone-500">Key Materials</span>
                <span className="font-medium text-right">{product.materials.join(' · ')}</span>
              </div>
            </div>
          </div>

          {/* Action Row: Quantity + Add to Bag */}
          <div className="mt-6 pt-4 border-t border-[#E7E2DA]">
            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-[#E7E2DA] rounded bg-white p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-semibold tabular-nums text-stone-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Bag CTA */}
              <button
                type="button"
                onClick={handleAdd}
                className={`flex-1 py-3 px-6 rounded text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm ${
                  addedSuccess
                    ? 'bg-emerald-800 text-white'
                    : 'bg-[#1C1917] hover:bg-stone-800 text-white'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Added to Your Bag</span>
                  </>
                ) : (
                  <>
                    <span>Add to Bag · ${(product.price * quantity).toLocaleString()}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Wishlist Bookmark Button */}
              {onToggleWishlist && (
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product)}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  className={`p-3 rounded border transition-all flex items-center justify-center ${
                    isWishlisted
                      ? 'border-[#1C1917] bg-[#1C1917] text-rose-400 shadow-xs'
                      : 'border-[#E7E2DA] bg-white text-stone-600 hover:text-stone-900 hover:border-stone-400'
                  }`}
                  aria-label={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform ${
                      isWishlisted ? 'fill-rose-500 text-rose-500 stroke-none' : 'stroke-[1.75]'
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Reassurance Guarantees */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] text-stone-500 font-sans">
              <div className="flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                <span>10-Yr Warranty</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Truck className="w-3.5 h-3.5 text-stone-700" />
                <span>White Glove</span>
              </div>
              <div className="flex items-center justify-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-stone-700" />
                <span>30-Day In Home</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
