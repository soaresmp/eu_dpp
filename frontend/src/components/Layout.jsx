import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Users, BarChart3, ShieldCheck,
  QrCode, Menu, X, ChevronRight, Bell, Search
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/stakeholders', icon: Users, label: 'Stakeholders' },
  { to: '/compliance', icon: ShieldCheck, label: 'Compliance' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/scanner', icon: QrCode, label: 'DPP Scanner' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 eu-gradient text-white transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <EUFlag />
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">EU Digital</div>
              <div className="text-xs text-blue-200 leading-tight">Product Passport</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-blue-200 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* ESPR Badge */}
        <div className="px-4 py-3 border-b border-blue-800">
          <div className="bg-blue-800/50 rounded-lg px-3 py-2">
            <div className="text-xs text-blue-200 font-medium">ESPR Regulation</div>
            <div className="text-xs text-blue-300 mt-0.5">EU 2024/1781 Compliant</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-blue-800">
          <div className="text-xs text-blue-300 text-center">
            <div>EU DPP Portal v1.0</div>
            <div className="mt-1">© 2024 EU Commission</div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-4 lg:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu size={22} />
          </button>

          {/* Breadcrumb on mobile */}
          <div className="flex items-center gap-2 text-sm text-gray-500 lg:hidden">
            <span className="font-semibold text-blue-700">DPP Portal</span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, DPP IDs..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full eu-gradient flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-700">Admin</div>
                <div className="text-xs text-gray-500">EU Registry</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function EUFlag() {
  return (
    <svg viewBox="0 0 20 14" className="w-8 h-6">
      <rect width="20" height="14" fill="#003399" rx="1" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i * 30 - 90) * Math.PI / 180;
        const x = 10 + 4 * Math.cos(angle);
        const y = 7 + 4 * Math.sin(angle);
        return (
          <text key={i} x={x} y={y + 0.5} textAnchor="middle" fontSize="2.5" fill="#FFCC00">★</text>
        );
      })}
    </svg>
  );
}
