import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../api.js';
import { TrendingUp, Leaf, Recycle, Zap } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 space-y-5">
      {[1,2,3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />)}
    </div>
  );
  if (!data) return <div className="p-6 text-red-500">Failed to load analytics</div>;

  const { sustainability, recycledContent, supplyChainCarbon, complianceRate } = data;

  const carbonData = sustainability.map(s => ({
    name: s.category, carbon: Math.round(s.avg_carbon || 0), count: s.count
  }));

  const radarData = sustainability.map(s => ({
    category: s.category.substring(0, 8),
    recyclability: Math.round(s.avg_recyclability || 0),
    repairability: Math.round((s.avg_repairability || 0) * 10),
    count: s.count,
  }));

  const recycledData = Object.entries(recycledContent).map(([cat, v]) => ({
    name: cat,
    recycled: Math.round(v.total > 0 ? (v.recycled / v.total) * 100 : 0),
    virgin: Math.round(v.total > 0 ? ((v.total - v.recycled) / v.total) * 100 : 100),
  }));

  const compliancePie = [
    { name: 'Compliant', value: complianceRate.compliant || 0, color: '#22c55e' },
    { name: 'Under Review', value: complianceRate.under_review || 0, color: '#3b82f6' },
    { name: 'Non-Compliant', value: complianceRate.non_compliant || 0, color: '#ef4444' },
    { name: 'Pending', value: complianceRate.pending || 0, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const totalCompliance = complianceRate.total || 1;
  const compliancePercent = Math.round(((complianceRate.compliant || 0) / totalCompliance) * 100);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sustainability Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Environmental performance metrics across all registered products</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {sustainability.map((s, i) => (
          <div key={s.category} className="card p-4">
            <div className="text-2xl mb-2">{catIcon(s.category)}</div>
            <div className="font-semibold text-gray-800 text-sm">{s.category}</div>
            <div className="text-xs text-gray-500 mt-1">{s.count} products</div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Recyclability</span>
                <span className="font-medium text-green-600">{Math.round(s.avg_recyclability || 0)}%</span>
              </div>
              {s.avg_repairability && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Repairability</span>
                  <span className="font-medium text-blue-600">{(s.avg_repairability || 0).toFixed(1)}/10</span>
                </div>
              )}
              {s.avg_carbon && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Avg. Carbon</span>
                  <span className="font-medium text-orange-600">{Math.round(s.avg_carbon)} kg</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carbon Footprint by Category */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Average Carbon Footprint by Category</h3>
          <p className="text-xs text-gray-500 mb-4">kg CO₂ equivalent per product</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={carbonData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [`${v.toLocaleString()} kg CO₂e`, 'Avg. Carbon']}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="carbon" radius={[4, 4, 0, 0]}>
                {carbonData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recyclability & Repairability Radar */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Sustainability Performance Radar</h3>
          <p className="text-xs text-gray-500 mb-4">Recyclability (%) vs Repairability (×10) by category</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 5, right: 30, bottom: 5, left: 30 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="Recyclability" dataKey="recyclability" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Radar name="Repairability ×10" dataKey="repairability" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recycled vs Virgin Materials */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Recycled Content by Category</h3>
          <p className="text-xs text-gray-500 mb-4">Percentage of recycled vs virgin materials</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={recycledData} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`]} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="recycled" name="Recycled %" stackId="a" fill="#10b981" />
              <Bar dataKey="virgin" name="Virgin %" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Compliance Status Distribution</h3>
          <p className="text-xs text-gray-500 mb-4">Across all {totalCompliance} compliance checks</p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie data={compliancePie} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {compliancePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              <div className="text-center mb-3">
                <div className="text-3xl font-bold text-green-600">{compliancePercent}%</div>
                <div className="text-xs text-gray-500">Compliance Rate</div>
              </div>
              {compliancePie.map(d => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Supply Chain Carbon Breakdown */}
      {supplyChainCarbon.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Supply Chain Carbon Breakdown</h3>
          <p className="text-xs text-gray-500 mb-4">Carbon footprint across supply chain stages per product</p>
          <div className="space-y-6">
            {supplyChainCarbon.map(p => {
              const total = p.stages.reduce((s, st) => s + (st.carbon_kg || 0), 0);
              return (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{p.name}</span>
                    <span className="text-sm font-bold text-orange-600">{total.toLocaleString()} kg CO₂e</span>
                  </div>
                  <div className="flex h-4 rounded-full overflow-hidden gap-px">
                    {p.stages.map((stage, i) => {
                      const pct = total > 0 ? (stage.carbon_kg / total) * 100 : 0;
                      return pct > 0 ? (
                        <div key={i} style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                          title={`${stage.stage}: ${stage.carbon_kg} kg (${pct.toFixed(1)}%)`}
                          className="transition-all hover:opacity-80 cursor-pointer" />
                      ) : null;
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {p.stages.map((stage, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {stage.stage}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const catIcon = (cat) => {
  const map = { Appliances: '🏠', Electronics: '⚡', Textiles: '👕', Batteries: '🔋', Furniture: '🪑' };
  return map[cat] || '📦';
};
