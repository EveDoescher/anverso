import React from 'react';

export default function CodeListingBlock({ value, onChange }: any) {
  const code = value.codeListing || {};
  return (
    <div className="space-y-2">
      <input type="text" className="w-full border p-2 text-sm rounded" placeholder="Legenda" value={code.caption || ''} onChange={e => onChange({...value, codeListing: {...code, caption: e.target.value}})} />
      <input type="text" className="w-full border p-2 text-sm rounded" placeholder="Linguagem (ex: java)" value={code.language || ''} onChange={e => onChange({...value, codeListing: {...code, language: e.target.value}})} />
      <textarea className="w-full border p-2 rounded text-sm font-mono" rows={5} placeholder="Código fonte..." value={code.code || ''} onChange={e => onChange({...value, codeListing: {...code, code: e.target.value}})} />
    </div>
  );
}
