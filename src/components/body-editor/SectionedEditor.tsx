import React from 'react';
import BodyEditor from './BodyEditor';
import { Trash2, Plus, Layers } from 'lucide-react';

export default function SectionedEditor({ value, onChange }: any) {
  const items = value || [];

  const addItem = () => {
    onChange([...items, { title: 'Novo Item', sections: [] }]);
  };

  const removeItem = (idx: number) => {
    const newItems = [...items];
    newItems.splice(idx, 1);
    onChange(newItems);
  };

  return (
    <div className="bg-slate-50/50 p-4 md:p-6 rounded-xl border border-slate-200">
      {items.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <p className="text-slate-500 mb-4 text-sm">Não há nenhum item secionado adicionado ainda.</p>
          <button type="button" onClick={addItem} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Adicionar Primeiro Item
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {items.map((item: any, idx: number) => (
              <div key={idx} className="border border-slate-200 p-5 bg-white rounded-xl shadow-sm relative group">
                 <button 
                   type="button" 
                   onClick={() => removeItem(idx)} 
                   className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1.5 rounded-full transition-colors hover:bg-red-50"
                   title="Remover Item"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
                 <div className="flex items-center gap-3 mb-5">
                   <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                     {idx + 1}
                   </div>
                   <input 
                     className="font-bold text-lg border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-1 pb-1 w-[80%] text-slate-800 bg-transparent transition-colors" 
                     value={item.title} 
                     onChange={e => {
                        const newItems = [...items];
                        newItems[idx].title = e.target.value;
                        onChange(newItems);
                     }}
                     placeholder="Título do Item (Ex: Apêndice A)"
                   />
                 </div>
                 <div className="rounded-lg">
                   <BodyEditor 
                     value={item.sections} 
                     onChange={(sections: any) => {
                        const newItems = [...items];
                        newItems[idx].sections = sections;
                        onChange(newItems);
                     }}
                   />
                 </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="mt-6 flex items-center justify-center w-full gap-2 bg-white border-2 border-dashed border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 px-4 py-3 rounded-xl font-medium text-sm transition-colors">
            <Layers className="w-4 h-4" /> Adicionar Novo Item Secionado
          </button>
        </>
      )}
    </div>
  );
}
