import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, Trash2, Printer, X, Package } from 'lucide-react';
import { playNewOrder, playTableUpdate, playPayment } from '../../utils/sounds';

const TAB_CATS = ['Starters', 'Main Course', 'Rice', 'Breads', 'Drinks', 'Desserts'];

export default function POSPanel() {
  const socket = useSocket();
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [activeCat, setActiveCat] = useState('Starters');
  const [existingOrders, setExistingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  const fetchTables = useCallback(() => {
    fetch('/api/tables').then(r => r.json()).then(setTables).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTables();
    fetch('/api/menu').then(r => r.json()).then(d => { setMenuItems(d.filter(i => i.isAvailable)); setLoading(false); }).catch(() => setLoading(false));
  }, [fetchTables]);

  useEffect(() => {
    if (!socket) return;
    socket.on('tableUpdated', () => { playTableUpdate(); fetchTables(); });
    socket.on('orderUpdated', fetchTables);
    socket.on('newOrder', () => { playNewOrder(); fetchTables(); });
    return () => { socket.off('tableUpdated'); socket.off('orderUpdated'); socket.off('newOrder'); };
  }, [socket, fetchTables]);

  const selectTable = async (table) => {
    setSelectedTable(table);
    setOrderItems([]);
    setPaymentMethod('');
    if (table.status !== 'free') {
      const orders = await fetch(`/api/orders/table/${table.number}`).then(r => r.json());
      setExistingOrders(orders);
      if (orders.length > 0) {
        setOrderItems(orders[0].items.map(i => ({ ...i, _id: i.menuItemId })));
      }
    } else {
      setExistingOrders([]);
    }
  };

  const addItem = (item) => {
    setOrderItems(prev => {
      const existing = prev.find(i => (i._id || i.menuItemId) === item._id);
      if (existing) return prev.map(i => (i._id || i.menuItemId) === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { _id: item._id, menuItemId: item._id, name: item.name, price: item.price, quantity: 1, isVeg: item.isVeg, image: item.image }];
    });
  };

  const addPackingCharge = () => {
    setOrderItems(prev => {
      const existing = prev.find(i => i.menuItemId === 'packing');
      if (existing) return prev.map(i => i.menuItemId === 'packing' ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItemId: 'packing', name: 'Packing Charge', price: 20, quantity: 1, isVeg: true, image: '🛍️' }];
    });
  };

  const updateQty = (id, delta) => {
    setOrderItems(prev => prev.map(i => {
      if ((i._id || i.menuItemId) !== id) return i;
      const newQty = i.quantity + delta;
      return newQty > 0 ? { ...i, quantity: newQty } : i;
    }).filter(i => i.quantity > 0));
  };

  const removeItem = (id) => setOrderItems(prev => prev.filter(i => (i._id || i.menuItemId) !== id));

  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const sgst = Math.round(subtotal * 0.025);
  const cgst = Math.round(subtotal * 0.025);
  const total = subtotal + sgst + cgst;

  const placeOrder = async () => {
    if (!selectedTable || orderItems.length === 0) return;
    const data = {
      tableNumber: selectedTable.number,
      customerName: selectedTable.customerName || 'Walk-in',
      notes,
      items: orderItems.map(i => ({ menuItemId: i._id || i.menuItemId, name: i.name, price: i.price, quantity: i.quantity, isVeg: i.isVeg }))
    };
    await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    fetchTables();
    setOrderItems([]);
    setSelectedTable(null);
  };

  const updateOrder = async () => {
    if (existingOrders.length === 0) return;
    const data = {
      notes,
      items: orderItems.map(i => ({ menuItemId: i.menuItemId || i._id, name: i.name, price: i.price, quantity: i.quantity, isVeg: i.isVeg }))
    };
    await fetch(`/api/orders/${existingOrders[0]._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    fetchTables();
  };

  const handlePayment = async (method) => {
    if (existingOrders.length === 0) return;
    setPaymentMethod(method);
    await updateOrder(); // Ensure any added packing charges or items are saved before payment
    await fetch(`/api/orders/${existingOrders[0]._id}/pay`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: method })
    });
    playPayment();
    fetchTables();
    setSelectedTable(null);
    setOrderItems([]);
    setExistingOrders([]);
  };

  const printBill = () => {
    const content = `
=== RESTAURANT OS ===
Table: ${selectedTable?.number}
${'-'.repeat(30)}
${orderItems.map(i => `${i.name} x${i.quantity}  ₹${i.price * i.quantity}`).join('\n')}
${'-'.repeat(30)}
Subtotal: ₹${subtotal}
SGST (2.5%): ₹${sgst}
CGST (2.5%): ₹${cgst}
TOTAL: ₹${total}
${'-'.repeat(30)}
Thank you for dining!
    `;
    const w = window.open('', '_blank');
    w.document.write(`<pre style="font-family:monospace;font-size:14px;padding:20px">${content}</pre>`);
    w.print();
  };

  const filteredMenu = menuItems.filter(i => i.category !== 'Extras' && i.category === activeCat && (!searchQ || i.name.toLowerCase().includes(searchQ.toLowerCase())));

  const getTableColor = (status) => {
    switch (status) {
      case 'free': return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';
      case 'occupied': return 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100';
      case 'ready': return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
      case 'help': return 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 animate-pulse';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>RESTAURANT POS</h1>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })} | {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
        {/* Left: Table Overview */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">TABLE OVERVIEW</h2>
          <div className="grid grid-cols-3 gap-2">
            {tables.map(t => (
              <button key={t.number} onClick={() => selectTable(t)}
                className={`relative p-3 rounded-xl border-2 text-center transition-all ${getTableColor(t.status)} ${selectedTable?.number === t.number ? 'ring-2 ring-violet-400 ring-offset-1' : ''}`}>
                <p className="text-lg font-bold">T{t.number}</p>
                <p className="text-[10px] capitalize">{t.status}</p>
                {t.customerName && <p className="text-[9px] mt-0.5 truncate">{t.customerName}</p>}
                {t.status === 'occupied' && <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Menu + Current Order */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-4 flex flex-col overflow-hidden">
          {selectedTable ? (
            <>
              <div className="mb-3">
                <h2 className="text-base font-bold text-gray-900">
                  CURRENT ORDER — Table {selectedTable.number}
                  {selectedTable.customerName && <span className="text-sm text-gray-400 font-normal ml-2">({selectedTable.customerName})</span>}
                </h2>
              </div>

              {/* Menu Search + Tabs */}
              <div className="mb-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search Menu Item..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
                </div>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                  {TAB_CATS.map(c => (
                    <button key={c} onClick={() => setActiveCat(c)}
                      className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${activeCat === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto space-y-1.5 mb-3 border-b border-gray-100 pb-3">
                {filteredMenu.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer" onClick={() => addItem(item)}>
                    <span className="text-2xl">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">₹{item.price}</p>
                    </div>
                    <button className="p-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition"><Plus className="w-4 h-4 text-emerald-600" /></button>
                  </div>
                ))}
              </div>

              {/* Order Items */}
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {orderItems.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">Add items from menu above</p>
                ) : (
                  orderItems.map(item => (
                    <div key={item._id || item.menuItemId} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg p-2">
                      <span className="flex-1 font-medium text-gray-900 truncate">{item.name}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item._id || item.menuItemId, -1)} className="p-1 hover:bg-gray-200 rounded"><Minus className="w-3 h-3" /></button>
                        <span className="font-bold min-w-[18px] text-center">{item.quantity}x</span>
                        <button onClick={() => updateQty(item._id || item.menuItemId, 1)} className="p-1 hover:bg-gray-200 rounded"><Plus className="w-3 h-3" /></button>
                      </div>
                      <span className="font-medium text-gray-700 w-16 text-right">₹{item.price * item.quantity}</span>
                      <button onClick={() => removeItem(item._id || item.menuItemId)} className="p-1 text-red-400 hover:bg-red-50 rounded"><X className="w-3 h-3" /></button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <p className="text-sm">Select a table to start</p>
            </div>
          )}
        </div>

        {/* Right: Bill Summary + Payment */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-4 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              ORDER SUMMARY {selectedTable ? `| T${selectedTable.number}` : ''}
            </h2>
            <button onClick={addPackingCharge} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg hover:bg-violet-100 transition">
              <Package className="w-3.5 h-3.5" /> PACKING
            </button>
          </div>

          {orderItems.length > 0 ? (
            <>
              {/* Bill Lines */}
              <div className="space-y-2 mb-4 flex-1">
                {orderItems.map(i => (
                  <div key={i._id || i.menuItemId} className="flex justify-between text-sm">
                    <span className="text-gray-700">{i.name} (x{i.quantity})</span>
                    <span className="font-medium">₹{i.price * i.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-3 space-y-1.5 mb-4">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>SGST (2.5%)</span><span>₹{sgst}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>CGST (2.5%)</span><span>₹{cgst}</span></div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t"><span>Total</span><span>₹{total}</span></div>
              </div>

              {/* Payment Options */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 uppercase mb-2">Payment Options</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handlePayment('cash')} className="py-3 bg-gray-100 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-200 transition border border-gray-200">💵 CASH</button>
                  <button onClick={() => handlePayment('upi')} className="py-3 bg-violet-50 rounded-xl text-sm font-bold text-violet-700 hover:bg-violet-100 transition border border-violet-200">📱 UPI</button>
                </div>
              </div>

              {/* Notes */}
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="2" placeholder="Notes..."
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm mb-3 focus:outline-none focus:border-emerald-300 resize-none" />

              {/* Actions */}
              <div className="space-y-2">
                {existingOrders.length === 0 ? (
                  <button onClick={placeOrder} className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition">Place Order</button>
                ) : (
                  <button onClick={updateOrder} className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition">Save Changes</button>
                )}
                <button onClick={printBill} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" /> PRINT BILL
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              <p>No items in order</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
