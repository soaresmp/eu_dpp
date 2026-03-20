import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, X, Save, Filter
} from 'lucide-react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

const EU_REGULATIONS = [
  'ESPR Regulation (EU) 2024/1781',
  'EU Battery Regulation 2023/1542',
  'RoHS Directive 2011/65/EU',
  'WEEE Directive 2012/19/EU',
  'REACH Regulation (EC) No 1907/2006',
  'Ecodesign Directive 2009/125/EC',
  'Energy Labelling Regulation (EU) 2017/1369',
  'Construction Products Regulation (EU) No 305/2011',
  'Medical Devices Regulation (EU) 2017/745',
  'General Product Safety Regulation (EU) 2023/988',
];

const STATUS_FILTERS = ['all', 'compliant', 'non_compliant', 'pending', 'under_review'];

export default function Compliance() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.getCompliance().then(setChecks).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = statusFilter === 'all' ? checks : checks.filter(c => c.status === statusFilter);

  const stats = {
    total: checks.length,
    compliant: checks.filter(c => c.status === 'compliant').length,
    non_compliant: checks.filter(c => c.status === 'non_compliant').length,
    pending: checks.filter(c => c.status === 'pending').length,
    under_review: checks.filter(c => c.status === 'under_review').length,
  };

  const openEdit = (check) => {
    setEditModal(check);
    setEditForm({ status: check.status, checked_by: check.checked_by || '', notes: check.notes || '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateCompliance(editModal.id, editForm);
      setEditModal(null);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const regulationGroups = {};
  filtered.forEach(c => {
    if (!regulationGroups[c.regulation]) regulationGroups[c.regulation] = [];
    regulationGroups[c.regulation].push(c);
  });

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Tracker</h1>
        <p className="text-sm text-gray-500 mt-0.5">EU Regulatory Compliance Monitoring</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={CheckCircle2} iconColor="text-green-500" label="Compliant" value={stats.compliant}
          pct={Math.round((stats.compliant / (stats.total || 1)) * 100)} color="bg-green-50 border-green-200" />
        <StatCard icon={AlertTriangle} iconColor="text-red-500" label="Non-Compliant" value={stats.non_compliant}
          pct={Math.round((stats.non_compliant / (stats.total || 1)) * 100)} color="bg-red-50 border-red-200" />
        <StatCard icon={Clock} iconColor="text-yellow-500" label="Pending" value={stats.pending}
          pct={Math.round((stats.pending / (stats.total || 1)) * 100)} color="bg-yellow-50 border-yellow-200" />
        <StatCard icon={ShieldCheck} iconColor="text-blue-500" label="Under Review" value={stats.under_review}
          pct={Math.round((stats.under_review / (stats.total || 1)) * 100)} color="bg-blue-50 border-blue-200" />
      </div>

      {/* Overall Compliance Bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Overall Compliance Rate</h3>
          <span className="text-2xl font-bold text-green-600">
            {Math.round((stats.compliant / (stats.total || 1)) * 100)}%
          </span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {stats.compliant > 0 && (
            <div className="bg-green-500 transition-all" style={{ width: `${(stats.compliant / stats.total) * 100}%` }} />
          )}
          {stats.under_review > 0 && (
            <div className="bg-blue-500 transition-all" style={{ width: `${(stats.under_review / stats.total) * 100}%` }} />
          )}
          {stats.pending > 0 && (
            <div className="bg-yellow-400 transition-all" style={{ width: `${(stats.pending / stats.total) * 100}%` }} />
          )}
          {stats.non_compliant > 0 && (
            <div className="bg-red-500 transition-all" style={{ width: `${(stats.non_compliant / stats.total) * 100}%` }} />
          )}
        </div>
        <div className="flex gap-4 mt-2">
          {[
            { color: 'bg-green-500', label: 'Compliant' },
            { color: 'bg-blue-500', label: 'Under Review' },
            { color: 'bg-yellow-400', label: 'Pending' },
            { color: 'bg-red-500', label: 'Non-Compliant' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors
              ${statusFilter === s ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
            {s !== 'all' && <span className="ml-1.5 text-xs opacity-70">{stats[s] || 0}</span>}
          </button>
        ))}
      </div>

      {/* Compliance by Regulation */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(regulationGroups).map(([regulation, items]) => (
            <div key={regulation} className="card overflow-hidden">
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">{regulation}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{items.length} products checked</p>
                </div>
                <div className="flex gap-1">
                  {['compliant', 'non_compliant', 'pending', 'under_review'].map(s => {
                    const count = items.filter(i => i.status === s).length;
                    return count > 0 ? <StatusBadge key={s} status={s} /> : null;
                  })}
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(c => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      c.status === 'compliant' ? 'bg-green-500' :
                      c.status === 'non_compliant' ? 'bg-red-500' :
                      c.status === 'under_review' ? 'bg-blue-500' : 'bg-yellow-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${c.product_id}`} className="text-sm font-medium text-gray-800 hover:text-blue-600 truncate block">
                        {c.product_name}
                      </Link>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {c.product_uid} · {c.category}
                        {c.notes && <span> · {c.notes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={c.status} />
                      <button onClick={() => openEdit(c)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(regulationGroups).length === 0 && (
            <div className="card p-12 text-center">
              <ShieldCheck className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No compliance checks found</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Update Compliance Status</h3>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <div className="font-medium text-gray-700">{editModal.product_name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{editModal.regulation}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="pending">Pending</option>
                  <option value="compliant">Compliant</option>
                  <option value="non_compliant">Non-Compliant</option>
                  <option value="under_review">Under Review</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Checked By</label>
                <input value={editForm.checked_by} onChange={e => setEditForm(f => ({ ...f, checked_by: e.target.value }))}
                  placeholder="Name / Organization"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3} placeholder="Compliance notes..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditModal(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Saving...' : <><Save size={16} /> Update</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, iconColor, label, value, pct, color }) {
  return (
    <div className={`card p-4 border ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={iconColor} size={18} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{pct}% of total</div>
    </div>
  );
}
