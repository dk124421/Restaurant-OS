import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, CheckCircle, Clock, ChefHat, UtensilsCrossed, PartyPopper } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { playOrderPlaced, playOrderReady } from '../../utils/sounds';

const STATUS_STEPS = [
  { key: 'new', label: 'Order Placed', icon: CheckCircle, emoji: '📋', desc: 'Your order has been received' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, emoji: '👨‍🍳', desc: 'Chef is cooking your food' },
  { key: 'ready', label: 'Ready', icon: UtensilsCrossed, emoji: '🍽️', desc: 'Your food is ready!' },
  { key: 'delivered', label: 'Served', icon: PartyPopper, emoji: '🎉', desc: 'Enjoy your meal!' },
];

function StatusTracker({ status, orderId, tableId, total, customerName }) {
  const currentIdx = STATUS_STEPS.findIndex(s => s.key === status);
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const diff = Math.floor((Date.now() - start) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${m}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-gray-100 px-4 py-4 text-center">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Table {tableId} • {customerName}</p>
        <h1 className="text-xl font-bold text-gray-900 mt-1" style={{ fontFamily: 'var(--font-heading)' }}>Order Status</h1>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-mono text-gray-500">{elapsed}</span>
        </div>
      </header>

      <div className="max-w-md mx-auto px-6 py-8">
        {/* Status Progress */}
        <div className="relative">
          {STATUS_STEPS.map((step, idx) => {
            const isActive = idx === currentIdx;
            const isDone = idx < currentIdx;
            const isPending = idx > currentIdx;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {/* Connector Line */}
                {idx < STATUS_STEPS.length - 1 && (
                  <div className="absolute left-[22px] top-[44px] w-0.5 h-[calc(100%-20px)]"
                    style={{ background: isDone ? '#22c55e' : '#e5e7eb' }} />
                )}

                {/* Circle */}
                <div className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                  isDone ? 'bg-green-500 shadow-lg shadow-green-200' :
                  isActive ? 'bg-orange-500 shadow-lg shadow-orange-200 animate-pulse' :
                  'bg-gray-200'
                }`}>
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-lg">{step.emoji}</span>
                  )}
                </div>

                {/* Text */}
                <div className={`flex-1 pb-8 ${isPending ? 'opacity-40' : ''}`}>
                  <h3 className={`font-bold text-base ${isActive ? 'text-orange-600' : isDone ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.label}
                    {isActive && <span className="ml-2 inline-flex w-2 h-2 bg-orange-500 rounded-full animate-ping" />}
                  </h3>
                  <p className={`text-sm mt-0.5 ${isActive ? 'text-gray-600' : isDone ? 'text-gray-500' : 'text-gray-400'}`}>
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Status Card */}
        <div className={`mt-4 rounded-2xl p-5 text-center transition-all ${
          status === 'new' ? 'bg-blue-50 border-2 border-blue-200' :
          status === 'preparing' ? 'bg-yellow-50 border-2 border-yellow-200' :
          status === 'ready' ? 'bg-green-50 border-2 border-green-200' :
          'bg-green-50 border-2 border-green-300'
        }`}>
          <p className="text-4xl mb-2">
            {status === 'new' ? '📋' : status === 'preparing' ? '🔥' : status === 'ready' ? '🍽️' : '🎉'}
          </p>
          <h3 className="text-lg font-bold text-gray-900">
            {status === 'new' && 'Waiting for kitchen to accept...'}
            {status === 'preparing' && 'Your food is being prepared!'}
            {status === 'ready' && 'Your food is READY!'}
            {status === 'delivered' && 'Bon Appétit! Enjoy your meal!'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {status === 'new' && 'The kitchen will start preparing soon'}
            {status === 'preparing' && 'Our chef is giving their best 👨‍🍳'}
            {status === 'ready' && 'The waiter will bring it to your table'}
            {status === 'delivered' && 'Thank you for dining with us ❤️'}
          </p>
        </div>

        {/* Order Summary */}
        <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Order Total</p>
          <p className="text-2xl font-bold text-gray-900">₹{total}</p>
          <p className="text-xs text-gray-400 mt-1">Order #{orderId?.slice(-6)}</p>
        </div>

        {/* Call Waiter Button */}
        {status !== 'delivered' && (
          <button
            onClick={() => fetch(`/api/tables/${tableId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'help' }) })}
            className="mt-5 w-full py-3 bg-red-50 border-2 border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-100 transition active:scale-[0.98]">
            🔔 Call Waiter
          </button>
        )}
      </div>
    </div>
  );
}

export default function Cart() {
  const { tableId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const customerName = searchParams.get('name') || 'Guest';
  const customerPhone = searchParams.get('phone') || '';
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(decodeURIComponent(searchParams.get('cart') || '[]')); } catch { return []; }
  });
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('new');
  const [notes, setNotes] = useState('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  // Listen for real-time order updates
  useEffect(() => {
    if (!socket || !orderId) return;
    const handleUpdate = (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrderStatus(updatedOrder.status);
        if (updatedOrder.status === 'ready') playOrderReady();
      }
    };
    socket.on('orderUpdated', handleUpdate);
    return () => socket.off('orderUpdated', handleUpdate);
  }, [socket, orderId]);

  // Also poll as fallback
  useEffect(() => {
    if (!orderId) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.status !== orderStatus) {
          setOrderStatus(data.status);
          if (data.status === 'ready') playOrderReady();
        }
      } catch {}
    }, 5000);
    return () => clearInterval(poll);
  }, [orderId, orderStatus]);

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item._id !== id) return item;
      const newQty = item.quantity + delta;
      return newQty > 0 ? { ...item, quantity: newQty } : item;
    }).filter(item => item.quantity > 0));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacing(true);
    try {
      const orderData = {
        tableNumber: parseInt(tableId),
        customerName,
        customerPhone,
        notes,
        items: cart.map(i => ({ menuItemId: i._id, name: i.name, price: i.price, quantity: i.quantity, isVeg: i.isVeg }))
      };
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
      const order = await res.json();
      setOrderId(order._id);
      playOrderPlaced();
      setPlaced(true);
    } catch (err) {
      alert('Failed to place order. Please try again.');
    }
    setPlacing(false);
  };

  // Show live status tracker after order is placed
  if (placed) {
    return <StatusTracker status={orderStatus} orderId={orderId} tableId={tableId} total={total} customerName={customerName} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
            <p className="text-xs text-gray-400">Table {tableId} • {customerName}</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 mt-4">
        {cart.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-lg font-medium">Your cart is empty</p>
            <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium">Browse Menu</button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3 mb-6">
              {cart.map(item => (
                <div key={item._id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm animate-fade-in">
                  <span className="text-3xl">{item.image}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-3 h-3 border rounded-sm ${item.isVeg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                      </span>
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                    </div>
                    <p className="text-sm font-bold text-gray-700 mt-1">₹{item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-1 py-0.5">
                      <button onClick={() => updateQty(item._id, -1)} className="p-1.5 hover:bg-gray-200 rounded"><Minus className="w-3 h-3" /></button>
                      <span className="font-bold text-sm min-w-[16px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item._id, 1)} className="p-1.5 hover:bg-gray-200 rounded"><Plus className="w-3 h-3" /></button>
                    </div>
                    <button onClick={() => removeItem(item._id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2" placeholder="Any allergies or special requests..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none" />
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm mb-4">
              <h3 className="font-bold text-gray-900 mb-3">Bill Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{gst}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold text-gray-900 text-base"><span>Total</span><span>₹{total}</span></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Place Order Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-white/80 backdrop-blur-xl border-t border-gray-100">
          <button onClick={placeOrder} disabled={placing}
            className="w-full max-w-lg mx-auto flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-green-200 active:scale-[0.98] transition-transform disabled:opacity-70">
            {placing ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {placing ? 'Placing Order...' : `Place Order • ₹${total}`}
          </button>
        </div>
      )}
    </div>
  );
}
