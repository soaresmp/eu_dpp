import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, Package, ArrowRight, Leaf, Zap } from 'lucide-react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

const CATEGORIES = ['all', 'Appliances', 'Electronics', 'Textiles', 'Batteries', 'Furniture', 'Construction', 'Chemicals', 'Vehicles'];
const STATUSES = ['all', 'active', 'draft', 'recalled', 'end_of_life'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const status = searchParams.get('status') || 'all';
  const page = parseInt(searchParams.get('page') || '1');

  const load = useCallback(() => {
    setLoading(true);
    api.getProducts({ search, category, status, page, limit: 12 })
      .then(({ products, total }) => { setProducts(products); setTotal(total); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, status, page]);

  useEffect(() => { load(); }, [load]);

  const setParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value === 'all' || !value) delete params[key]; else params[key] = value;
    delete params.page;
    setSearchParams(params);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Registry</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} Digital Product Passports registered</p>
        </div>
        <Link to="/products/new" className="btn-primary">
          <Plus size={16} /> Register New DPP
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && setParam('search', e.target.value)}
            onBlur={e => setParam('search', e.target.value)}
            placeholder="Search products, DPP IDs, manufacturers..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={e => setParam('category', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select
            value={status}
            onChange={e => setParam('status', e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="card p-16 text-center">
          <Package className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-gray-500 font-medium">No products found</h3>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or register a new DPP</p>
          <Link to="/products/new" className="btn-primary mt-4 inline-flex">
            <Plus size={16} /> Register New DPP
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page-1)*12+1}–{Math.min(page*12, total)} of {total}
          </p>
          <div className="flex gap-1">
            {page > 1 && (
              <button onClick={() => setParam('page', page-1)} className="btn-secondary px-3 py-1.5 text-xs">Prev</button>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setParam('page', p)}
                className={`px-3 py-1.5 text-xs rounded-lg ${page === p ? 'bg-blue-700 text-white' : 'btn-secondary'}`}>
                {p}
              </button>
            ))}
            {page < totalPages && (
              <button onClick={() => setParam('page', page+1)} className="btn-secondary px-3 py-1.5 text-xs">Next</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product: p }) {
  const materials = (() => { try { return JSON.parse(p.material_composition || '[]'); } catch { return []; } })();
  const totalRecycled = materials.reduce((sum, m) => sum + (m.percentage || 0) * (m.recycled_content || 0) / 100, 0);

  return (
    <Link to={`/products/${p.id}`}
      className="card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer block">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{p.uid}</p>
        </div>
        <StatusBadge status={p.status} />
      </div>

      {/* Category & Manufacturer */}
      <div className="flex items-center gap-3 mb-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span>{categoryIcon(p.category)}</span> {p.category}
          {p.subcategory && <span className="text-gray-400">/ {p.subcategory}</span>}
        </span>
        {p.manufacturer_name && (
          <>
            <span className="text-gray-300">·</span>
            <span>{p.manufacturer_name}</span>
          </>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Metric label="Carbon" value={p.carbon_footprint ? `${p.carbon_footprint}` : '—'}
          unit="kg CO₂e" icon="🌿" color="text-green-600" />
        <Metric label="Recyclability" value={p.recyclability_score != null ? `${p.recyclability_score}%` : '—'}
          icon={<Leaf size={12} />} color="text-emerald-600" />
        <Metric label="Repairability" value={p.repairability_score != null ? `${p.repairability_score}/10` : '—'}
          icon={<Zap size={12} />} color="text-blue-600" />
      </div>

      {/* Energy class */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {p.energy_class && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${energyClassStyle(p.energy_class)}`}>
              {p.energy_class}
            </span>
          )}
          {p.durability_rating && (
            <span className="text-xs text-gray-500">Durability: {p.durability_rating}</span>
          )}
        </div>
        <ArrowRight size={14} className="text-gray-400" />
      </div>
    </Link>
  );
}

function Metric({ label, value, unit, icon, color }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2 text-center">
      <div className={`text-sm font-semibold ${color}`}>{value}</div>
      {unit && <div className="text-xs text-gray-400">{unit}</div>}
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

const categoryIcon = (cat) => {
  const map = { Appliances: '🏠', Electronics: '⚡', Textiles: '👕', Batteries: '🔋', Furniture: '🪑', Construction: '🏗️', Chemicals: '⚗️', Vehicles: '🚗' };
  return map[cat] || '📦';
};

const energyClassStyle = (cls) => {
  const map = {
    'A+++': 'bg-green-600 text-white', 'A++': 'bg-green-500 text-white', 'A+': 'bg-green-400 text-white',
    'A': 'bg-green-300 text-green-900', 'B': 'bg-yellow-300 text-yellow-900',
    'C': 'bg-orange-300 text-orange-900', 'D': 'bg-orange-500 text-white',
    'E': 'bg-red-400 text-white', 'F': 'bg-red-500 text-white', 'G': 'bg-red-700 text-white'
  };
  return map[cls] || 'bg-gray-200 text-gray-700';
};
