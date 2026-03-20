import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Users, ShieldCheck, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, ArrowRight, Recycle, Zap, Leaf
} from 'lucide-react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data) return <div className="p-8 text-red-600">Failed to load dashboard</div>;

  const { stats, byCategory, byStatus, recentProducts, recentEvents, complianceOverview } = data;
  const complianceRate = complianceOverview?.find(c => c.status === 'compliant')?.count || 0;
  const totalCompliance = complianceOverview?.reduce((s, c) => s + c.count, 0) || 1;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">EU Digital Product Passport Registry — ESPR Overview</p>
      </div>

      {/* EU Regulation Banner */}
      <div className="eu-gradient rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🇪🇺</span>
              <h2 className="text-lg font-bold">Ecodesign for Sustainable Products Regulation</h2>
            </div>
            <p className="text-blue-200 text-sm">ESPR (EU) 2024/1781 · Digital Product Passport Compliance Platform</p>
          </div>
          <div className="flex gap-4 text-center">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{stats.total_products}</div>
              <div className="text-xs text-blue-200">Active DPPs</div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <div className="text-2xl font-bold">{Math.round((complianceRate / totalCompliance) * 100)}%</div>
              <div className="text-xs text-blue-200">Compliance Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Package} iconBg="bg-blue-100" iconColor="text-blue-600"
          label="Total Products" value={stats.total_products}
          sub={`${stats.active_products} active`}
        />
        <KpiCard
          icon={Users} iconBg="bg-purple-100" iconColor="text-purple-600"
          label="Stakeholders" value={stats.total_stakeholders}
          sub="Registered entities"
        />
        <KpiCard
          icon={Recycle} iconBg="bg-green-100" iconColor="text-green-600"
          label="Avg. Recyclability" value={`${Math.round(stats.avg_recyclability || 0)}%`}
          sub="Across all products"
        />
        <KpiCard
          icon={AlertTriangle} iconBg="bg-red-100" iconColor="text-red-600"
          label="Recalled Products" value={stats.recalled_products || 0}
          sub="Require attention"
        />
      </div>

      {/* Sustainability Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Leaf className="text-green-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg. Recyclability</div>
              <div className="text-2xl font-bold text-gray-900">{Math.round(stats.avg_recyclability || 0)}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.avg_recyclability || 0}%` }} />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Zap className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg. Repairability</div>
              <div className="text-2xl font-bold text-gray-900">{(stats.avg_repairability || 0).toFixed(1)}/10</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(stats.avg_repairability || 0) * 10}%` }} />
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Carbon Footprint</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.total_carbon ? `${(stats.total_carbon / 1000).toFixed(1)}t` : 'N/A'}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">CO₂ equivalent across all products</div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent Products</h3>
            <Link to="/products" className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProducts.map(p => (
              <Link key={p.id} to={`/products/${p.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${categoryBg(p.category)}`}>
                  {categoryIcon(p.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.uid} · {p.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <ArrowRight size={14} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Compliance Overview */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Compliance</h3>
              <Link to="/compliance" className="text-xs text-blue-600 hover:text-blue-800">View all</Link>
            </div>
            <div className="space-y-2">
              {complianceOverview.map(c => (
                <div key={c.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.status === 'compliant' && <CheckCircle2 size={14} className="text-green-500" />}
                    {c.status === 'non_compliant' && <AlertTriangle size={14} className="text-red-500" />}
                    {c.status === 'pending' && <Clock size={14} className="text-yellow-500" />}
                    {c.status === 'under_review' && <ShieldCheck size={14} className="text-blue-500" />}
                    <span className="text-sm text-gray-600 capitalize">{c.status.replace('_', ' ')}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{c.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Products by Category */}
          <div className="card p-4">
            <h3 className="font-semibold text-gray-800 mb-3">By Category</h3>
            <div className="space-y-2">
              {byCategory.slice(0, 5).map(c => (
                <div key={c.category} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 flex-1">{c.category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${(c.count / stats.total_products) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-4 text-right">{c.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Recent Lifecycle Events</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {recentEvents.slice(0, 8).map(e => (
            <div key={e.id} className="flex items-start gap-4 px-5 py-3">
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs ${eventBg(e.event_type)}`}>
                {eventIcon(e.event_type)}
              </div>
              <div className="flex-1">
                <div className="text-sm">
                  <Link to={`/products/${e.product_id}`} className="font-medium text-gray-800 hover:text-blue-600">
                    {e.product_name}
                  </Link>
                  <span className="text-gray-500"> — {e.description || e.event_type}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {e.actor_name && <span>{e.actor_name} · </span>}
                  {e.location && <span>{e.location} · </span>}
                  {new Date(e.event_date).toLocaleDateString('en-EU', { dateStyle: 'medium' })}
                </div>
              </div>
              <span className={`badge text-xs ${eventBadge(e.event_type)}`}>{e.event_type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, iconBg, iconColor, label, value, sub }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{sub}</p>
        </div>
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={iconColor} size={20} />
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}

const categoryBg = (cat) => {
  const map = { Appliances: 'bg-blue-50', Electronics: 'bg-yellow-50', Textiles: 'bg-pink-50', Batteries: 'bg-green-50' };
  return map[cat] || 'bg-gray-50';
};

const categoryIcon = (cat) => {
  const map = { Appliances: '🏠', Electronics: '⚡', Textiles: '👕', Batteries: '🔋', Furniture: '🪑' };
  return map[cat] || '📦';
};

const eventBg = (type) => {
  const map = { manufactured: 'bg-blue-100', sold: 'bg-green-100', repaired: 'bg-yellow-100', recalled: 'bg-red-100', recycled: 'bg-purple-100' };
  return map[type] || 'bg-gray-100';
};

const eventIcon = (type) => {
  const map = { manufactured: '🏭', imported: '🚢', distributed: '🚛', sold: '🛒', repaired: '🔧', recalled: '⚠️', recycled: '♻️', updated: '🔄' };
  return map[type] || '📋';
};

const eventBadge = (type) => {
  const map = { manufactured: 'bg-blue-100 text-blue-700', sold: 'bg-green-100 text-green-700', repaired: 'bg-yellow-100 text-yellow-700', recalled: 'bg-red-100 text-red-700', recycled: 'bg-purple-100 text-purple-700' };
  return map[type] || 'bg-gray-100 text-gray-700';
};
