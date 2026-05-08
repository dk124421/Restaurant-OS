import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag, DollarSign, BarChart3 } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!data) return <p className="text-gray-500">Failed to load analytics</p>;

  const stats = [
    { label: 'Revenue', value: `₹${data.revenue.toLocaleString()}`, change: '+0.5%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'Orders', value: data.totalOrders, change: '+6.5%', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Avg Order Value', value: `₹${data.avgOrderValue}`, change: '', icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
  ];

  const lineData = {
    labels: data.revenueTrend.map(d => d.date),
    datasets: [{
      label: 'Revenue',
      data: data.revenueTrend.map(d => d.revenue),
      borderColor: '#7C3AED',
      backgroundColor: 'rgba(124,58,237,0.08)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: '#7C3AED',
      borderWidth: 2,
    }]
  };

  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1F2937', padding: 12, cornerRadius: 8, titleFont: { size: 13 }, bodyFont: { size: 13 }, callbacks: { label: (ctx) => `Revenue: ₹${ctx.raw.toLocaleString()}` } } },
    scales: { x: { grid: { display: false }, ticks: { color: '#9CA3AF', font: { size: 12 } } }, y: { grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF', font: { size: 12 }, callback: v => `₹${v}` } } }
  };

  const donutData = {
    labels: Object.keys(data.statusCounts),
    datasets: [{
      data: Object.values(data.statusCounts),
      backgroundColor: ['#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'],
      borderWidth: 0,
    }]
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border ${s.border}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{s.label}</span>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">{s.value}</p>
            {s.change && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">{s.change}</span>
                <span className="text-xs text-gray-400">Revenue this Month</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Revenue Trend (Daily)</h3>
          <div className="h-64"><Line data={lineData} options={lineOpts} /></div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">Order Status</h3>
          <div className="h-48 flex items-center justify-center"><Doughnut data={donutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 11 } } } } }} /></div>
        </div>
      </div>

      {/* Popular Items */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Most Popular Dishes</h3>
        <div className="space-y-3">
          {data.popularItems.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-100 text-gray-600' : 'bg-orange-50 text-orange-600'}`}>{idx + 1}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400">{item.quantity} ordered</p>
              </div>
              <span className="text-sm font-semibold text-gray-700">₹{item.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
