import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { Link } from 'react-router-dom';
import { ChefHat, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { playNewOrder } from '../../utils/sounds';

function OrderTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState('');
  const [mins, setMins] = useState(0);
  useEffect(() => {
    const calc = () => {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${m}m ${String(s).padStart(2, '0')}s`);
      setMins(m);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  return (
    <span className={`text-sm font-mono ${mins >= 15 ? 'text-red-400 font-bold' : mins >= 10 ? 'text-yellow-400' : 'text-green-400'}`}>
      {elapsed}
    </span>
  );
}

const STATUS_CONFIG = {
  new: { label: 'NEW ORDERS', bg: 'border-orange-500/30', headerBg: 'bg-orange-500/10', headerText: 'text-orange-400', dot: 'bg-orange-400' },
  preparing: { label: 'PREPARING', bg: 'border-yellow-500/30', headerBg: 'bg-yellow-500/10', headerText: 'text-yellow-400', dot: 'bg-yellow-400' },
  ready: { label: 'READY', bg: 'border-green-500/30', headerBg: 'bg-green-500/10', headerText: 'text-green-400', dot: 'bg-green-400' }
};

export default function KitchenDashboard() {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chefs, setChefs] = useState([]);
  const [activeChef, setActiveChef] = useState(null);

  const fetchOrders = useCallback(() => {
    fetch('/api/orders/active').then(r => r.json()).then(d => { setOrders(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    fetch('/api/staff?role=chef').then(r => r.json()).then(d => {
      setChefs(d.filter(s => s.isActive));
      if (d.length > 0) setActiveChef(d[0]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('newOrder', () => { playNewOrder(); fetchOrders(); });
    socket.on('orderUpdated', fetchOrders);
    return () => { socket.off('newOrder'); socket.off('orderUpdated'); };
  }, [socket, fetchOrders]);

  const updateStatus = async (id, status) => {
    const staffName = activeChef ? `${activeChef.name} (${activeChef.staffId})` : 'Kitchen';
    await fetch(`/api/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, staffName, staffRole: 'chef' }) });
  };

  const getColumnOrders = (status) => orders.filter(o => o.status === status);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="min-h-screen bg-[#0D1117] text-gray-200">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363D]">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg hover:bg-[#21262D] transition"><ArrowLeft className="w-5 h-5 text-gray-400" /></Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>LIVE KITCHEN ORDERS</h1>
              <p className="text-xs text-gray-500">{dateStr} | {timeStr}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchOrders} className="p-2 rounded-lg hover:bg-[#21262D] transition"><RefreshCw className="w-5 h-5 text-gray-400" /></button>
          {chefs.length > 0 && (
            <select value={activeChef?._id || ''} onChange={e => setActiveChef(chefs.find(c => c._id === e.target.value))}
              className="bg-[#161B22] text-gray-300 text-sm px-3 py-2 rounded-xl border border-[#30363D] focus:outline-none focus:border-orange-500">
              {chefs.map(c => <option key={c._id} value={c._id}>👨‍🍳 {c.name} ({c.staffId})</option>)}
            </select>
          )}
          <div className="flex items-center gap-2 bg-[#161B22] px-4 py-2 rounded-xl border border-[#30363D]">
            <span className="text-sm text-gray-400">{activeChef ? activeChef.name : 'No Chef Selected'}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {activeChef ? activeChef.name.split(' ').map(n => n[0]).join('').slice(0,2) : '?'}
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-6 h-[calc(100vh-80px)]">
          {['new', 'preparing', 'ready'].map(status => {
            const config = STATUS_CONFIG[status];
            const columnOrders = getColumnOrders(status);
            return (
              <div key={status} className={`flex flex-col bg-[#161B22] rounded-2xl border ${config.bg} overflow-hidden`}>
                {/* Column Header */}
                <div className={`flex items-center justify-between px-4 py-3 ${config.headerBg} border-b border-[#30363D]`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${config.dot} animate-pulse`} />
                    <h2 className={`text-sm font-bold tracking-wider ${config.headerText}`}>{config.label} ({columnOrders.length})</h2>
                  </div>
                </div>

                {/* Order Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                  {columnOrders.map(order => {
                    const isDelayed = (Date.now() - new Date(order.createdAt).getTime()) > 15 * 60 * 1000;
                    return (
                      <div key={order._id}
                        className={`bg-[#0D1117] rounded-xl border border-[#30363D] p-4 transition-all hover:border-gray-600 ${isDelayed && status !== 'ready' ? 'animate-pulse-glow border-red-500/50' : ''}`}>
                        {/* Order Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-bold">Table {order.tableNumber}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-500 text-sm">#{order._id.slice(-3)}</span>
                          </div>
                          {isDelayed && status !== 'ready' && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-medium">DELAYED</span>}
                        </div>

                        {/* Items */}
                        <div className="space-y-1.5 mb-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className="text-gray-300">{item.quantity}x {item.name}</span>
                            </div>
                          ))}
                        </div>

                        {/* Timer */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          <OrderTimer createdAt={order.createdAt} />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {status === 'new' && (
                            <>
                              <button onClick={() => updateStatus(order._id, 'preparing')}
                                className="flex-1 py-2 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-lg border border-yellow-500/30 hover:bg-yellow-500/30 transition">
                                Start Prep
                              </button>
                            </>
                          )}
                          {status === 'preparing' && (
                            <>
                              <button onClick={() => updateStatus(order._id, 'ready')}
                                className="flex-1 py-2 bg-green-500/20 text-green-400 text-sm font-bold rounded-lg border border-green-500/30 hover:bg-green-500/30 transition">
                                Ready
                              </button>
                              <button onClick={() => updateStatus(order._id, 'new')}
                                className="py-2 px-3 bg-gray-500/20 text-gray-400 text-sm rounded-lg border border-gray-500/30 hover:bg-gray-500/30 transition">
                                Undo
                              </button>
                            </>
                          )}
                          {status === 'ready' && (
                            <button onClick={() => updateStatus(order._id, 'delivered')}
                              className="flex-1 py-2 bg-green-600/30 text-green-300 text-sm font-bold rounded-lg border border-green-500/40 hover:bg-green-600/40 transition">
                              ✓ Handled
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {columnOrders.length === 0 && (
                    <div className="text-center py-12 text-gray-600">
                      <p className="text-3xl mb-2">{status === 'new' ? '📋' : status === 'preparing' ? '🍳' : '✅'}</p>
                      <p className="text-sm">No orders</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
