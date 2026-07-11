import React from 'react';

export default function ParagraphBlock({ value, onChange }: any) {
  const text = value.text || (value.content?.[0]?.text) || '';
  
  return (
    <textarea 
      className="w-full border p-2 rounded text-sm" 
      rows={3}
      placeholder="Digite o parágrafo..."
      value={text}
      onChange={e => onChange({ ...value, text: e.target.value, content: [{ type: 'TEXT', text: e.target.value }] })}
    />
  );
}
