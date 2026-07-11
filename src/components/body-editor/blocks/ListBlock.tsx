import React from 'react';

export default function ListBlock({ value, onChange }: any) {
  const list = value.list || { items: [] };
  
  const addItem = () => {
    onChange({ ...value, list: { ...list, items: [...list.items, { content: [{ type: 'TEXT', text: '' }] }] } });
  };
  
  return (
    <div className="space-y-2">
      {list.items.map((item: any, idx: number) => (
         <div key={idx} className="flex gap-2">
            <span className="font-bold">{idx + 1}.</span>
            <input 
               type="text" 
               className="w-full border p-1 text-sm rounded"
               value={item.content?.[0]?.text || ''}
               onChange={e => {
                  const newItems = [...list.items];
                  newItems[idx].content = [{ type: 'TEXT', text: e.target.value }];
                  onChange({ ...value, list: { ...list, items: newItems } });
               }}
            />
         </div>
      ))}
      <button type="button" onClick={addItem} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">+ Item</button>
    </div>
  );
}
