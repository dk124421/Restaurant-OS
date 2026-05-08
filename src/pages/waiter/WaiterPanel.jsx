import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, CheckCircle, AlertTriangle, Users, Coffee, HandHelping, RefreshCw } from 'lucide-react';
import { playNewOrder, playOrderReady, playHelpAlert } from '../../utils/sounds';

export default function WaiterPanel() {
  const socket = useSocket();
  const [tables, setTables] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tables');
  const [waiters, setWaiters] = useState([]);
  const [activeWaiter, setActiveWaiter] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orderModal, setOrderModal] = useState({ isOpen: false, tableNumber: null, items: [], notes: '' });
  const [cartOpen, setCartOpen] = useState(false);

  const fetchTables = useCallback(() => {
    fetch('/api/tables').then(r => r.json()).then(d => { setTables(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  useEffect(() => {
    fetch('/api/staff?role=waiter').then(r => r.json()).then(d => {
      setWaiters(d.filter(s => s.isActive));
      if (d.length > 0) setActiveWaiter(d[0]);
    }).catch(() => {});
    fetch('/api/menu').then(r => r.json()).then(d => setMenuItems(d.filter(i => i.isAvailable))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('tableUpdated', fetchTables);
    socket.on('orderUpdated', fetchTables);
    socket.on('helpRequested', (data) => {
      playHelpAlert();
      setNotifications(prev => [{ id: Date.now(), type: 'help', message: `Table ${data.tableNumber} needs help!`, time: new Date() }, ...prev]);
    });
    socket.on('newOrder', (order) => {
      playNewOrder();
      setNotifications(prev => [{ id: Date.now(), type: 'order', message: `New order from Table ${order.tableNumber}`, time: new Date() }, ...prev]);
    });
    return () => { socket.off('tableUpdated'); socket.off('orderUpdated'); socket.off('helpRequested'); socket.off('newOrder'); };
  }, [socket, fetchTables]);

  // Also add notification for 'ready' tables
  useEffect(() => {
    const readyTables = tables.filter(t => t.status === 'ready');
    readyTables.forEach(t => {
      setNotifications(prev => {
        if (prev.find(n => n.type === 'ready' && n.tableNumber === t.number && Date.now() - new Date(n.time).getTime() < 60000)) return prev;
        playOrderReady();
        return [{ id: Date.now() + t.number, type: 'ready', message: `Table ${t.number} order is READY for delivery!`, tableNumber: t.number, time: new Date() }, ...prev];
      });
    });
  }, [tables]);

  const markDelivered = async (tableNumber) => {
    const table = tables.find(t => t.number === tableNumber);
    if (!table?.currentOrderId) return;
    const staffName = activeWaiter ? `${activeWaiter.name} (${activeWaiter.staffId})` : 'Waiter';
    await fetch(`/api/orders/${table.currentOrderId}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered', staffName, staffRole: 'waiter' })
    });
    fetchTables();
  };

  const resolveHelp = async (tableNumber) => {
    await fetch(`/api/tables/${tableNumber}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: tables.find(t => t.number === tableNumber)?.currentOrderId ? 'occupied' : 'free' })
    });
    fetchTables();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'free': return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-500', label: 'Free', icon: Coffee, iconColor: 'text-gray-400', glow: '' };
      case 'occupied': return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'Occupied', icon: Users, iconColor: 'text-blue-500', glow: '' };
      case 'ready': return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', label: 'ORDER READY', icon: CheckCircle, iconColor: 'text-amber-500', glow: 'shadow-lg shadow-amber-100' };
      case 'help': return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', label: 'Call Waiter', icon: AlertTriangle, iconColor: 'text-red-500', glow: 'shadow-lg shadow-red-100 animate-pulse' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-500', label: status, icon: Coffee, iconColor: 'text-gray-400', glow: '' };
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-teal-50/50 pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>THE OLIVE GROVE</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{timeStr}</span>
            <div className="relative">
              <button onClick={() => setActiveTab(activeTab === 'notifications' ? 'tables' : 'notifications')} className="p-2 rounded-lg hover:bg-gray-100 transition relative">
                <Bell className="w-5 h-5 text-gray-600" />
                {notifications.length > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />}
              </button>
            </div>
            {waiters.length > 0 && (
              <select value={activeWaiter?._id || ''} onChange={e => setActiveWaiter(waiters.find(w => w._id === e.target.value))}
                className="bg-white text-gray-700 text-sm px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 hidden sm:block">
                {waiters.map(w => <option key={w._id} value={w._id}>{w.name} ({w.staffId})</option>)}
              </select>
            )}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {activeWaiter ? activeWaiter.name.split(' ').map(n => n[0]).join('').slice(0,2) : '?'}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{activeWaiter ? activeWaiter.name : 'No Waiter'}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {activeTab === 'tables' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-700">Tables Overview</h2>
              <button onClick={fetchTables} className="p-2 rounded-lg hover:bg-white transition"><RefreshCw className="w-4 h-4 text-gray-400" /></button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {[{ status: 'free', label: 'Free' }, { status: 'occupied', label: 'Occupied' }, { status: 'ready', label: 'Ready' }, { status: 'help', label: 'Help' }].map(l => {
                const config = getStatusConfig(l.status);
                return (
                  <div key={l.status} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-3 h-3 rounded ${config.bg} border ${config.border}`} />
                    <span className="text-gray-500">{l.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {tables.map(table => {
                const config = getStatusConfig(table.status);
                const StatusIcon = config.icon;
                return (
                  <div key={table.number}
                    className={`relative ${config.bg} ${config.border} ${config.glow} border-2 rounded-2xl p-4 text-center transition-all hover:scale-105 cursor-pointer`}
                    onClick={() => {
                      if (table.status === 'ready') markDelivered(table.number);
                      else if (table.status === 'help') resolveHelp(table.number);
                      else if (table.status === 'free' || table.status === 'occupied') {
                        setOrderModal({ isOpen: true, tableNumber: table.number, items: [], notes: '' });
                        setCartOpen(false);
                      }
                    }}>
                    <StatusIcon className={`w-5 h-5 ${config.iconColor} mx-auto mb-1.5`} />
                    <p className="text-lg font-bold text-gray-900">Table {table.number}</p>
                    <p className={`text-xs font-medium ${config.text} capitalize`}>{config.label}</p>
                    {table.customerName && <p className="text-[10px] text-gray-400 mt-1 truncate">{table.customerName}</p>}

                    {/* Action Overlay */}
                    {table.status === 'ready' && (
                      <button className="mt-2 w-full py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition active:scale-95">
                        DELIVER
                      </button>
                    )}
                    {table.status === 'help' && (
                      <button className="mt-2 w-full py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition active:scale-95">
                        RESPOND
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Notifications Tab */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-700">Notifications</h2>
              <button onClick={() => setNotifications([])} className="text-xs text-blue-500 hover:text-blue-600 font-medium">Clear All</button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><Bell className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">No notifications</p></div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 20).map(n => (
                  <div key={n.id} className={`flex items-center gap-3 p-4 rounded-xl border animate-fade-in ${
                    n.type === 'help' ? 'bg-red-50 border-red-200' :
                    n.type === 'ready' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    {n.type === 'help' ? <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" /> :
                     n.type === 'ready' ? <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" /> :
                     <Bell className="w-5 h-5 text-blue-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{n.message}</p>
                      <p className="text-xs text-gray-400">{new Date(n.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex justify-around py-2.5 md:hidden z-40">
        {[
          { tab: 'tables', icon: Users, label: 'Tables' },
          { tab: 'notifications', icon: Bell, label: 'Alerts' },
        ].map(item => (
          <button key={item.tab} onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs font-medium transition ${activeTab === item.tab ? 'text-blue-600' : 'text-gray-400'}`}>
            <item.icon className="w-5 h-5" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Waiter Order Modal */}
      {orderModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex flex-col md:p-4 animate-fade-in">
          <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:mx-auto md:rounded-2xl flex flex-col overflow-hidden shadow-2xl">
             <div className="px-4 py-3 bg-gray-900 text-white flex justify-between items-center shrink-0">
               <div>
                 <h2 className="font-bold text-lg leading-tight">Table {orderModal.tableNumber}</h2>
                 <p className="text-xs text-gray-400">Take Order</p>
               </div>
               <button onClick={() => setOrderModal({...orderModal, isOpen: false})} className="p-2 hover:bg-gray-800 rounded-lg transition text-gray-300 hover:text-white">✕</button>
             </div>
             
             <div className="flex-1 overflow-hidden flex flex-col sm:flex-row relative">
               {/* Menu List */}
               <div className={`flex-1 overflow-y-auto p-3 space-y-2 pb-24 sm:pb-3 ${cartOpen ? 'hidden sm:block' : 'block'}`}>
                 <h3 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider pl-1">Menu Items</h3>
                 {menuItems.map(item => (
                    <div key={item._id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                       <div className="flex items-center gap-3">
                         <span className="text-2xl">{item.image}</span>
                         <div>
                           <div className="flex items-center gap-1.5">
                             <span className={`w-2.5 h-2.5 border rounded-sm ${item.isVeg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center`}>
                               <span className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                             </span>
                             <p className="font-bold text-sm text-gray-900">{item.name}</p>
                           </div>
                           <p className="text-xs font-medium text-gray-500 mt-0.5">₹{item.price}</p>
                         </div>
                       </div>
                       <button onClick={() => {
                          const newItems = [...orderModal.items];
                          const existing = newItems.find(i => i._id === item._id);
                          if (existing) existing.quantity++;
                          else newItems.push({ ...item, quantity: 1 });
                          setOrderModal({...orderModal, items: newItems});
                       }} className="px-4 py-1.5 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg hover:bg-blue-100 transition active:scale-95">ADD</button>
                    </div>
                 ))}
               </div>

               {/* Cart Panel (Sliding on mobile, fixed right side on Desktop) */}
               <div className={`sm:w-72 bg-gray-50 border-l border-gray-200 flex flex-col absolute inset-0 sm:relative z-10 transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}`}>
                 <div className="p-3 border-b flex items-center justify-between bg-white shrink-0">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-gray-700">Current Order</h3>
                    <button onClick={() => setCartOpen(false)} className="sm:hidden text-xs text-blue-600 font-medium">Back to Menu</button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {orderModal.items.length === 0 ? (
                      <div className="text-center text-gray-400 py-10"><p className="text-sm">No items added</p></div>
                    ) : (
                      orderModal.items.map(item => (
                         <div key={item._id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm text-sm">
                           <div className="flex-1 min-w-0 pr-2">
                             <p className="font-bold text-gray-900 truncate">{item.name}</p>
                             <p className="text-xs text-gray-500">₹{item.price * item.quantity}</p>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className="font-bold bg-gray-100 px-2 py-1 rounded-md">{item.quantity}x</span>
                              <button onClick={() => {
                                 const newItems = orderModal.items.filter(i => i._id !== item._id);
                                 setOrderModal({...orderModal, items: newItems});
                                 if (newItems.length === 0) setCartOpen(false);
                              }} className="w-7 h-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition">✕</button>
                           </div>
                         </div>
                      ))
                    )}
                 </div>
                 
                 <div className="p-4 bg-white border-t shrink-0">
                    <button 
                      disabled={orderModal.items.length === 0}
                      onClick={async () => {
                        const data = {
                          tableNumber: orderModal.tableNumber,
                          customerName: activeWaiter ? `${activeWaiter.name} (Waiter)` : 'Waiter',
                          items: orderModal.items.map(i => ({ menuItemId: i._id, name: i.name, price: i.price, quantity: i.quantity, isVeg: i.isVeg }))
                        };
                        await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
                        setOrderModal({ isOpen: false, tableNumber: null, items: [], notes: '' });
                        fetchTables();
                      }}
                      className="w-full py-3.5 bg-green-500 text-white font-bold text-sm lg:text-base rounded-xl disabled:opacity-50 hover:bg-green-600 transition shadow-lg shadow-green-200 active:scale-[0.98]">
                      Send to Kitchen (₹{orderModal.items.reduce((sum, i) => sum + i.price * i.quantity, 0)})
                    </button>
                 </div>
               </div>
             </div>

             {/* Mobile View Cart Toggle Button */}
             {!cartOpen && orderModal.items.length > 0 && (
               <div className="sm:hidden absolute bottom-4 left-4 right-4 z-20">
                 <button onClick={() => setCartOpen(true)} className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-xl shadow-xl flex items-center justify-between px-6">
                   <span>View Order ({orderModal.items.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                   <span>₹{orderModal.items.reduce((sum, i) => sum + i.price * i.quantity, 0)}</span>
                 </button>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
