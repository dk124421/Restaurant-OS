import { Link } from 'react-router-dom';
import { ChefHat, ShoppingBag, LayoutDashboard, Monitor, Users } from 'lucide-react';

const modules = [
  { title: 'Customer Menu', desc: 'QR-based digital menu for table ordering', icon: ShoppingBag, path: '/table/5', gradient: 'from-orange-500 to-red-600', color: '#E85D04' },
  { title: 'Kitchen Dashboard', desc: 'Real-time order management for chefs', icon: ChefHat, path: '/kitchen', gradient: 'from-slate-700 to-slate-900', color: '#334155' },
  { title: 'Admin Panel', desc: 'Analytics, menu & operations management', icon: LayoutDashboard, path: '/admin', gradient: 'from-violet-600 to-purple-800', color: '#7C3AED' },
  { title: 'Reception POS', desc: 'Point of sale & billing system', icon: Monitor, path: '/pos', gradient: 'from-emerald-500 to-teal-700', color: '#10B981' },
  { title: 'Waiter Panel', desc: 'Table status & delivery tracking', icon: Users, path: '/waiter', gradient: 'from-blue-500 to-indigo-700', color: '#3B82F6' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 mb-6 shadow-lg shadow-orange-500/30">
          <ChefHat className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
          Restaurant <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">OS</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-md mx-auto">Complete restaurant management — from order to table.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
        {modules.map((mod, i) => (
          <Link key={mod.path} to={mod.path}
            className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl animate-slide-up"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'backwards', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl" style={{ background: `radial-gradient(circle at 50% 50%, ${mod.color}, transparent 70%)` }} />
            <div className="relative z-10">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${mod.gradient} mb-4 shadow-lg`}>
                <mod.icon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{mod.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed">{mod.desc}</p>
              <div className="mt-4 flex items-center text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                Open Module
                <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-slate-600 text-sm mt-12">React + Express + MongoDB + Socket.IO</p>
    </div>
  );
}
