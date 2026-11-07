import React from 'react';
import { X, Package, Clock, CheckCircle2, ChevronRight, Truck } from 'lucide-react';
import { CustomerOrder } from '../../types/ecommerce';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: CustomerOrder[];
}

export const OrdersModal: React.FC<OrdersModalProps> = ({
  isOpen,
  onClose,
  orders
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in font-sans">
      <div
        className="relative w-full max-w-2xl bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E7E2DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-stone-800" />
            <h3 className="font-serif-luxury text-xl font-semibold text-[#1C1917] tracking-wider uppercase">
              Acquisition History &amp; Orders
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-stone-500">
              <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <p className="font-serif-luxury text-lg text-stone-800">No prior acquisitions on record</p>
              <p className="text-xs text-stone-500 mt-1">
                Completed orders will be permanently cataloged here with live courier dispatch details.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E7E2DA] rounded-lg p-5 shadow-2xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EEE9] pb-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Order Reference</span>
                    <span className="font-mono font-semibold text-stone-900">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Date</span>
                    <span className="text-stone-700">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Status</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {order.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 block">Total</span>
                    <span className="font-semibold text-stone-900 tabular-nums">
                      ${order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 object-cover rounded bg-[#F5F2EC]"
                        />
                        <div>
                          <p className="font-medium text-stone-900">{item.productName}</p>
                          <p className="text-[10px] text-stone-500">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-medium text-stone-800 tabular-nums">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Delivery note */}
                <div className="pt-2 border-t border-[#F2EEE9] flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-stone-600" />
                    <span>White-Glove Delivery to: {order.shippingAddress}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
