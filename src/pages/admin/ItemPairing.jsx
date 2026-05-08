import { useState, useEffect } from 'react';
import { Link2, ArrowRight, Check, X } from 'lucide-react';

export default function ItemPairing() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [extras, setExtras] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu').then(r => r.json()).then(d => {
      setItems(d.filter(i => i.category !== 'Extras'));
      setExtras(d.filter(i => i.category === 'Extras'));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const togglePairing = (extraId) => {
    if (!selected) return;
    setSelected(prev => {
      const pairings = prev.pairings || [];
      const pairingIds = pairings.map(p => p._id || p);
      if (pairingIds.includes(extraId)) {
        return { ...prev, pairings: pairings.filter(p => (p._id || p) !== extraId) };
      }
      return { ...prev, pairings: [...pairings, extraId] };
    });
  };

  const savePairings = async () => {
    if (!selected) return;
    setSaving(true);
    const pairingIds = (selected.pairings || []).map(p => p._id || p);
    await fetch(`/api/menu/${selected._id}/pairings`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pairings: pairingIds })
    });
    setSaving(false);
    // Refresh
    const data = await fetch('/api/menu').then(r => r.json());
    setItems(data.filter(i => i.category !== 'Extras'));
    setExtras(data.filter(i => i.category === 'Extras'));
    const updated = data.find(i => i._id === selected._id);
    if (updated) setSelected(updated);
  };

  const isPaired = (extraId) => {
    if (!selected) return false;
    return (selected.pairings || []).some(p => (p._id || p) === extraId);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>Item Pairing & Suggestions</h2>
        <p className="text-sm text-gray-500 mt-1">Rule-based add-on up-selling configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Menu Items</h3>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-50">
            {items.map(item => (
              <button key={item._id} onClick={() => setSelected(item)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition hover:bg-gray-50 ${selected?._id === item._id ? 'bg-violet-50 border-l-4 border-violet-500' : ''}`}>
                <span className="text-xl">{item.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.category} • ₹{item.price}</p>
                </div>
                {(item.pairings?.length > 0) && (
                  <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">{item.pairings.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Rule Builder */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Rule Builder</h3>
                  <p className="text-sm text-gray-500 mt-1">If customer orders <span className="font-semibold text-violet-600">{selected.name}</span>, suggest:</p>
                </div>
                <button onClick={savePairings} disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition disabled:opacity-60">
                  {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  Save
                </button>
              </div>

              {/* Visual Rule */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                <div className="flex items-center gap-3 text-sm">
                  <div className="bg-violet-100 rounded-lg px-3 py-2 text-violet-700 font-medium">If Main Dish</div>
                  <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="bg-orange-100 rounded-lg px-3 py-2 text-orange-700 font-medium">
                    {selected.image} {selected.name}
                  </div>
                </div>
              </div>

              {/* Add-on Selection */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {extras.map(extra => {
                  const paired = isPaired(extra._id);
                  return (
                    <button key={extra._id} onClick={() => togglePairing(extra._id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        paired ? 'border-violet-500 bg-violet-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      {paired && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <span className="text-2xl block mb-1">{extra.image}</span>
                      <p className="font-medium text-gray-900 text-sm">{extra.name}</p>
                      <p className="text-xs text-gray-500">₹{extra.price}</p>
                      <p className="text-[10px] text-violet-500 mt-1 font-medium">Suggest (+₹{extra.price})</p>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Link2 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">Select an item to configure pairings</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
