import React from 'react';

export default function EquationBlock({ value, onChange }: any) {
  const eq = value.equation || {};
  return (
    <div className="space-y-2">
      <input type="text" className="w-full border p-2 text-sm rounded" placeholder="Equação (ex: E = mc^2)" value={eq.text || ''} onChange={e => onChange({...value, equation: {...eq, text: e.target.value}})} />
      <input type="text" className="w-full border p-2 text-sm rounded" placeholder="Label (para ref cruzada)" value={eq.label || ''} onChange={e => onChange({...value, equation: {...eq, label: e.target.value}})} />
    </div>
  );
}
