import React from 'react';

const STATUS_CONFIG = {
  // Product status
  active: { label: 'Active', classes: 'bg-green-100 text-green-800' },
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-700' },
  recalled: { label: 'Recalled', classes: 'bg-red-100 text-red-800' },
  end_of_life: { label: 'End of Life', classes: 'bg-purple-100 text-purple-800' },
  // Compliance
  compliant: { label: 'Compliant', classes: 'bg-green-100 text-green-800' },
  non_compliant: { label: 'Non-Compliant', classes: 'bg-red-100 text-red-800' },
  pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  under_review: { label: 'Under Review', classes: 'bg-blue-100 text-blue-800' },
  // Spare parts
  available: { label: 'Available', classes: 'bg-green-100 text-green-800' },
  limited: { label: 'Limited', classes: 'bg-yellow-100 text-yellow-800' },
  unavailable: { label: 'Unavailable', classes: 'bg-red-100 text-red-800' },
  // Roles
  manufacturer: { label: 'Manufacturer', classes: 'bg-blue-100 text-blue-800' },
  importer: { label: 'Importer', classes: 'bg-indigo-100 text-indigo-800' },
  distributor: { label: 'Distributor', classes: 'bg-cyan-100 text-cyan-800' },
  retailer: { label: 'Retailer', classes: 'bg-teal-100 text-teal-800' },
  recycler: { label: 'Recycler', classes: 'bg-emerald-100 text-emerald-800' },
  regulator: { label: 'Regulator', classes: 'bg-purple-100 text-purple-800' },
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || { label: status, classes: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`badge ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
}
