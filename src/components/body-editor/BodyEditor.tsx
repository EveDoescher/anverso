import React, { useState } from 'react';
import BlockEditor from './BlockEditor';
import { Trash2, Plus, GripVertical, FileText, FolderPlus } from 'lucide-react';

export default function BodyEditor({ value, onChange, maxDepth = 4 }: any) {
  const [sections, setSections] = useState(value || []);

  const updateSections = (newSections: any) => {
    setSections(newSections);
    onChange(newSections);
  };

  const addSection = () => {
    updateSections([...sections, {
      id: Math.random().toString(36).substr(2, 9),
      level: 1,
      title: 'Nova Seção',
      blocks: [],
      subsections: []
    }]);
  };

  const removeSection = (path: number[]) => {
    const newSections = [...sections];
    if (path.length === 1) {
      newSections.splice(path[0], 1);
    } else {
      let current = newSections;
      for(let i=0; i<path.length-2; i++) current = current[path[i]].subsections;
      current[path[path.length-2]].subsections.splice(path[path.length-1], 1);
    }
    updateSections(newSections);
  };

  const removeBlock = (path: number[], bIndex: number) => {
    const newSections = [...sections];
    let current = newSections;
    for(let i=0; i<path.length-1; i++) current = current[path[i]].subsections;
    current[path[path.length-1]].blocks.splice(bIndex, 1);
    updateSections(newSections);
  };

  // Helper to get nested number (e.g., "1.2.1")
  const getNestedNumber = (path: number[]) => {
    return path.map(p => p + 1).join('.');
  };

  // Colors per level for visual hierarchy
  const levelStyles = [
    { bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-800', accent: 'border-indigo-400' },
    { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', accent: 'border-blue-400' },
    { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600', accent: 'border-teal-400' },
    { bg: 'bg-slate-200', border: 'border-slate-300', text: 'text-slate-600', accent: 'border-purple-400' }
  ];

  const renderSection = (section: any, index: number, path: number[]) => {
    const depth = path.length - 1;
    const style = levelStyles[Math.min(depth, levelStyles.length - 1)];
    const sectionNum = getNestedNumber(path);

    return (
      <div key={section.id} className={`border ${style.border} p-4 my-4 rounded-xl ${style.bg} shadow-sm relative ml-${depth === 0 ? '0' : '6'}`}>
        {/* Left accent border to show depth */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${style.accent}`} />
        
        <div className="flex justify-between items-center mb-5 pl-2">
          <div className="flex items-center flex-1 gap-3">
             <span className={`font-mono text-xs font-bold px-2 py-1 rounded bg-black/5 ${style.text}`}>
               {sectionNum}
             </span>
             <input 
               type="text" 
               className={`font-bold ${depth === 0 ? 'text-lg' : 'text-md'} ${style.text} border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none px-1 pb-1 flex-1 bg-transparent transition-colors`}
               value={section.title}
               onChange={e => {
                 const newSections = [...sections];
                 let current = newSections;
                 for(let i=0; i<path.length-1; i++) current = current[path[i]].subsections;
                 current[path[path.length-1]].title = e.target.value;
                 updateSections(newSections);
               }}
               placeholder="Título da Seção"
             />
          </div>
          <button type="button" onClick={() => removeSection(path)} className="text-slate-400 hover:text-red-500 ml-4 transition-colors p-1.5 rounded-md hover:bg-red-50 border border-transparent hover:border-red-100" title="Remover Seção">
             <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="pl-2 space-y-4">
          {section.blocks.length > 0 && (
             <div className="space-y-3">
               {section.blocks.map((block: any, bIndex: number) => (
                  <div key={bIndex} className="relative group flex gap-2 items-start">
                    <div className="mt-3 text-slate-300 group-hover:text-slate-400 cursor-move">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-x-hidden">
                      <BlockEditor value={block} onChange={(nb: any) => {
                          const newSections = [...sections];
                          let current = newSections;
                          for(let i=0; i<path.length-1; i++) current = current[path[i]].subsections;
                          current[path[path.length-1]].blocks[bIndex] = nb;
                          updateSections(newSections);
                      }} />
                    </div>
                    <button type="button" onClick={() => removeBlock(path, bIndex)} className="mt-2 text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" title="Remover Bloco">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               ))}
             </div>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            <button type="button" className="flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all shadow-sm" onClick={() => {
               const newSections = [...sections];
               let current = newSections;
               for(let i=0; i<path.length-1; i++) current = current[path[i]].subsections;
               current[path[path.length-1]].blocks.push({ type: 'PARAGRAPH', content: [] });
               updateSections(newSections);
            }}>
              <FileText className="w-3.5 h-3.5" /> Adicionar Bloco
            </button>
            
            {section.level < maxDepth && (
               <button type="button" className="flex items-center gap-1.5 text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all shadow-sm" onClick={() => {
                 const newSections = [...sections];
                 let current = newSections;
                 for(let i=0; i<path.length-1; i++) current = current[path[i]].subsections;
                 current[path[path.length-1]].subsections.push({
                    id: Math.random().toString(36).substr(2, 9),
                    level: section.level + 1,
                    title: 'Nova Subseção',
                    blocks: [],
                    subsections: []
                 });
                 updateSections(newSections);
               }}>
                 <FolderPlus className="w-3.5 h-3.5" /> Adicionar Subseção (Nível {section.level + 1})
               </button>
            )}
          </div>

          <div className="mt-4">
             {section.subsections.map((sub: any, sIdx: number) => renderSection(sub, sIdx, [...path, sIdx]))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50/50 p-4 md:p-6 rounded-xl border border-slate-200">
      {sections.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl bg-white">
          <p className="text-slate-500 mb-4 text-sm">Este conteúdo textual ainda está vazio.</p>
          <button type="button" onClick={addSection} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Começar Primeira Seção
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {sections.map((s: any, idx: number) => renderSection(s, idx, [idx]))}
          </div>
          <button type="button" onClick={addSection} className="mt-6 flex items-center justify-center w-full gap-2 bg-white border-2 border-dashed border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 px-4 py-3 rounded-xl font-medium text-sm transition-colors">
            <Plus className="w-4 h-4" /> Adicionar Nova Seção Principal
          </button>
        </>
      )}
    </div>
  );
}
