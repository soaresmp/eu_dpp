import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Calendar, FileText, ShieldOff, RefreshCw } from 'lucide-react';
import { api } from '../api.js';

export default function Recalls() {
  const [recalls, setRecalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts({ status: 'recalled', limit: 100 })
      .then(({ products }) => setRecalls(products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Recalls</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Active RAPEX / Safety Gate alerts and recalled Digital Product Passports
          </p>
        </div>
      </div>

      {/* EU Safety Gate Banner */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-red-700">
          <span className="font-semibold">EU Safety Gate (RAPEX):</span> Products listed here have been notified
          to EU authorities under the General Product Safety Regulation (EU) 2023/988. Consumers should
          stop using these products immediately and follow the return instructions.
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      ) : recalls.length === 0 ? (
        <div className="card p-16 text-center">
          <ShieldOff className="mx-auto text-gray-300 mb-3" size={48} />
          <h3 className="text-gray-500 font-medium">No active recalls</h3>
          <p className="text-gray-400 text-sm mt-1">All registered products are currently in good standing</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{recalls.length} recalled product{recalls.length !== 1 ? 's' : ''} found</p>
          {recalls.map(p => <RecallCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}

function RecallCard({ product: p }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden border-red-200">
      {/* Red alert header */}
      <div className="bg-red-600 px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <AlertTriangle size={16} />
          <span className="font-bold text-sm uppercase tracking-wide">Recall Notice</span>
          {p.recall_reference && (
            <code className="text-xs bg-white/20 px-2 py-0.5 rounded ml-1">{p.recall_reference}</code>
          )}
        </div>
        {p.recall_date && (
          <div className="flex items-center gap-1.5 text-red-200 text-xs">
            <Calendar size={12} />
            Issued: {new Date(p.recall_date).toLocaleDateString('en-EU', { dateStyle: 'medium' })}
          </div>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Product identity */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{p.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{p.uid}</code>
              <span>·</span>
              <span>{p.category}{p.subcategory ? ` / ${p.subcategory}` : ''}</span>
              {p.manufacturer_name && <><span>·</span><span>{p.manufacturer_name} ({p.manufacturer_country})</span></>}
            </div>
            {p.batch_number && (
              <div className="mt-1 text-sm text-red-700 font-medium">
                Affected batch: {p.batch_number}
              </div>
            )}
          </div>
          <span className="badge bg-red-100 text-red-800 shrink-0 text-sm px-3 py-1">Recalled</span>
        </div>

        {/* Recall reason */}
        {p.recall_reason && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-red-700 font-semibold text-sm">
              <AlertTriangle size={14} /> Reason for Recall
            </div>
            <p className="text-sm text-red-800">{p.recall_reason}</p>
          </div>
        )}

        {/* Consumer action */}
        {p.end_of_life_instructions && (
          <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2 text-orange-700 font-semibold text-sm">
              <RefreshCw size={14} /> Required Consumer Action
            </div>
            <p className="text-sm text-orange-800">{p.end_of_life_instructions}</p>
          </div>
        )}

        {/* Compliance failures (collapsed by default) */}
        {p.compliance_checks?.some(c => c.status === 'non_compliant') && (
          <div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <FileText size={14} />
              {expanded ? 'Hide' : 'Show'} regulatory violations
              ({p.compliance_checks.filter(c => c.status === 'non_compliant').length})
            </button>
            {expanded && (
              <div className="mt-3 space-y-2">
                {p.compliance_checks.filter(c => c.status === 'non_compliant').map(c => (
                  <div key={c.id} className="bg-gray-50 rounded-lg p-3 border-l-4 border-red-400">
                    <div className="text-sm font-medium text-gray-800">{c.regulation}</div>
                    {c.notes && <p className="text-xs text-gray-500 mt-0.5">{c.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Link to={`/products/${p.id}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
          View full product passport <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
