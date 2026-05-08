import { useState, useEffect } from 'react';
import { Clock, Search, Filter, ChevronDown, ChevronUp, ChefHat, Users, Monitor, User, ArrowRight, ArrowLeft } from 'lucide-react';

const STATUS_BADGE = {
  new: 'bg-orange-100 text-orange-700 border-orange-200',
  preparing: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  ready: 'bg-blue-100 text-blue-700 border-blue-200',
  delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  paid: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const ROLE_ICON = { customer: User, chef: ChefHat, waiter: Users, pos: Monitor, system: Monitor, admin: Monitor };

export default function OrderHistory() {
  const [data, setData] = useState({ orders: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [search, setSearch] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = (pg = page) => {
    setLoading(true);
    const params = new URLSearchParams({ page: pg, limit: 20 });
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterDate) params.set('date', filterDate);
    fetch(`/api/orders/history?${params}`).then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(1); setPage(1); }, [filterStatus, filterDate]);

  const changePage = (newPage) => { setPage(newPage); fetchOrders(newPage); };

  const filteredOrders = data.orders.filter(o => {
    if (!search) return true;
    return o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o._id.includes(search) ||
      o.tableNumber.toString() === search ||
      o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
  });

  const formatTime = (ts) => new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (ts) => new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });
  const formatFull = (ts) => new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Order History</h2>
        <p className="text-sm text-gray-500 mt-0.5">Full order lifecycle — who ordered, prepared, served, and billed</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Orders', value: data.total, color: 'violet' },
          { label: 'Active', value: data.orders.filter(o => ['new', 'preparing', 'ready'].includes(o.status)).length, color: 'orange' },
          { label: 'Completed', value: data.orders.filter(o => o.status === 'paid').length, color: 'green' },
          { label: 'Delivered', value: data.orders.filter(o => o.status === 'delivered').length, color: 'blue' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer, table, order ID, or dish..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-violet-300" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-violet-300">
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:border-violet-300" />
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const expanded = expandedOrder === order._id;
            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all hover:shadow-sm">
                {/* Order Row */}
                <button onClick={() => setExpandedOrder(expanded ? null : order._id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900">Order #{order._id.slice(-6)}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">Table {order.tableNumber}</span>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${STATUS_BADGE[order.status] || STATUS_BADGE.new}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>👤 {order.customerName}</span>
                      {order.preparedBy && <span>👨‍🍳 {order.preparedBy}</span>}
                      {order.servedBy && <span>🧑‍🍽️ {order.servedBy}</span>}
                      {order.billedBy && <span>🧾 {order.billedBy}</span>}
                    </div>
                  </div>
                  {/* Amount & Time */}
                  <div className="text-right shrink-0">
                    <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)} {formatTime(order.createdAt)}</p>
                  </div>
                  {/* Chevron */}
                  {expanded ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                </button>

                {/* Expanded Details */}
                {expanded && (
                  <div className="px-5 pb-5 border-t border-gray-100 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                      {/* Items */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                <span className="text-sm text-gray-400">x{item.quantity}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-700">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        {/* Summary */}
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                          <div className="flex justify-between text-sm"><span className="text-gray-500">Total</span><span className="font-bold text-gray-900">₹{order.totalAmount}</span></div>
                          {order.paymentMethod !== 'pending' && (
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Payment</span><span className="font-medium text-gray-700 uppercase">{order.paymentMethod}</span></div>
                          )}
                          {order.notes && <div className="flex justify-between text-sm"><span className="text-gray-500">Notes</span><span className="text-gray-700">{order.notes}</span></div>}
                        </div>
                      </div>

                      {/* Status Timeline */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Status Timeline</h4>
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                          <div className="space-y-4">
                            {(order.statusHistory || []).map((h, idx) => {
                              const RoleIcon = ROLE_ICON[h.changedByRole] || User;
                              return (
                                <div key={idx} className="flex items-start gap-3 relative">
                                  <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    idx === (order.statusHistory?.length || 0) - 1
                                      ? 'bg-violet-100 ring-2 ring-violet-300'
                                      : 'bg-gray-100'
                                  }`}>
                                    <RoleIcon className={`w-4 h-4 ${idx === (order.statusHistory?.length || 0) - 1 ? 'text-violet-600' : 'text-gray-500'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border capitalize ${STATUS_BADGE[h.status] || STATUS_BADGE.new}`}>
                                        {h.status}
                                      </span>
                                      <span className="text-xs text-gray-500">by</span>
                                      <span className="text-sm font-medium text-gray-900">{h.changedBy}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">{formatFull(h.timestamp)}</p>
                                  </div>
                                </div>
                              );
                            })}
                            {(!order.statusHistory || order.statusHistory.length === 0) && (
                              <p className="text-sm text-gray-400 pl-12">No history available</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Staff Info */}
                      <div className="lg:col-span-2">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Staff Assignments</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                            <p className="text-[10px] text-orange-600 uppercase font-bold mb-1">Ordered By</p>
                            <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                            {order.customerPhone && <p className="text-xs text-gray-500">{order.customerPhone}</p>}
                          </div>
                          <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                            <p className="text-[10px] text-yellow-600 uppercase font-bold mb-1">Prepared By</p>
                            <p className="text-sm font-medium text-gray-900">{order.preparedBy || '—'}</p>
                          </div>
                          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                            <p className="text-[10px] text-blue-600 uppercase font-bold mb-1">Served By</p>
                            <p className="text-sm font-medium text-gray-900">{order.servedBy || '—'}</p>
                          </div>
                          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                            <p className="text-[10px] text-green-600 uppercase font-bold mb-1">Billed By</p>
                            <p className="text-sm font-medium text-gray-900">{order.billedBy || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredOrders.length === 0 && <div className="text-center py-16 text-gray-400"><Clock className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No orders found</p></div>}

          {/* Pagination */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">Page {data.page} of {data.pages} ({data.total} total)</p>
              <div className="flex gap-2">
                <button onClick={() => changePage(page - 1)} disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
                  <ArrowLeft className="w-4 h-4" /> Prev
                </button>
                <button onClick={() => changePage(page + 1)} disabled={page >= data.pages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
