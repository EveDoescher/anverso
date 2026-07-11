import React from 'react';

export default function FigureBlock({ value, onChange }: any) {
  const fig = value.figure || { image: {} };
  return (
    <div className="space-y-2">
      <input type="text" className="w-full border p-2 text-sm rounded" placeholder="Legenda (Caption)" value={fig.caption || ''} onChange={e => onChange({...value, figure: {...fig, caption: e.target.value}})} />
      <input type="text" className="w-full border p-2 text-sm rounded" placeholder="Fonte" value={fig.source || ''} onChange={e => onChange({...value, figure: {...fig, source: e.target.value}})} />
      <input type="text" className="w-full border p-2 text-sm rounded" placeholder="URL da Imagem" value={fig.image?.url || ''} onChange={e => onChange({...value, figure: {...fig, image: {...fig.image, sourceType: 'URL', url: e.target.value}}})} />
    </div>
  );
}
