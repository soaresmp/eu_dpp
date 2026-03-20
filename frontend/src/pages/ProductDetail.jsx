import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit, QrCode, Download, Plus, MapPin, Calendar,
  AlertTriangle, CheckCircle2, FileText, ChevronDown, ChevronUp,
  Package, Recycle, Wrench, Leaf, Zap, Globe, ExternalLink
} from 'lucide-react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ScoreRing from '../components/ScoreRing.jsx';

const TABS = ['Overview', 'Materials', 'Supply Chain', 'Lifecycle', 'Documents', 'Compliance'];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Overview');
  const [qrData, setQrData] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);

  useEffect(() => {
    api.getProduct(id).then(setProduct).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id]);

  const loadQR = async () => {
    if (!qrData) {
      const data = await api.getQRCode(id);
      setQrData(data);
    }
    setShowQR(true);
  };

  if (loading) return (
    <div className="p-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
  if (!product) return null;

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Back + Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/products" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} /> Back to Products
        </Link>
        <div className="flex gap-2">
          <button onClick={loadQR} className="btn-secondary">
            <QrCode size={16} /> QR Code
          </button>
          <Link to={`/products/${id}/edit`} className="btn-primary">
            <Edit size={16} /> Edit DPP
          </Link>
        </div>
      </div>

      {/* Header Card */}
      <div className="card overflow-hidden">
        <div className="eu-gradient p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{categoryIcon(product.category)}</span>
                <div>
                  <h1 className="text-xl font-bold">{product.name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <code className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">{product.uid}</code>
                    <span className="text-blue-200 text-sm">{product.category}</span>
                    {product.subcategory && <span className="text-blue-300 text-sm">/ {product.subcategory}</span>}
                  </div>
                </div>
              </div>
              {product.description && (
                <p className="text-blue-100 text-sm mt-2 max-w-xl">{product.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={product.status} className="text-sm px-3 py-1" />
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 border-t border-gray-100">
          {[
            { label: 'Manufacturer', value: product.manufacturer_name || '—', sub: product.manufacturer_country },
            { label: 'Model Number', value: product.model_number || '—', sub: product.batch_number ? `Batch: ${product.batch_number}` : '' },
            { label: 'Country of Origin', value: product.country_of_origin || '—', sub: '' },
            { label: 'Warranty', value: product.warranty_years ? `${product.warranty_years} years` : '—',
              sub: product.expected_lifetime_years ? `${product.expected_lifetime_years}yr expected life` : '' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="px-5 py-3">
              <div className="text-xs text-gray-500">{label}</div>
              <div className="font-medium text-gray-800 mt-0.5">{value}</div>
              {sub && <div className="text-xs text-gray-400">{sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Sustainability Scores */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-5">Sustainability Indicators</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
          <ScoreRing value={product.recyclability_score} max={100} label="Recyclability %" color="auto" />
          <ScoreRing value={product.repairability_score} max={10} label="Repairability /10" color="auto" />
          {product.energy_class && (
            <div className="flex flex-col items-center gap-1">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${energyClassStyle(product.energy_class)}`}>
                {product.energy_class}
              </div>
              <span className="text-xs text-gray-500">Energy Class</span>
            </div>
          )}
          {product.durability_rating && (
            <div className="flex flex-col items-center gap-1">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${durabilityStyle(product.durability_rating)}`}>
                {product.durability_rating}
              </div>
              <span className="text-xs text-gray-500">Durability</span>
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex flex-col items-center justify-center">
              <span className="text-base font-bold text-green-700">
                {product.carbon_footprint ? product.carbon_footprint.toLocaleString() : '—'}
              </span>
              <span className="text-xs text-green-500">kg CO₂e</span>
            </div>
            <span className="text-xs text-gray-500">Carbon Footprint</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold ${
              product.spare_parts_availability === 'available' ? 'bg-green-50 border-2 border-green-200 text-green-700' :
              product.spare_parts_availability === 'limited' ? 'bg-yellow-50 border-2 border-yellow-200 text-yellow-700' :
              'bg-red-50 border-2 border-red-200 text-red-700'
            }`}>
              {product.spare_parts_availability === 'available' ? '✓' :
               product.spare_parts_availability === 'limited' ? '~' : '✗'}
            </div>
            <span className="text-xs text-gray-500">Spare Parts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {t}
                {t === 'Compliance' && (
                  <span className={`ml-2 badge text-xs ${
                    product.compliance_checks?.some(c => c.status === 'non_compliant') ? 'bg-red-100 text-red-700' :
                    product.compliance_checks?.every(c => c.status === 'compliant') ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{product.compliance_checks?.length || 0}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {tab === 'Overview' && <OverviewTab product={product} />}
          {tab === 'Materials' && <MaterialsTab product={product} />}
          {tab === 'Supply Chain' && <SupplyChainTab product={product} />}
          {tab === 'Lifecycle' && <LifecycleTab product={product} onAddEvent={() => setAddEventOpen(true)} />}
          {tab === 'Documents' && <DocumentsTab product={product} />}
          {tab === 'Compliance' && <ComplianceTab product={product} />}
        </div>
      </div>

      {/* QR Modal */}
      {showQR && qrData && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-gray-800 mb-4 text-center">Digital Product Passport QR Code</h3>
            <img src={qrData.qr} alt="DPP QR Code" className="w-full rounded-lg" />
            <p className="text-xs text-gray-500 text-center mt-3 break-all">{qrData.url}</p>
            <div className="text-center mt-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{qrData.uid}</code>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowQR(false)} className="btn-secondary flex-1 justify-center">Close</button>
              <a href={qrData.qr} download={`dpp-${qrData.uid}.png`} className="btn-primary flex-1 justify-center">
                <Download size={16} /> Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ product }) {
  return (
    <div className="space-y-4">
      {product.end_of_life_instructions && (
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Recycle className="text-green-600" size={18} />
            <span className="font-medium text-green-800">End-of-Life Instructions</span>
          </div>
          <p className="text-sm text-green-700">{product.end_of_life_instructions}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Weight', value: product.weight_kg ? `${product.weight_kg} kg` : '—' },
          { label: 'Spare Parts', value: product.spare_parts_availability || '—' },
          { label: 'Warranty', value: product.warranty_years ? `${product.warranty_years} years` : '—' },
          { label: 'Expected Lifetime', value: product.expected_lifetime_years ? `${product.expected_lifetime_years} years` : '—' },
          { label: 'Country of Origin', value: product.country_of_origin || '—' },
          { label: 'Batch / Serial', value: [product.batch_number, product.serial_number].filter(Boolean).join(' / ') || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="font-medium text-gray-800 mt-0.5 capitalize">{value}</div>
          </div>
        ))}
      </div>

      {product.hazardous_substances?.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={16} /> Hazardous Substances
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">
                <th className="px-3 py-2 text-xs font-medium text-gray-500">Substance</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500">CAS No.</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500">Concentration (ppm)</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500">Threshold (ppm)</th>
                <th className="px-3 py-2 text-xs font-medium text-gray-500">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {product.hazardous_substances.map((s, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-medium">{s.name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{s.cas}</td>
                    <td className="px-3 py-2">{s.concentration_ppm}</td>
                    <td className="px-3 py-2">{s.threshold_ppm || '—'}</td>
                    <td className="px-3 py-2">
                      <span className={`badge ${s.compliant ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {s.compliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {product.certifications?.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Certifications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {product.certifications.map((cert, i) => (
              <div key={i} className="flex items-start gap-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                <CheckCircle2 className="text-blue-600 mt-0.5 shrink-0" size={16} />
                <div>
                  <div className="font-medium text-blue-800 text-sm">{cert.name}</div>
                  <div className="text-xs text-blue-600 mt-0.5">#{cert.number}</div>
                  <div className="text-xs text-gray-500">{cert.issuer} · Valid until: {cert.valid_until}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MaterialsTab({ product }) {
  const materials = product.material_composition || [];
  const totalRecycled = materials.reduce((sum, m) => sum + (m.percentage || 0) * (m.recycled_content || 0) / 100, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalRecycled.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">Avg. Recycled Content</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{materials.length}</div>
          <div className="text-xs text-gray-500">Material Types</div>
        </div>
      </div>

      <div className="space-y-3">
        {materials.map((m, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-medium text-gray-800">{m.material}</span>
                {m.origin && <span className="ml-2 text-xs text-gray-500">Origin: {m.origin}</span>}
              </div>
              <span className="text-lg font-bold text-gray-700">{m.percentage}%</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-24">Composition</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${m.percentage}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-10 text-right">{m.percentage}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-24">Recycled</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${m.recycled_content || 0}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-10 text-right">{m.recycled_content || 0}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupplyChainTab({ product }) {
  const stages = product.supply_chain || [];
  const total = stages.reduce((s, st) => s + (st.carbon_kg || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
        <div className="text-sm text-orange-600">Total Supply Chain Carbon</div>
        <div className="text-2xl font-bold text-orange-700">{total.toFixed(1)} kg CO₂e</div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, i) => {
          const pct = total > 0 ? (stage.carbon_kg / total) * 100 : 0;
          return (
            <div key={i} className="relative">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  {i < stages.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-gray-800">{stage.stage}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        {stage.location && <><MapPin size={10} />{stage.location}</>}
                        {stage.supplier && <><span>·</span> {stage.supplier}</>}
                      </div>
                    </div>
                    {stage.carbon_kg != null && (
                      <div className="text-right shrink-0">
                        <div className="font-semibold text-orange-600">{stage.carbon_kg} kg</div>
                        <div className="text-xs text-gray-400">CO₂e</div>
                      </div>
                    )}
                  </div>
                  {stage.carbon_kg != null && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-12 text-right">{pct.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LifecycleTab({ product, onAddEvent }) {
  const events = product.lifecycle_events || [];
  const eventTypes = ['manufactured', 'imported', 'distributed', 'sold', 'repaired', 'updated', 'recalled', 'recycled'];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={onAddEvent} className="btn-secondary">
          <Plus size={16} /> Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Calendar className="mx-auto mb-2" size={32} />
          <p>No lifecycle events recorded</p>
        </div>
      ) : (
        <div className="space-y-0">
          {events.map((e, i) => (
            <div key={e.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0 ${eventBg(e.event_type)}`}>
                  {eventIcon(e.event_type)}
                </div>
                {i < events.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
              </div>
              <div className={`flex-1 pb-4 ${i === events.length - 1 ? '' : ''}`}>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-gray-800 capitalize">{e.event_type}</span>
                      {e.description && <p className="text-sm text-gray-600 mt-0.5">{e.description}</p>}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {new Date(e.event_date).toLocaleDateString('en-EU', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {e.location && <span className="flex items-center gap-1"><MapPin size={10} />{e.location}</span>}
                    {e.actor_name && <span>{e.actor_name} ({e.actor_role})</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ product }) {
  const docs = product.documents || [];
  const docTypeIcon = { certificate: '🏆', declaration: '📜', test_report: '🔬', manual: '📖', safety_sheet: '⚠️', other: '📄' };

  return (
    <div className="space-y-3">
      {docs.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <FileText className="mx-auto mb-2" size={32} />
          <p>No documents attached</p>
        </div>
      ) : (
        docs.map(d => (
          <div key={d.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-2xl">{docTypeIcon[d.doc_type] || '📄'}</span>
            <div className="flex-1">
              <div className="font-medium text-gray-800">{d.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {d.issued_by && <span>Issued by: {d.issued_by}</span>}
                {d.issue_date && <span> · {d.issue_date}</span>}
                {d.expiry_date && <span> · Expires: {d.expiry_date}</span>}
              </div>
              <span className="badge bg-gray-200 text-gray-600 mt-1 capitalize">{d.doc_type.replace('_', ' ')}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ComplianceTab({ product }) {
  const checks = product.compliance_checks || [];

  return (
    <div className="space-y-3">
      {checks.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <CheckCircle2 className="mx-auto mb-2" size={32} />
          <p>No compliance checks recorded</p>
        </div>
      ) : (
        checks.map(c => (
          <div key={c.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-gray-800">{c.regulation}</div>
                {c.notes && <p className="text-sm text-gray-500 mt-1">{c.notes}</p>}
                <div className="text-xs text-gray-400 mt-1">
                  {c.checked_by && <span>Checked by: {c.checked_by}</span>}
                  {c.checked_at && <span> · {new Date(c.checked_at).toLocaleDateString()}</span>}
                </div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const categoryIcon = (cat) => {
  const map = { Appliances: '🏠', Electronics: '⚡', Textiles: '👕', Batteries: '🔋', Furniture: '🪑' };
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

const durabilityStyle = (r) => {
  const map = { A: 'bg-green-100 text-green-700 border-2 border-green-300', B: 'bg-lime-100 text-lime-700 border-2 border-lime-300', C: 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300', D: 'bg-orange-100 text-orange-700 border-2 border-orange-300', E: 'bg-red-100 text-red-700 border-2 border-red-300' };
  return map[r] || 'bg-gray-100 text-gray-700';
};

const eventBg = (t) => {
  const map = { manufactured: 'bg-blue-100', imported: 'bg-indigo-100', distributed: 'bg-cyan-100', sold: 'bg-green-100', repaired: 'bg-yellow-100', recalled: 'bg-red-100', recycled: 'bg-purple-100', updated: 'bg-gray-100' };
  return map[t] || 'bg-gray-100';
};

const eventIcon = (t) => {
  const map = { manufactured: '🏭', imported: '🚢', distributed: '🚛', sold: '🛒', repaired: '🔧', recalled: '⚠️', recycled: '♻️', updated: '🔄' };
  return map[t] || '📋';
};
