import React from 'react';

export default function InlineEditor({ value, onChange }: any) {
  return (
    <textarea 
      className="w-full border p-2 text-sm rounded mt-2" 
      rows={3} 
      value={value.text || ''} 
      onChange={e => onChange({ ...value, type: 'TEXT', text: e.target.value })}
      placeholder="Conteúdo do texto"
    />
  );
}
