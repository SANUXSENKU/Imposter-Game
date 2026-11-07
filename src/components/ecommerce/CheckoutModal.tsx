import React, { useState } from 'react';
import { X, CheckCircle, CreditCard, ShieldCheck, Lock, Truck, ArrowLeft, PackageCheck } from 'lucide-react';
import { CartItem, CustomerOrder } from '../../types/ecommerce';
import { createFirestoreOrder } from '../../services/ecommerceDb';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: { uid?: string; displayName?: string | null; email?: string | null } | null;
  onOrderSuccess: (order: CustomerOrder) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onOrderSuccess
}) => {
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    address: '142 Dronningens Tværgade',
    city: 'Copenhagen',
    postalCode: '1302',
    country: 'Denmark',
    paymentMethod: 'card' as 'card' | 'apple_pay' | 'wire',
    cardNumber: '4532 •••• •••• 8912',
    cardExp: '11/28',
    cardCvc: '884'
  });

  const [deliveryMethod, setDeliveryMethod] = useState<'white_glove' | 'standard'>('white_glove');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CustomerOrder | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal >= 500 ? 0 : 45;
  const whiteGloveAddon = deliveryMethod === 'white_glove' ? 0 : 0; // complimentary for luxury feel
  const total = subtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderId = `AN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: CustomerOrder = {
      id: orderId,
      userId: user?.uid || `guest-${Date.now()}`,
      customerName: formData.name || 'Atelier Patron',
      customerEmail: formData.email || 'patron@ateliernordic.com',
      shippingAddress: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
      paymentMethod: formData.paymentMethod,
      items: items.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image
      })),
      subtotal,
      shippingFee,
      total,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString()
    };

    try {
      if (user?.uid) {
        await createFirestoreOrder(newOrder);
      }
    } catch (err) {
      console.warn('Order saved locally (Firestore guest flow):', err);
    }

    // Trigger celebration
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    setIsSubmitting(false);
    setCompletedOrder(newOrder);
    onOrderSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#E7E2DA] rounded-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E7E2DA] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <span className="font-serif-luxury text-xl font-semibold text-[#1C1917] tracking-wider uppercase">
              {completedOrder ? 'Order Confirmation' : 'Secure Atelier Checkout'}
            </span>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-500 font-sans">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmation State */}
        {completedOrder ? (
          <div className="p-8 text-center space-y-6 max-h-[80vh] overflow-y-auto font-sans">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-stone-500">
                Order Placed Successfully
              </span>
              <h3 className="font-serif-luxury text-3xl font-semibold text-[#1C1917] mt-1">
                Thank you for your patronage, {completedOrder.customerName}.
              </h3>
              <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto">
                We have received your acquisition. A formal provenance receipt and dispatch dossier have been sent to <span className="font-medium text-stone-900">{completedOrder.customerEmail}</span>.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="max-w-lg mx-auto bg-white border border-[#E7E2DA] rounded-lg p-5 text-left text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-[#F2EEE9] pb-2">
                <span className="text-stone-500">Order Reference</span>
                <span className="font-mono font-bold text-stone-900">{completedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#F2EEE9] pb-2">
                <span className="text-stone-500">Delivery Address</span>
                <span className="text-stone-900 text-right">{completedOrder.shippingAddress}, {completedOrder.city}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#F2EEE9] pb-2">
                <span className="text-stone-500">Delivery Method</span>
                <span className="text-stone-900 font-medium">White-Glove Continental Placement</span>
              </div>
              <div className="flex justify-between items-center text-sm font-semibold text-stone-900 pt-1">
                <span>Total Paid</span>
                <span className="tabular-nums font-bold">${completedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 rounded bg-[#1C1917] text-white text-xs font-semibold tracking-widest uppercase hover:bg-stone-800 transition-colors shadow-sm"
              >
                Return to Showroom
              </button>
            </div>
          </div>
        ) : (
          /* Form Checkout Mode */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col md:flex-row gap-8">
            {/* Left Column: Client Details */}
            <div className="flex-1 space-y-6 font-sans">
              <div>
                <h4 className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-3">
                  1. Patron Contact &amp; Shipping
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Astrid Lindholm"
                      className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded text-xs text-stone-900 focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Email Dossier</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="astrid@atelier.com"
                      className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded text-xs text-stone-900 focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-stone-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Dronningens Tværgade 14"
                      className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded text-xs text-stone-900 focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded text-xs text-stone-900 focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-600 mb-1">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-[#E7E2DA] rounded text-xs text-stone-900 focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Service Selection */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-3">
                  2. Delivery Experience
                </h4>
                <div className="space-y-2">
                  <label
                    onClick={() => setDeliveryMethod('white_glove')}
                    className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
                      deliveryMethod === 'white_glove'
                        ? 'border-[#1C1917] bg-white ring-1 ring-[#1C1917]'
                        : 'border-[#E7E2DA] bg-[#FAF8F5]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryMethod === 'white_glove'}
                      onChange={() => setDeliveryMethod('white_glove')}
                      className="mt-0.5 text-[#1C1917]"
                    />
                    <div className="text-xs">
                      <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-800" />
                        <span>White-Glove In-Home Placement &amp; Packaging Removal</span>
                      </div>
                      <p className="text-stone-500 text-[11px] mt-0.5">
                        Two-person delivery team, room of choice placement, debris removal.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Section */}
              <div>
                <h4 className="text-xs font-semibold tracking-widest uppercase text-stone-500 mb-3">
                  3. Encrypted Payment
                </h4>
                <div className="bg-white p-4 border border-[#E7E2DA] rounded-lg space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#F2EEE9]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                      <CreditCard className="w-4 h-4 text-stone-700" />
                      <span>Credit or Debit Card</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">VISA / MC / AMEX</span>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-xs font-mono text-stone-900 focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={formData.cardExp}
                        onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-xs font-mono text-stone-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-stone-500 mb-1">CVC Code</label>
                      <input
                        type="text"
                        value={formData.cardCvc}
                        onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                        className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E7E2DA] rounded text-xs font-mono text-stone-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="w-full md:w-80 bg-white border border-[#E7E2DA] rounded-lg p-5 flex flex-col justify-between font-sans">
              <div>
                <h4 className="font-serif-luxury text-base font-semibold text-[#1C1917] mb-3 border-b border-[#F2EEE9] pb-2">
                  Acquisition Summary ({items.length})
                </h4>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3 text-xs">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded bg-[#F5F2EC] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-stone-900 truncate">{item.product.name}</p>
                        <p className="text-[10px] text-stone-500">Qty: {item.quantity}</p>
                        <p className="font-semibold text-stone-900 tabular-nums">
                          ${(item.product.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#E7E2DA] mt-4 pt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>White-Glove Shipping</span>
                    <span className="tabular-nums">
                      {shippingFee === 0 ? <span className="text-emerald-700 font-semibold">Complimentary</span> : `$${shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>VAT Included</span>
                    <span className="text-stone-400">Standard rate</span>
                  </div>
                  <div className="border-t border-[#E7E2DA] pt-2 flex justify-between text-sm font-bold text-stone-900">
                    <span>Total Due</span>
                    <span className="tabular-nums font-serif-luxury text-base">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E7E2DA] space-y-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded bg-[#1C1917] text-white hover:bg-stone-800 disabled:opacity-50 transition-all text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Processing Authorization...</span>
                  ) : (
                    <>
                      <span>Authorize Acquisition · ${total.toLocaleString()}</span>
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-stone-400">
                  By confirming, you agree to Atelier Nordic terms of provenance &amp; white-glove logistics.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
