import React from 'react';

export default function ScoreRing({ value, max = 100, size = 80, label, color = '#3b82f6', unit = '' }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedValue = Math.min(Math.max(value || 0, 0), max);
  const progress = (normalizedValue / max) * circumference;
  const dash = circumference - progress;

  const getColor = () => {
    const pct = normalizedValue / max;
    if (pct >= 0.7) return '#22c55e';
    if (pct >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  const ringColor = color === 'auto' ? getColor() : color;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="#e5e7eb" strokeWidth={6}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={ringColor} strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={dash}
            strokeLinecap="round"
            className="score-ring"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-gray-800">
            {value != null ? `${normalizedValue}${unit}` : 'N/A'}
          </span>
        </div>
      </div>
      {label && <span className="text-xs text-gray-500 text-center">{label}</span>}
    </div>
  );
}
