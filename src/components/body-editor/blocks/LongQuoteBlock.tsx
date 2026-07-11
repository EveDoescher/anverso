import React from 'react';

export default function LongQuoteBlock({ value, onChange }: any) {
  return (
    <div className="space-y-2">
      <textarea 
        className="w-full border p-2 rounded text-sm" 
        rows={3}
        placeholder="Texto da citação longa"
        value={value.text || ''}
        onChange={e => onChange({ ...value, text: e.target.value })}
      />
      <div className="flex gap-2">
         <input type="text" className="border p-1 text-sm rounded flex-1" placeholder="Ano" value={value.source?.year || ''} onChange={e => onChange({...value, source: {...value.source, year: e.target.value}})} />
         <input type="text" className="border p-1 text-sm rounded flex-1" placeholder="Página" value={value.source?.page || ''} onChange={e => onChange({...value, source: {...value.source, page: e.target.value}})} />
      </div>
    </div>
  );
}
