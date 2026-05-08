import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, Search, UtensilsCrossed } from 'lucide-react';

const CATEGORIES = ['Starters', 'Main Course', 'Rice', 'Breads', 'Drinks', 'Desserts'];

export default function CustomerMenu() {
  const { tableId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const customerName = searchParams.get('name') || 'Guest';
  const customerPhone = searchParams.get('phone') || '';

  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Starters');
  const [cart, setCart] = useState([]);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu').then(r => r.json()).then(d => { setItems(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = items.filter(i =>
    i.isAvailable && i.category !== 'Extras' &&
    i.category === activeCategory &&
    (!searchQ || i.name.toLowerCase().includes(searchQ.toLowerCase()))
  );

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c._id === item._id);
      if (existing) return prev.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { _id: item._id, name: item.name, price: item.price, quantity: 1, isVeg: item.isVeg, image: item.image }];
    });

    // Show meal completeness suggestions
    if (item.pairings && item.pairings.length > 0) {
      const pairingItems = item.pairings.filter(p => p && p._id);
      if (pairingItems.length > 0) {
        setSuggestions(pairingItems);
        setLastAddedItem(item);
        setShowSuggestion(true);
      }
    }
  };

  const removeFromCart = (id) => {
    setCart(prev => {
      const item = prev.find(c => c._id === id);
      if (item && item.quantity > 1) return prev.map(c => c._id === id ? { ...c, quantity: c.quantity - 1 } : c);
      return prev.filter(c => c._id !== id);
    });
  };

  const getCartQty = (id) => cart.find(c => c._id === id)?.quantity || 0;

  const goToCart = () => {
    const cartData = encodeURIComponent(JSON.stringify(cart));
    navigate(`/table/${tableId}/cart?name=${customerName}&phone=${customerPhone}&cart=${cartData}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight" style={{ fontFamily: 'var(--font-heading)' }}>The Rustic Table</h1>
              <p className="text-[11px] text-gray-400">Table {tableId} • {customerName}</p>
            </div>
          </div>
          <button onClick={goToCart} className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors" disabled={cartCount === 0}>
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="max-w-lg mx-auto px-4 mt-3 mb-2">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl px-4 py-2.5 border border-emerald-100">
          <p className="text-sm text-emerald-700 font-medium">Welcome to The Rustic Table – Scan. Order. Enjoy.</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto px-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search menu..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="max-w-lg mx-auto px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Category Title */}
      <div className="max-w-lg mx-auto px-4 mb-3">
        <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wide">{activeCategory}</h2>
      </div>

      {/* Item Grid */}
      <div className="max-w-lg mx-auto px-4">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(item => {
            const qty = getCartQty(item._id);
            return (
              <div key={item._id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-fade-in">
                {/* Item Image */}
                <div className="relative h-28 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                  <span className="text-5xl">{item.image}</span>
                  {/* Veg/Non-veg indicator */}
                  <span className={`absolute top-2 left-2 w-4 h-4 border-2 rounded-sm flex items-center justify-center ${item.isVeg ? 'border-green-500' : 'border-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                  </span>
                  {qty > 0 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{qty} added</span>
                  )}
                </div>
                {/* Item Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">{item.name}</h3>
                  <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">₹{item.price}</span>
                    {qty === 0 ? (
                      <button onClick={() => addToCart(item)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border-2 border-orange-500 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-50 transition-colors active:scale-95">
                        ADD <Plus className="w-3 h-3" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-orange-500 rounded-lg px-1 py-0.5">
                        <button onClick={() => removeFromCart(item._id)} className="p-1 text-white hover:bg-orange-600 rounded"><Minus className="w-3 h-3" /></button>
                        <span className="text-white font-bold text-sm min-w-[16px] text-center">{qty}</span>
                        <button onClick={() => addToCart(item)} className="p-1 text-white hover:bg-orange-600 rounded"><Plus className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && <p className="text-center text-gray-400 py-12">No items found in this category</p>}
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/80 backdrop-blur-xl border-t border-gray-100">
          <button onClick={goToCart}
            className="w-full max-w-lg mx-auto flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl shadow-xl shadow-orange-200 active:scale-[0.98] transition-transform">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-semibold">{cartCount} item{cartCount > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">₹{cartTotal}</span>
              <span className="text-sm opacity-80">→</span>
            </div>
          </button>
        </div>
      )}

      {/* Meal Completeness Modal */}
      {showSuggestion && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowSuggestion(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>COMPLETE YOUR MEAL</h3>
              <button onClick={() => setShowSuggestion(false)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Enhance Your Dining Experience</p>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {suggestions.map(s => (
                <div key={s._id} className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                  <span className="text-3xl block mb-1">{s.image}</span>
                  <p className="text-xs font-semibold text-gray-900 mb-0.5">{s.name}</p>
                  <p className="text-xs font-bold text-orange-600 mb-2">₹{s.price}</p>
                  <button onClick={() => { addToCart(s); setShowSuggestion(false); }}
                    className="w-full py-1.5 bg-white border border-orange-300 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-50 active:scale-95 transition-all">
                    ADD +
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSuggestion(false)} className="flex-1 py-2.5 text-gray-500 text-sm font-medium hover:bg-gray-50 rounded-xl transition-colors">Skip</button>
              <button onClick={() => { setShowSuggestion(false); goToCart(); }}
                className="flex-1 py-2.5 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors">
                Proceed to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
