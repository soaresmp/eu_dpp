import React, { useState } from 'react';
import { MapPin, ChevronDown, ChevronUp, Tag, ArrowRight, ArrowLeft, Award } from 'lucide-react';

// ─── GS1 EPCIS CBV display maps ───────────────────────────────────────────────
const EVENT_TYPE_CONFIG = {
  ObjectEvent:       { label: 'Object Event',        color: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500',   icon: '📦' },
  AggregationEvent:  { label: 'Aggregation Event',   color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500', icon: '📦📦' },
  TransactionEvent:  { label: 'Transaction Event',   color: 'bg-green-100 text-green-800', dot: 'bg-green-500',  icon: '🤝' },
  TransformationEvent:{ label: 'Transformation Event',color: 'bg-orange-100 text-orange-800',dot: 'bg-orange-500',icon: '⚙️' },
  AssociationEvent:  { label: 'Association Event',   color: 'bg-gray-100 text-gray-700',   dot: 'bg-gray-400',   icon: '🔗' },
};

const ACTION_CONFIG = {
  OBSERVE: { label: 'OBSERVE', color: 'bg-sky-100 text-sky-700' },
  ADD:     { label: 'ADD',     color: 'bg-emerald-100 text-emerald-700' },
  DELETE:  { label: 'DELETE',  color: 'bg-red-100 text-red-700' },
};

const BIZ_STEP_LABELS = {
  commissioning:    { label: 'Commissioning',      icon: '🏭' },
  assembling:       { label: 'Assembling',          icon: '🔩' },
  inspecting:       { label: 'Inspecting',          icon: '🔬' },
  packing:          { label: 'Packing',             icon: '📦' },
  shipping:         { label: 'Shipping',            icon: '🚛' },
  receiving:        { label: 'Receiving',           icon: '📥' },
  installing:       { label: 'Installing',          icon: '🔧' },
  custody_transfer: { label: 'Custody Transfer',    icon: '🤝' },
  maintaining:      { label: 'Maintaining',         icon: '🛠️' },
  repairing:        { label: 'Repairing',           icon: '🔧' },
  inspecting_soh:   { label: 'SoH Inspection',      icon: '🔋' },
  decommissioning:  { label: 'Decommissioning',     icon: '⚠️' },
  disposing:        { label: 'Disposing',           icon: '♻️' },
  storage:          { label: 'Storage',             icon: '🏪' },
  loading:          { label: 'Loading',             icon: '🏗️' },
  unloading:        { label: 'Unloading',           icon: '📤' },
};

const DISPOSITION_CONFIG = {
  active:     { label: 'Active',      color: 'text-green-700 bg-green-50' },
  in_transit: { label: 'In Transit',  color: 'text-blue-700 bg-blue-50' },
  in_progress:{ label: 'In Progress', color: 'text-yellow-700 bg-yellow-50' },
  available:  { label: 'Available',   color: 'text-emerald-700 bg-emerald-50' },
  damaged:    { label: 'Damaged',     color: 'text-red-700 bg-red-50' },
  recalled:   { label: 'Recalled',    color: 'text-red-700 bg-red-50' },
  destroyed:  { label: 'Destroyed',   color: 'text-gray-700 bg-gray-100' },
};

// Strip GS1 URN prefix for display
function formatEpc(epc) {
  if (!epc) return epc;
  // urn:epc:id:sgtin:4012345.067890.BAT75001 → SGTIN · 4012345.067890.BAT75001
  const m = epc.match(/^urn:epc:id:(\w+):(.+)$/);
  if (m) return { scheme: m[1].toUpperCase(), value: m[2] };
  return { scheme: 'EPC', value: epc };
}

function formatGln(gln) {
  const m = gln?.match(/^urn:epc:id:(?:sgln|pgln):(.+)$/);
  return m ? m[1] : gln;
}

// ─── ILMD key labels ──────────────────────────────────────────────────────────
const ILMD_LABELS = {
  state_of_health_pct:     { label: 'State of Health', unit: '%', highlight: true },
  capacity_measured_kwh:   { label: 'Measured Capacity', unit: ' kWh', highlight: true },
  internal_resistance_mohm:{ label: 'Internal Resistance', unit: ' mΩ' },
  cycles_completed:        { label: 'Charge Cycles', unit: '' },
  cell_count:              { label: 'Cell Count', unit: '' },
  nominal_capacity_kwh:    { label: 'Nominal Capacity', unit: ' kWh' },
  bms_firmware:            { label: 'BMS Firmware', unit: '' },
  firmware_new:            { label: 'New Firmware', unit: '', highlight: true },
  firmware_previous:       { label: 'Previous Firmware', unit: '' },
  transport_mode:          { label: 'Transport Mode', unit: '' },
  carrier:                 { label: 'Carrier', unit: '' },
  hazmat_class:            { label: 'Hazmat Class', unit: '' },
  incoterms:               { label: 'Incoterms', unit: '' },
  vehicle_vin:             { label: 'Vehicle VIN', unit: '' },
  vehicle_model:           { label: 'Vehicle Model', unit: '' },
  battery_warranty_years:  { label: 'Battery Warranty', unit: ' years' },
  odometer_km:             { label: 'Odometer', unit: ' km' },
  diagnostic_result:       { label: 'Diagnostic Result', unit: '', highlight: true },
  update_result:           { label: 'Update Result', unit: '', highlight: true },
  condition_on_arrival:    { label: 'Condition on Arrival', unit: '' },
  goods_receipt_note:      { label: 'GRN Reference', unit: '' },
};

export default function EpcisTimeline({ events = [] }) {
  const [expanded, setExpanded] = useState(new Set([events[0]?.id]));

  const toggle = (id) => setExpanded(s => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-sm">No EPCIS events recorded for this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b border-gray-100">
        <span className="text-xs text-gray-400 self-center mr-1">Event types:</span>
        {Object.entries(EVENT_TYPE_CONFIG).map(([k, v]) => (
          <span key={k} className={`badge text-xs ${v.color}`}>{v.icon} {v.label}</span>
        ))}
      </div>

      {events.map((evt, idx) => {
        const typeCfg = EVENT_TYPE_CONFIG[evt.event_type] || EVENT_TYPE_CONFIG.ObjectEvent;
        const actionCfg = ACTION_CONFIG[evt.action] || ACTION_CONFIG.OBSERVE;
        const bizStep = BIZ_STEP_LABELS[evt.biz_step] || { label: evt.biz_step, icon: '📋' };
        const dispCfg = DISPOSITION_CONFIG[evt.disposition];
        const isOpen = expanded.has(evt.id);
        const isLast = idx === events.length - 1;

        // Key ILMD metrics to show in the collapsed header
        const soh = evt.ilmd?.state_of_health_pct;
        const capacity = evt.ilmd?.capacity_measured_kwh;

        return (
          <div key={evt.id} className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center pt-4">
              <div className={`w-4 h-4 rounded-full border-2 border-white shadow shrink-0 ${typeCfg.dot}`} />
              {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1 mb-0" />}
            </div>

            {/* Event card */}
            <div className={`flex-1 mb-3 rounded-xl border overflow-hidden ${isOpen ? 'border-gray-200 shadow-sm' : 'border-gray-100'}`}>
              {/* Collapsed header — always visible */}
              <button
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                onClick={() => toggle(evt.id)}
              >
                <span className="text-xl mt-0.5 shrink-0">{bizStep.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800 text-sm">{bizStep.label}</span>
                    <span className={`badge text-xs ${typeCfg.color}`}>{evt.event_type}</span>
                    <span className={`badge text-xs ${actionCfg.color}`}>{evt.action}</span>
                    {dispCfg && (
                      <span className={`badge text-xs ${dispCfg.color}`}>{dispCfg.label}</span>
                    )}
                    {soh != null && (
                      <span className={`badge text-xs font-bold ${soh >= 80 ? 'bg-green-100 text-green-700' : soh >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        SoH {soh}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                    <span>{new Date(evt.event_time).toLocaleString('en-EU', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    {evt.biz_location?.name && (
                      <span className="flex items-center gap-1"><MapPin size={10} />{evt.biz_location.name}</span>
                    )}
                  </div>
                  {!isOpen && evt.notes && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{evt.notes}</p>
                  )}
                </div>
                <span className="text-gray-400 shrink-0 mt-0.5">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-3 bg-gray-50/50">
                  {/* EPC Identifiers */}
                  <EpcSection label="EPC Identifiers" epcs={evt.epc_list} />
                  {evt.input_epc_list?.length > 0 && <EpcSection label="Input EPCs (consumed)" epcs={evt.input_epc_list} direction="in" />}
                  {evt.output_epc_list?.length > 0 && <EpcSection label="Output EPCs (produced)" epcs={evt.output_epc_list} direction="out" />}
                  {evt.child_epc_list?.length > 0 && <EpcSection label="Aggregated Children" epcs={evt.child_epc_list} />}

                  {/* Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {evt.biz_location?.gln && (
                      <LocationBox label="Business Location" name={evt.biz_location.name} gln={evt.biz_location.gln} />
                    )}
                    {evt.read_point?.gln && (
                      <LocationBox label="Read Point" name={evt.read_point.name} gln={evt.read_point.gln} />
                    )}
                  </div>

                  {/* Parties */}
                  {(evt.source_parties?.length > 0 || evt.destination_parties?.length > 0) && (
                    <div className="flex items-start gap-4">
                      {evt.source_parties?.length > 0 && (
                        <div className="flex-1">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2">
                            <ArrowLeft size={12} /> Source
                          </div>
                          {evt.source_parties.map((p, i) => <PartyTag key={i} party={p} />)}
                        </div>
                      )}
                      {evt.source_parties?.length > 0 && evt.destination_parties?.length > 0 && (
                        <ArrowRight className="text-gray-300 mt-5" size={20} />
                      )}
                      {evt.destination_parties?.length > 0 && (
                        <div className="flex-1">
                          <div className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-2">
                            <ArrowRight size={12} /> Destination
                          </div>
                          {evt.destination_parties.map((p, i) => <PartyTag key={i} party={p} />)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Business Transactions */}
                  {evt.biz_transactions?.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Business Transactions</div>
                      <div className="space-y-1.5">
                        {evt.biz_transactions.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 text-xs">
                            <span className="badge bg-gray-100 text-gray-600 capitalize">{t.type?.replace(/_/g,' ')}</span>
                            <span className="font-mono text-gray-700 font-medium">{t.id}</span>
                            {t.reference && <span className="text-gray-400 truncate">— {t.reference}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ILMD — Instance / Lot Master Data */}
                  {evt.ilmd && Object.keys(evt.ilmd).length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Instance / Lot Master Data (ILMD)
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {Object.entries(evt.ilmd).map(([k, v]) => {
                          const def = ILMD_LABELS[k];
                          const label = def?.label || k.replace(/_/g, ' ');
                          const unit = def?.unit || '';
                          const highlight = def?.highlight;
                          if (typeof v === 'boolean') return (
                            <IlmdCell key={k} label={label}
                              value={v ? '✓ Yes' : '✗ No'}
                              highlight={highlight && v}
                              good={v} />
                          );
                          return (
                            <IlmdCell key={k} label={label}
                              value={`${v}${unit}`}
                              highlight={highlight} />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Certifications on event */}
                  {evt.certifications?.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">Event Certifications</div>
                      <div className="flex flex-wrap gap-2">
                        {evt.certifications.map((c, i) => (
                          <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-xs">
                            <Award size={12} className="text-blue-500" />
                            <span className="font-medium text-blue-700">{c.type}</span>
                            <span className="text-blue-500">#{c.reference}</span>
                            {c.issuer && <span className="text-gray-400">— {c.issuer}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {evt.notes && (
                    <div className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2.5 border border-gray-100 italic">
                      {evt.notes}
                    </div>
                  )}

                  {/* Recorded time */}
                  <div className="text-xs text-gray-400">
                    Event recorded: {new Date(evt.recorded_time || evt.event_time).toLocaleString('en-EU', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EpcSection({ label, epcs = [], direction }) {
  if (!epcs.length) return null;
  const icon = direction === 'in' ? '⬇️' : direction === 'out' ? '⬆️' : '🏷️';
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 mb-1.5">{icon} {label}</div>
      <div className="flex flex-wrap gap-1.5">
        {epcs.map((epc, i) => {
          const { scheme, value } = formatEpc(epc);
          return (
            <div key={i} className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1 text-xs font-mono">
              <span className="badge bg-gray-100 text-gray-500 text-xs px-1 py-0">{scheme}</span>
              <span className="text-gray-700">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LocationBox({ label, name, gln }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 px-3 py-2">
      <div className="text-xs font-medium text-gray-500 flex items-center gap-1 mb-1">
        <MapPin size={10} /> {label}
      </div>
      {name && <div className="text-xs font-medium text-gray-700">{name}</div>}
      <div className="text-xs font-mono text-gray-400 mt-0.5">{formatGln(gln)}</div>
    </div>
  );
}

function PartyTag({ party }) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs mb-1">
      <div className="font-medium text-gray-700">{party.name}</div>
      <div className="text-gray-400 font-mono mt-0.5">{formatGln(party.id)}</div>
      {party.type && <div className="badge bg-gray-100 text-gray-500 mt-1 capitalize">{party.type.replace(/_/g,' ')}</div>}
    </div>
  );
}

function IlmdCell({ label, value, highlight, good }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${highlight ? 'bg-blue-50 border border-blue-100' : 'bg-white border border-gray-100'}`}>
      <div className="text-xs text-gray-400 capitalize">{label}</div>
      <div className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-blue-700' : 'text-gray-700'} ${good === false ? 'text-red-600' : ''}`}>
        {value}
      </div>
    </div>
  );
}
