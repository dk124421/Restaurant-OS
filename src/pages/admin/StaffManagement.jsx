import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, UserCheck, UserX, X, Users, ChefHat, Monitor, Shield, Search, Eye, EyeOff } from 'lucide-react';

const ROLE_CONFIG = {
  waiter: { label: 'Waiter', icon: Users, color: 'blue', prefix: 'W', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  chef: { label: 'Chef', icon: ChefHat, color: 'orange', prefix: 'C', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  pos: { label: 'POS Operator', icon: Monitor, color: 'emerald', prefix: 'P', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  admin: { label: 'Admin', icon: Shield, color: 'violet', prefix: 'A', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
};

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showPin, setShowPin] = useState({});
  const [form, setForm] = useState({ name: '', role: 'waiter', pin: '', phone: '' });

  const fetchStaff = () => {
    fetch('/api/staff').then(r => r.json()).then(d => { setStaff(d); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(fetchStaff, []);

  const filtered = staff.filter(s => {
    if (filterRole && s.role !== filterRole) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.staffId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roleCounts = { waiter: 0, chef: 0, pos: 0, admin: 0 };
  staff.forEach(s => { if (roleCounts[s.role] !== undefined) roleCounts[s.role]++; });

  const openAdd = () => { setEditItem(null); setForm({ name: '', role: 'waiter', pin: '', phone: '' }); setShowModal(true); };
  const openEdit = (s) => { setEditItem(s); setForm({ name: s.name, role: s.role, pin: s.pin, phone: s.phone }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name || !form.pin) return;
    if (editItem) {
      await fetch(`/api/staff/${editItem._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    } else {
      await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    }
    setShowModal(false);
    fetchStaff();
  };

  const handleDelete = async (id) => { if (!confirm('Delete this staff member?')) return; await fetch(`/api/staff/${id}`, { method: 'DELETE' }); fetchStaff(); };
  const toggleActive = async (id) => { await fetch(`/api/staff/${id}/toggle`, { method: 'PATCH' }); fetchStaff(); };
  const togglePinVisibility = (id) => setShowPin(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Staff Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage Waiter, Chef, POS & Admin accounts</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 transition shadow-sm">
          <Plus className="w-4 h-4" /> Add Staff
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(ROLE_CONFIG).map(([role, config]) => {
          const RoleIcon = config.icon;
          return (
            <button key={role} onClick={() => setFilterRole(filterRole === role ? '' : role)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${filterRole === role ? `${config.bg} ${config.border} shadow-sm` : 'bg-white border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <RoleIcon className={`w-5 h-5 ${filterRole === role ? config.text : 'text-gray-400'}`} />
                <span className="text-2xl font-bold text-gray-900">{roleCounts[role]}</span>
              </div>
              <p className={`text-sm font-medium ${filterRole === role ? config.text : 'text-gray-600'}`}>{config.label}s</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-violet-300" />
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 font-semibold text-gray-600">Staff ID</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Role</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Phone</th>
                <th className="px-5 py-3 font-semibold text-gray-600">PIN</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Joined</th>
                <th className="px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => {
                const config = ROLE_CONFIG[s.role] || ROLE_CONFIG.waiter;
                return (
                  <tr key={s._id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${config.badge}`}>{s.staffId}</span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                          <span className={`text-xs font-bold ${config.text}`}>{s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                        </div>
                        <span className="font-medium text-gray-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium capitalize ${config.text}`}>{config.label}</span></td>
                    <td className="px-5 py-3 text-gray-500">{s.phone || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-gray-700">{showPin[s._id] ? s.pin : '••••'}</span>
                        <button onClick={() => togglePinVisibility(s._id)} className="p-1 rounded hover:bg-gray-100">
                          {showPin[s._id] ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(s._id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition ${
                          s.isActive ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                        }`}>
                        {s.isActive ? <><UserCheck className="w-3 h-3" /> Active</> : <><UserX className="w-3 h-3" /> Inactive</>}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{new Date(s.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-400"><p>No staff found</p></div>}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editItem ? 'Edit Staff' : 'Create Staff Account'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter full name" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                    const RoleIcon = config.icon;
                    return (
                      <button key={role} type="button" onClick={() => setForm({ ...form, role })}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                          form.role === role ? `${config.bg} ${config.border} ${config.text}` : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>
                        <RoleIcon className="w-4 h-4" /> {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">PIN * (4 digits)</label>
                  <input type="text" value={form.pin} onChange={e => setForm({ ...form, pin: e.target.value.replace(/[^0-9]/g, '').slice(0, 4) })}
                    maxLength={4} placeholder="0000" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono tracking-widest focus:outline-none focus:border-violet-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="Optional" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-300" />
                </div>
              </div>
              {!editItem && (
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-500">A unique Staff ID (<span className="font-bold">{ROLE_CONFIG[form.role]?.prefix}XXX</span>) will be auto-generated on creation.</p>
                </div>
              )}
              <button onClick={handleSave} disabled={!form.name || !form.pin || form.pin.length < 4}
                className="w-full py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {editItem ? 'Update Staff' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
