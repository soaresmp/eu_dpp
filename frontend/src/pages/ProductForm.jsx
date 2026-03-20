import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { api } from '../api.js';

const CATEGORIES = ['Appliances', 'Electronics', 'Textiles', 'Batteries', 'Furniture', 'Construction', 'Chemicals', 'Vehicles', 'Other'];
const ENERGY_CLASSES = ['', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
const DURABILITY_RATINGS = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
const STATUSES = ['draft', 'active', 'recalled', 'end_of_life'];
const SPARE_PARTS = ['', 'available', 'limited', 'unavailable'];
const COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'SE', 'AT', 'DK', 'FI', 'IE', 'PT', 'CZ', 'RO', 'HU', 'GB', 'CN', 'US', 'IN', 'JP', 'KR', 'MY', 'VN', 'CL', 'BR', 'NO', 'CH'];

const emptyMaterial = () => ({ material: '', percentage: '', recycled_content: '', origin: '' });
const emptyHazardous = () => ({ name: '', cas: '', concentration_ppm: '', threshold_ppm: '', compliant: true });
const emptyCert = () => ({ name: '', number: '', issuer: '', valid_until: '' });
const emptySupplyChain = () => ({ stage: '', location: '', supplier: '', carbon_kg: '' });

const EMPTY_FORM = {
  name: '', category: 'Appliances', subcategory: '', manufacturer_id: '',
  model_number: '', batch_number: '', serial_number: '', description: '',
  carbon_footprint: '', carbon_unit: 'kg CO2e', recyclability_score: '',
  repairability_score: '', durability_rating: '', energy_class: '',
  material_composition: [emptyMaterial()],
  hazardous_substances: [], certifications: [], supply_chain: [],
  warranty_years: '', expected_lifetime_years: '', weight_kg: '',
  country_of_origin: 'DE', end_of_life_instructions: '',
  spare_parts_availability: '', status: 'draft'
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY_FORM);
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    api.getStakeholders({ role: 'manufacturer' }).then(setStakeholders);
    if (isEdit) {
      setLoading(true);
      api.getProduct(id).then(p => {
        setForm({
          ...EMPTY_FORM, ...p,
          carbon_footprint: p.carbon_footprint ?? '',
          recyclability_score: p.recyclability_score ?? '',
          repairability_score: p.repairability_score ?? '',
          warranty_years: p.warranty_years ?? '',
          expected_lifetime_years: p.expected_lifetime_years ?? '',
          weight_kg: p.weight_kg ?? '',
          material_composition: p.material_composition?.length ? p.material_composition : [emptyMaterial()],
          hazardous_substances: p.hazardous_substances || [],
          certifications: p.certifications || [],
          supply_chain: p.supply_chain || [],
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const updateArray = (key, idx, field, value) => {
    setForm(f => {
      const arr = [...f[key]];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, [key]: arr };
    });
  };

  const addToArray = (key, empty) => setForm(f => ({ ...f, [key]: [...f[key], empty()] }));
  const removeFromArray = (key, idx) => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        carbon_footprint: form.carbon_footprint !== '' ? parseFloat(form.carbon_footprint) : null,
        recyclability_score: form.recyclability_score !== '' ? parseInt(form.recyclability_score) : null,
        repairability_score: form.repairability_score !== '' ? parseFloat(form.repairability_score) : null,
        warranty_years: form.warranty_years !== '' ? parseInt(form.warranty_years) : null,
        expected_lifetime_years: form.expected_lifetime_years !== '' ? parseInt(form.expected_lifetime_years) : null,
        weight_kg: form.weight_kg !== '' ? parseFloat(form.weight_kg) : null,
        material_composition: form.material_composition.filter(m => m.material),
        hazardous_substances: form.hazardous_substances.filter(h => h.name),
        certifications: form.certifications.filter(c => c.name),
        supply_chain: form.supply_chain.filter(s => s.stage),
      };
      if (isEdit) {
        await api.updateProduct(id, payload);
        navigate(`/products/${id}`);
      } else {
        const { id: newId } = await api.createProduct(payload);
        navigate(`/products/${newId}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6"><div className="h-64 bg-gray-200 rounded-xl animate-pulse" /></div>;

  const sections = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'sustainability', label: 'Sustainability' },
    { id: 'materials', label: 'Materials' },
    { id: 'hazardous', label: 'Hazardous' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'supplychain', label: 'Supply Chain' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to={isEdit ? `/products/${id}` : '/products'} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {isEdit ? 'Edit Digital Product Passport' : 'Register New Digital Product Passport'}
        </h1>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-5">
          <AlertCircle className="text-red-500 shrink-0" size={18} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Section Nav */}
      <div className="flex overflow-x-auto gap-1 mb-6">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
              ${activeSection === s.id ? 'bg-blue-700 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        {activeSection === 'basic' && (
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Product Name *" required>
                <input required value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. ProWash EcoSeries 9000" className="input" />
              </Field>
              <Field label="Category *" required>
                <select required value={form.category} onChange={e => set('category', e.target.value)} className="input">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Subcategory">
                <input value={form.subcategory} onChange={e => set('subcategory', e.target.value)}
                  placeholder="e.g. Washing Machines" className="input" />
              </Field>
              <Field label="Manufacturer">
                <select value={form.manufacturer_id} onChange={e => set('manufacturer_id', e.target.value)} className="input">
                  <option value="">— Select Manufacturer —</option>
                  {stakeholders.map(s => <option key={s.id} value={s.id}>{s.name} ({s.country})</option>)}
                </select>
              </Field>
              <Field label="Model Number">
                <input value={form.model_number} onChange={e => set('model_number', e.target.value)}
                  placeholder="e.g. PW-ES-9000" className="input" />
              </Field>
              <Field label="Batch Number">
                <input value={form.batch_number} onChange={e => set('batch_number', e.target.value)}
                  placeholder="e.g. BATCH-2024-001" className="input" />
              </Field>
              <Field label="Country of Origin">
                <select value={form.country_of_origin} onChange={e => set('country_of_origin', e.target.value)} className="input">
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </Field>
              <Field label="Weight (kg)">
                <input type="number" step="0.01" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)}
                  placeholder="0.0" className="input" />
              </Field>
              <Field label="Warranty (years)">
                <input type="number" value={form.warranty_years} onChange={e => set('warranty_years', e.target.value)}
                  placeholder="e.g. 5" className="input" />
              </Field>
              <Field label="Expected Lifetime (years)">
                <input type="number" value={form.expected_lifetime_years} onChange={e => set('expected_lifetime_years', e.target.value)}
                  placeholder="e.g. 15" className="input" />
              </Field>
              <Field label="Spare Parts Availability">
                <select value={form.spare_parts_availability} onChange={e => set('spare_parts_availability', e.target.value)} className="input">
                  {SPARE_PARTS.map(s => <option key={s} value={s}>{s || '— Select —'}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Description">
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                rows={3} placeholder="Brief product description..." className="input resize-none" />
            </Field>
            <Field label="End-of-Life Instructions">
              <textarea value={form.end_of_life_instructions} onChange={e => set('end_of_life_instructions', e.target.value)}
                rows={3} placeholder="How to dispose/recycle this product..." className="input resize-none" />
            </Field>
          </div>
        )}

        {/* Sustainability */}
        {activeSection === 'sustainability' && (
          <div className="card p-5 space-y-4">
            <h3 className="font-semibold text-gray-800">Sustainability Indicators</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Carbon Footprint (kg CO₂e)">
                <input type="number" step="0.01" value={form.carbon_footprint}
                  onChange={e => set('carbon_footprint', e.target.value)} placeholder="e.g. 245.8" className="input" />
              </Field>
              <Field label="Recyclability Score (0–100%)">
                <input type="number" min="0" max="100" value={form.recyclability_score}
                  onChange={e => set('recyclability_score', e.target.value)} placeholder="0–100" className="input" />
              </Field>
              <Field label="Repairability Score (0–10)">
                <input type="number" min="0" max="10" step="0.1" value={form.repairability_score}
                  onChange={e => set('repairability_score', e.target.value)} placeholder="0.0–10.0" className="input" />
              </Field>
              <Field label="Energy Class">
                <select value={form.energy_class} onChange={e => set('energy_class', e.target.value)} className="input">
                  {ENERGY_CLASSES.map(c => <option key={c} value={c}>{c || '— N/A —'}</option>)}
                </select>
              </Field>
              <Field label="Durability Rating (EU Scale)">
                <select value={form.durability_rating} onChange={e => set('durability_rating', e.target.value)} className="input">
                  {DURABILITY_RATINGS.map(r => <option key={r} value={r}>{r || '— N/A —'}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Materials */}
        {activeSection === 'materials' && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Material Composition</h3>
              <button type="button" onClick={() => addToArray('material_composition', emptyMaterial)} className="btn-secondary text-xs">
                <Plus size={14} /> Add Material
              </button>
            </div>
            {form.material_composition.map((m, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Material {i + 1}</span>
                  <button type="button" onClick={() => removeFromArray('material_composition', i)}
                    className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="Material Name">
                    <input value={m.material} onChange={e => updateArray('material_composition', i, 'material', e.target.value)}
                      placeholder="e.g. Steel" className="input" />
                  </Field>
                  <Field label="Share (%)">
                    <input type="number" min="0" max="100" value={m.percentage}
                      onChange={e => updateArray('material_composition', i, 'percentage', e.target.value)}
                      placeholder="0–100" className="input" />
                  </Field>
                  <Field label="Recycled Content (%)">
                    <input type="number" min="0" max="100" value={m.recycled_content}
                      onChange={e => updateArray('material_composition', i, 'recycled_content', e.target.value)}
                      placeholder="0–100" className="input" />
                  </Field>
                  <Field label="Origin (country)">
                    <input value={m.origin} onChange={e => updateArray('material_composition', i, 'origin', e.target.value)}
                      placeholder="e.g. DE" className="input" />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hazardous */}
        {activeSection === 'hazardous' && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Hazardous Substances</h3>
              <button type="button" onClick={() => addToArray('hazardous_substances', emptyHazardous)} className="btn-secondary text-xs">
                <Plus size={14} /> Add Substance
              </button>
            </div>
            <p className="text-xs text-gray-500">Required by REACH Regulation. List all substances of very high concern (SVHCs) above 0.1% threshold.</p>
            {form.hazardous_substances.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No hazardous substances declared</div>
            )}
            {form.hazardous_substances.map((h, i) => (
              <div key={i} className="bg-orange-50 rounded-lg p-4 space-y-3 border border-orange-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-700">Substance {i + 1}</span>
                  <button type="button" onClick={() => removeFromArray('hazardous_substances', i)}
                    className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Field label="Substance Name">
                    <input value={h.name} onChange={e => updateArray('hazardous_substances', i, 'name', e.target.value)}
                      placeholder="e.g. Lead (Pb)" className="input" />
                  </Field>
                  <Field label="CAS Number">
                    <input value={h.cas} onChange={e => updateArray('hazardous_substances', i, 'cas', e.target.value)}
                      placeholder="e.g. 7439-92-1" className="input" />
                  </Field>
                  <Field label="Concentration (ppm)">
                    <input type="number" step="0.001" value={h.concentration_ppm}
                      onChange={e => updateArray('hazardous_substances', i, 'concentration_ppm', e.target.value)}
                      placeholder="0.000" className="input" />
                  </Field>
                  <Field label="Threshold (ppm)">
                    <input type="number" step="0.001" value={h.threshold_ppm}
                      onChange={e => updateArray('hazardous_substances', i, 'threshold_ppm', e.target.value)}
                      placeholder="0.000" className="input" />
                  </Field>
                  <Field label="Compliant">
                    <select value={h.compliant ? 'true' : 'false'}
                      onChange={e => updateArray('hazardous_substances', i, 'compliant', e.target.value === 'true')}
                      className="input">
                      <option value="true">Yes — Compliant</option>
                      <option value="false">No — Non-Compliant</option>
                    </select>
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {activeSection === 'certifications' && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Certifications & Standards</h3>
              <button type="button" onClick={() => addToArray('certifications', emptyCert)} className="btn-secondary text-xs">
                <Plus size={14} /> Add Certification
              </button>
            </div>
            {form.certifications.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No certifications added</div>
            )}
            {form.certifications.map((c, i) => (
              <div key={i} className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-700">Certification {i + 1}</span>
                  <button type="button" onClick={() => removeFromArray('certifications', i)}
                    className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="Certification Name">
                    <input value={c.name} onChange={e => updateArray('certifications', i, 'name', e.target.value)}
                      placeholder="e.g. CE Marking" className="input" />
                  </Field>
                  <Field label="Certificate Number">
                    <input value={c.number} onChange={e => updateArray('certifications', i, 'number', e.target.value)}
                      placeholder="e.g. CE-2024-001" className="input" />
                  </Field>
                  <Field label="Issuing Body">
                    <input value={c.issuer} onChange={e => updateArray('certifications', i, 'issuer', e.target.value)}
                      placeholder="e.g. TÜV Rheinland" className="input" />
                  </Field>
                  <Field label="Valid Until">
                    <input type="date" value={c.valid_until}
                      onChange={e => updateArray('certifications', i, 'valid_until', e.target.value)} className="input" />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Supply Chain */}
        {activeSection === 'supplychain' && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Supply Chain Stages</h3>
              <button type="button" onClick={() => addToArray('supply_chain', emptySupplyChain)} className="btn-secondary text-xs">
                <Plus size={14} /> Add Stage
              </button>
            </div>
            {form.supply_chain.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No supply chain stages defined</div>
            )}
            {form.supply_chain.map((s, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Stage {i + 1}</span>
                  <button type="button" onClick={() => removeFromArray('supply_chain', i)}
                    className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Field label="Stage Name">
                    <input value={s.stage} onChange={e => updateArray('supply_chain', i, 'stage', e.target.value)}
                      placeholder="e.g. Manufacturing" className="input" />
                  </Field>
                  <Field label="Location">
                    <input value={s.location} onChange={e => updateArray('supply_chain', i, 'location', e.target.value)}
                      placeholder="e.g. Berlin, Germany" className="input" />
                  </Field>
                  <Field label="Supplier">
                    <input value={s.supplier} onChange={e => updateArray('supply_chain', i, 'supplier', e.target.value)}
                      placeholder="e.g. EcoTech GmbH" className="input" />
                  </Field>
                  <Field label="Carbon (kg CO₂e)">
                    <input type="number" step="0.1" value={s.carbon_kg}
                      onChange={e => updateArray('supply_chain', i, 'carbon_kg', e.target.value)}
                      placeholder="0.0" className="input" />
                  </Field>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link to={isEdit ? `/products/${id}` : '/products'} className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span>
            ) : (
              <><Save size={16} /> {isEdit ? 'Update DPP' : 'Register DPP'}</>
            )}
          </button>
        </div>
      </form>

      <style>{`.input { @apply w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500; }`}</style>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}
