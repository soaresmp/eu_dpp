import React, { useEffect, useState } from 'react';
import { Users, Plus, Building2, Mail, Globe, X, Save, AlertCircle } from 'lucide-react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

const ROLES = ['all', 'manufacturer', 'importer', 'distributor', 'retailer', 'recycler', 'regulator'];
const COUNTRIES = ['AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR','HU','IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK','CN','US','IN','JP','KR','GB','NO','CH'];

const emptyForm = { name: '', role: 'manufacturer', email: '', country: 'DE', registration_number: '', address: '' };

export default function Stakeholders() {
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);

  const load = () => {
    setLoading(true);
    api.getStakeholders(filter !== 'all' ? { role: filter } : {})
      .then(setStakeholders).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setError(''); setModalOpen(true); };
  const openEdit = (s) => { setForm({ ...s }); setEditId(s.id); setError(''); setModalOpen(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editId) await api.updateStakeholder(editId, form);
      else await api.createStakeholder(form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const groupedByRole = ROLES.slice(1).reduce((acc, role) => {
    acc[role] = stakeholders.filter(s => s.role === role);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stakeholder Registry</h1>
          <p className="text-sm text-gray-500 mt-0.5">{stakeholders.length} registered entities in the supply chain</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Stakeholder
        </button>
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 flex-wrap">
        {ROLES.map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors
              ${filter === r ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-36 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : stakeholders.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500">No stakeholders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stakeholders.map(s => (
            <div key={s.id} className="card p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEdit(s)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 eu-gradient rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {s.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{s.name}</h3>
                    <StatusBadge status={s.role} />
                  </div>
                </div>
                <span className="text-xl">{countryFlag(s.country)}</span>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500">
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-gray-400" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Globe size={13} className="text-gray-400" />
                  <span>{s.country}</span>
                  {s.registration_number && <span className="text-gray-400">· {s.registration_number}</span>}
                </div>
                {s.address && (
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="text-gray-400" />
                    <span className="truncate">{s.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">{editId ? 'Edit Stakeholder' : 'Add Stakeholder'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="text-red-500 shrink-0" size={16} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company Name *</label>
                  <input required value={form.name} onChange={e => set('name', e.target.value)}
                    placeholder="e.g. EcoTech GmbH"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
                  <select required value={form.role} onChange={e => set('role', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {ROLES.slice(1).map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Country *</label>
                  <select required value={form.country} onChange={e => set('country', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="contact@company.eu"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Registration Number</label>
                  <input value={form.registration_number} onChange={e => set('registration_number', e.target.value)}
                    placeholder="e.g. HRB-123456"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <input value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="Street, City, Country"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? 'Saving...' : <><Save size={16} /> {editId ? 'Update' : 'Add'} Stakeholder</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const countryFlag = (code) => {
  const flags = { DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', NL: '🇳🇱', BE: '🇧🇪', SE: '🇸🇪', PL: '🇵🇱', ES: '🇪🇸', AT: '🇦🇹', DK: '🇩🇰', FI: '🇫🇮', CN: '🇨🇳', US: '🇺🇸', GB: '🇬🇧', JP: '🇯🇵', IN: '🇮🇳', NO: '🇳🇴', CH: '🇨🇭' };
  return flags[code] || '🌐';
};
