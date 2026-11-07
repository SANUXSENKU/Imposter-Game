import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem } from '../../types/ecommerce';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

const FREE_SHIPPING_THRESHOLD = 500;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
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
              <span className="font-serif-luxury text-xl font-semibold text-[#1C1917] tracking-wider uppercase">
                Shopping Bag
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
              title="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#F5F2EC] px-6 py-3 border-b border-[#E7E2DA] text-xs font-sans">
            {remainingForFreeShipping > 0 ? (
              <p className="text-stone-700">
                Add <span className="font-semibold text-[#1C1917]">${remainingForFreeShipping.toLocaleString()}</span> more for <span className="font-medium text-amber-900">Complimentary White-Glove Delivery</span>
              </p>
            ) : (
              <p className="text-emerald-800 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>You unlocked Complimentary White-Glove Continental Delivery</span>
              </p>
            )}
            <div className="w-full bg-[#E5DFD6] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#1C1917] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 font-sans">
                <div className="w-16 h-16 rounded-full bg-[#F5F2EC] flex items-center justify-center mb-4">
                  <X className="w-6 h-6 text-stone-400" />
                </div>
                <h4 className="font-serif-luxury text-lg font-medium text-[#1C1917]">Your bag is currently empty</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Explore our curated architectural furniture and tactile objects.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 rounded bg-[#1C1917] text-white text-xs font-semibold tracking-wider uppercase hover:bg-stone-800 transition-colors"
                >
                  Browse Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedFinish}`}
                  className="flex gap-4 p-3 bg-white border border-[#E7E2DA] rounded-lg shadow-2xs"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded bg-[#F5F2EC] shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif-luxury text-sm font-semibold text-[#1C1917] line-clamp-1">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                        {item.selectedFinish || 'Standard'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[#F2EEE9]">
                      <div className="flex items-center border border-[#E7E2DA] rounded bg-[#FAF8F5]">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-semibold tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 text-stone-500 hover:text-stone-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-sans text-xs font-semibold text-[#1C1917] tabular-nums">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-white border-t border-[#E7E2DA] space-y-4">
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900 tabular-nums">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>White-Glove Shipping</span>
                  <span className="tabular-nums">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                      <span className="text-emerald-700 font-semibold uppercase text-[10px]">Complimentary</span>
                    ) : (
                      '$45'
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Taxes & Duties</span>
                  <span className="text-stone-500 text-[11px]">Calculated at checkout</span>
                </div>
                <div className="pt-2 border-t border-[#E7E2DA] flex justify-between text-sm font-semibold text-[#1C1917]">
                  <span>Estimated Total</span>
                  <span className="tabular-nums font-bold">
                    ${(subtotal + (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 45)).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-6 rounded bg-[#1C1917] text-white hover:bg-stone-800 transition-all text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                <span>Encrypted 256-bit luxury checkout · 30-day return policy</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
