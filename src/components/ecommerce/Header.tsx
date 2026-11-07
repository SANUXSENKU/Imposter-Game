import React from 'react';
import { ShoppingBag, Sparkles, Volume2, VolumeX, Package, User, LogOut, Check, Heart } from 'lucide-react';
import { ProductCategory } from '../../types/ecommerce';

interface HeaderProps {
  activeCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
  onOpenStylist: () => void;
  onToggleAmbience: () => void;
  isAmbiencePlaying: boolean;
  user: { displayName?: string | null; email?: string | null; photoURL?: string | null } | null;
  onLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenOrders,
  onOpenStylist,
  onToggleAmbience,
  isAmbiencePlaying,
  user,
  onLogin,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E7E2DA] transition-all">
      {/* Editorial Announcement Bar */}
      <div className="bg-[#1C1917] text-[#FAF8F5] text-[11px] font-medium tracking-widest uppercase py-1.5 px-4 text-center flex items-center justify-center gap-3">
        <span>Complimentary White-Glove Continental Delivery on orders above $500</span>
        <span className="hidden sm:inline text-stone-500">·</span>
        <span className="hidden sm:inline text-stone-300">Sustainable Nordic Craftsmanship</span>
      </div>

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-6 shrink-0">
          <a href="#" className="flex flex-col group">
            <span className="font-serif-luxury text-2xl sm:text-3xl tracking-[0.18em] font-semibold text-[#1C1917] uppercase group-hover:text-stone-700 transition-colors">
              ATELIER NORDIC
            </span>
            <span className="text-[9px] tracking-[0.3em] uppercase text-stone-500 font-sans -mt-0.5">
              COPENHAGEN · EST. 2018
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Categories */}
        <nav className="hidden lg:flex items-center space-x-1 border border-[#E7E2DA] rounded-full p-1 bg-[#F5F2EC]">
          {(['All', 'Furniture', 'Lighting', 'Ceramics', 'Objects'] as ProductCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-[#1C1917] text-white shadow-xs'
                  : 'text-stone-600 hover:text-[#1C1917] hover:bg-white/60'
              }`}
            >
              {cat === 'All' ? 'Curated Works' : cat}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Ambience Audio Toggle */}
          <button
            onClick={onToggleAmbience}
            title={isAmbiencePlaying ? 'Mute showroom ambience' : 'Play showroom acoustic ambience'}
            className={`p-2.5 rounded-full border transition-all flex items-center gap-2 text-xs font-medium ${
              isAmbiencePlaying
                ? 'bg-[#1C1917] text-amber-200 border-[#1C1917]'
                : 'bg-white border-[#E7E2DA] text-stone-700 hover:border-stone-400'
            }`}
          >
            {isAmbiencePlaying ? (
              <>
                <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="hidden md:inline text-[11px] tracking-wider uppercase font-sans">Ambience</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-stone-500" />
                <span className="hidden md:inline text-[11px] tracking-wider uppercase font-sans text-stone-500">Music</span>
              </>
            )}
          </button>

          {/* AI Interior Stylist */}
          <button
            onClick={onOpenStylist}
            className="p-2.5 sm:px-3 sm:py-2 rounded-full bg-white border border-[#E7E2DA] text-stone-800 hover:border-stone-400 transition-all flex items-center gap-1.5 text-xs font-medium shadow-2xs hover:shadow-xs"
            title="Consult AI Interior Stylist"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="hidden sm:inline text-[11px] tracking-wider uppercase">Stylist</span>
          </button>

          {/* User Account / Orders */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenOrders}
                className="p-2.5 rounded-full bg-white border border-[#E7E2DA] text-stone-800 hover:border-stone-400 transition-all"
                title="View past orders"
              >
                <Package className="w-4 h-4 text-stone-700" />
              </button>

              <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white border border-[#E7E2DA]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center text-[10px] font-semibold">
                    {user.displayName ? user.displayName[0] : 'U'}
                  </div>
                )}
                <span className="hidden md:inline text-xs font-medium text-stone-800 max-w-[90px] truncate">
                  {user.displayName?.split(' ')[0] || 'Patron'}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="text-stone-400 hover:text-stone-700 p-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-3.5 py-2 rounded-full bg-white border border-[#E7E2DA] text-stone-800 hover:border-stone-400 transition-all flex items-center gap-1.5 text-xs font-medium"
            >
              <User className="w-3.5 h-3.5 text-stone-600" />
              <span className="text-[11px] tracking-wider uppercase font-sans">Sign In</span>
            </button>
          )}

          {/* Saved Works / Wishlist Trigger */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2.5 rounded-full bg-white border border-[#E7E2DA] text-stone-800 hover:border-stone-400 transition-all flex items-center justify-center shadow-2xs hover:shadow-xs group"
            title="View Saved Works (Wishlist)"
          >
            <Heart
              className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                wishlistCount > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-700'
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1C1917] text-white text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Bag Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative px-3.5 py-2 rounded-full bg-[#1C1917] text-white hover:bg-stone-800 transition-all flex items-center gap-2 text-xs font-medium shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline text-[11px] tracking-wider uppercase">Bag</span>
            <span className="w-5 h-5 rounded-full bg-amber-400 text-[#1C1917] text-[11px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
