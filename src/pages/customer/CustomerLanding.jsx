import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function CustomerLanding() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const params = new URLSearchParams({ name: name.trim(), phone: phone.trim() });
    navigate(`/table/${tableId}/menu?${params}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-xl shadow-orange-200 mb-4">
            <UtensilsCrossed className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-heading)' }}>The Rustic Table</h1>
          <p className="text-gray-500 mt-1">Scan. Order. Enjoy.</p>
        </div>

        {/* Table Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-100 text-sm font-medium text-orange-700">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Table {tableId}
          </span>
        </div>

        {/* Form Card */}
        <form onSubmit={handleStart} className="bg-white rounded-2xl shadow-xl shadow-orange-100/30 p-6 space-y-4 border border-orange-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Optional"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:shadow-xl hover:from-orange-600 hover:to-red-700 transition-all active:scale-[0.98]">
            Start Ordering →
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">No login required • Just enter your name to begin</p>
      </div>
    </div>
  );
}
