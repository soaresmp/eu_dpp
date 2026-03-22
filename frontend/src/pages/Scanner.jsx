import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, ArrowRight, Package, AlertCircle, CheckCircle2, Scan } from 'lucide-react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function Scanner() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const product = await api.getProduct(query.trim());
      setResult(product);
    } catch (err) {
      setError('No Digital Product Passport found for this identifier. Please check the DPP ID, UID, or URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractIdFromUrl = (input) => {
    try {
      const url = new URL(input);
      const parts = url.pathname.split('/');
      const productsIdx = parts.indexOf('products');
      if (productsIdx >= 0 && parts[productsIdx + 1]) {
        return parts[productsIdx + 1];
      }
    } catch {}
    return input;
  };

  const handleInput = (value) => {
    const extracted = extractIdFromUrl(value);
    setQuery(extracted);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 eu-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">DPP Scanner & Lookup</h1>
        <p className="text-gray-500 text-sm mt-2">
          Enter a Digital Product Passport ID, scan a QR code URL, or paste a product link to retrieve full passport data
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <form onSubmit={(e) => { const id = extractIdFromUrl(query); setQuery(id); handleSearch(e); }}>
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => handleInput(e.target.value)}
              placeholder="EU-DPP-xxxx-xxx or paste QR code URL..."
              className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <button type="submit" disabled={loading || !query.trim()}
            className="w-full mt-3 btn-primary justify-center py-2.5">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Looking up passport...
              </span>
            ) : (
              <><Scan size={18} /> Lookup DPP</>
            )}
          </button>
        </form>

        {/* Quick examples */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">Try a sample DPP lookup:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Washing Machine', uid: 'EU-DPP-2024-PW9000', icon: '🏠' },
              { label: 'Solar Panel',     uid: 'EU-DPP-2024-SM400',  icon: '⚡' },
              { label: 'T-Shirt',         uid: 'EU-DPP-2024-EWTS',   icon: '👕' },
              { label: 'EV Battery',      uid: 'EU-DPP-2024-LP75',   icon: '🔋' },
            ].map(item => (
              <button key={item.uid} onClick={() => loadById(item.uid)}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                {item.icon} {item.label} →
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card p-5 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5 shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-red-800">Product Not Found</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Result */}
      {result && <ProductPassportPreview product={result} onView={() => navigate(`/products/${result.id}`)} />}

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: '📱', title: 'QR Code Scan',
            desc: 'Scan a physical product QR code to retrieve its Digital Product Passport instantly'
          },
          {
            icon: '🔍', title: 'ID Lookup',
            desc: 'Enter the EU-DPP identifier printed on the product label or packaging'
          },
          {
            icon: '🔗', title: 'URL Input',
            desc: 'Paste a product passport URL directly from the EU DPP Registry'
          },
        ].map(item => (
          <div key={item.title} className="card p-4 text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <h3 className="font-semibold text-gray-700 text-sm">{item.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* EU DPP Info */}
      <div className="card p-5 eu-gradient text-white">
        <h3 className="font-bold mb-2">🇪🇺 About Digital Product Passports</h3>
        <p className="text-sm text-blue-100">
          Under the EU Ecodesign for Sustainable Products Regulation (ESPR), all covered products must carry
          a Digital Product Passport containing sustainability data, material composition, repairability
          information, and lifecycle tracking — accessible via QR code or unique identifier.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          {['Material Composition', 'Carbon Footprint', 'Recyclability Score', 'Repairability Index',
            'Hazardous Substances', 'Certifications', 'Supply Chain Data', 'Lifecycle Events'].map(item => (
            <div key={item} className="flex items-center gap-1.5 text-blue-200">
              <CheckCircle2 size={12} />
              <span className="text-xs">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  async function loadById(uid) {
    setLoading(true);
    setError('');
    setResult(null);
    setQuery(uid);
    try {
      const product = await api.getProduct(uid);
      setResult(product);
    } catch {
      setError('Product not found. The sample data may not be available in this environment.');
    } finally {
      setLoading(false);
    }
  }
}

function ProductPassportPreview({ product, onView }) {
  const materials = product.material_composition || [];
  const totalRecycled = materials.reduce((sum, m) => sum + (m.percentage || 0) * (m.recycled_content || 0) / 100, 0);
  const compliantCount = (product.compliance_checks || []).filter(c => c.status === 'compliant').length;
  const totalChecks = (product.compliance_checks || []).length;

  return (
    <div className="card overflow-hidden border-blue-200">
      {/* Header */}
      <div className="eu-gradient p-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-blue-200 mb-1">Digital Product Passport Found</div>
            <h2 className="text-lg font-bold">{product.name}</h2>
            <code className="text-xs bg-white/20 px-2 py-0.5 rounded mt-1 inline-block">{product.uid}</code>
          </div>
          <div className="text-3xl">{categoryIcon(product.category)}</div>
        </div>
      </div>

      {/* Data */}
      <div className="p-5 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatItem label="Category" value={product.category} />
          <StatItem label="Status" value={<StatusBadge status={product.status} />} />
          <StatItem label="Manufacturer" value={product.manufacturer_name || '—'} />
          <StatItem label="Origin" value={product.country_of_origin || '—'} />
        </div>

        {/* Sustainability */}
        <div className="grid grid-cols-3 gap-3">
          <SustainabilityItem
            label="Carbon Footprint"
            value={product.carbon_footprint ? `${product.carbon_footprint} kg CO₂e` : '—'}
            icon="🌿" color="text-green-600"
          />
          <SustainabilityItem
            label="Recyclability"
            value={product.recyclability_score != null ? `${product.recyclability_score}%` : '—'}
            icon="♻️" color="text-emerald-600"
          />
          <SustainabilityItem
            label="Repairability"
            value={product.repairability_score != null ? `${product.repairability_score}/10` : '—'}
            icon="🔧" color="text-blue-600"
          />
        </div>

        {/* Compliance */}
        {totalChecks > 0 && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
            <CheckCircle2 className={compliantCount === totalChecks ? 'text-green-500' : 'text-yellow-500'} size={18} />
            <div className="text-sm">
              <span className="font-medium">{compliantCount}/{totalChecks}</span>
              <span className="text-gray-500"> regulatory checks passed</span>
            </div>
          </div>
        )}

        <button onClick={onView} className="btn-primary w-full justify-center py-2.5">
          View Full Digital Product Passport <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-medium text-gray-700 mt-0.5">{value}</div>
    </div>
  );
}

function SustainabilityItem({ label, value, icon, color }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-sm font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

const categoryIcon = (cat) => {
  const map = { Appliances: '🏠', Electronics: '⚡', Textiles: '👕', Batteries: '🔋', Furniture: '🪑' };
  return map[cat] || '📦';
};
