import React, { useState } from 'react';
import BlockEditor from './BlockEditor';
import { Trash2, Plus, GripVertical, FileText, FolderPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { IconButton } from '../ui/IconButton';

export default function BodyEditor({ value, onChange, maxDepth = 4 }: any) {
  const [sections, setSections] = useState(value || []);

  const updateSections = (newSections: any) => {
    setSections(newSections);
    onChange(newSections);
  };

  const addSection = () => {
    updateSections([...sections, {
      id: crypto.randomUUID(),
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

  const renderSection = (section: any, index: number, path: number[]) => {
    const depth = path.length - 1;
    const sectionNum = getNestedNumber(path);
    const isRoot = depth === 0;

    return (
      <div key={section.id} className={`border border-[var(--color-border-soft)] p-5 my-5 rounded-2xl bg-white shadow-sm relative ml-${isRoot ? '0' : '6'}`}>
        {/* Left accent border to show depth */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-[var(--color-gold)] opacity-80" />
        
        <div className="flex justify-between items-center mb-6 pl-2">
          <div className="flex items-center flex-1 gap-4">
             <span className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-[var(--color-paper-soft)] text-[var(--color-espresso)] border border-[var(--color-border-soft)]">
               {sectionNum}
             </span>
             <input 
               type="text" 
               className={`font-bold ${isRoot ? 'text-xl' : 'text-lg'} text-[var(--color-espresso)] border-b-2 border-transparent hover:border-[var(--color-border-soft)] focus:border-[var(--color-green)] outline-none px-2 pb-1 flex-1 bg-transparent transition-colors`}
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
          <div className="ml-4">
             <IconButton variant="ghost" icon={Trash2} label="Remover Seção" onClick={() => removeSection(path)} className="text-red-500 hover:text-red-600 hover:bg-red-50" />
          </div>
        </div>
        
        <div className="pl-3 pr-1 space-y-5">
          {section.blocks.length > 0 && (
             <div className="space-y-4">
               {section.blocks.map((block: any, bIndex: number) => (
                  <div key={bIndex} className="relative group flex gap-3 items-start bg-[var(--color-paper)] p-4 rounded-xl border border-[var(--color-border-soft)]">
                    <div className="mt-3 text-[var(--color-neutral)]/50 group-hover:text-[var(--color-neutral)] cursor-move transition-colors">
                      <GripVertical className="w-5 h-5" />
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
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity self-start mt-2">
                      <IconButton variant="ghost" icon={Trash2} label="Remover Bloco" onClick={() => removeBlock(path, bIndex)} className="text-red-500 hover:bg-red-50" />
                    </div>
                  </div>
               ))}
             </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="ghost" icon={FileText} onClick={() => {
               const newSections = [...sections];
               let current = newSections;
               for(let i=0; i<path.length-1; i++) current = current[path[i]].subsections;
               current[path[path.length-1]].blocks.push({ type: 'PARAGRAPH', content: [] });
               updateSections(newSections);
            }}>
              Adicionar Bloco
            </Button>
            
            {section.level < maxDepth && (
               <Button variant="secondary" icon={FolderPlus} onClick={() => {
                 const newSections = [...sections];
                 let current = newSections;
                 for(let i=0; i<path.length-1; i++) current = current[path[i]].subsections;
                 current[path[path.length-1]].subsections.push({
                    id: crypto.randomUUID(),
                    level: section.level + 1,
                    title: 'Nova Subseção',
                    blocks: [],
                    subsections: []
                 });
                 updateSections(newSections);
               }}>
                 Subseção (Nível {section.level + 1})
               </Button>
            )}
          </div>

          {section.subsections.length > 0 && (
             <div className="mt-6 border-t border-[var(--color-border-soft)] pt-4">
               {section.subsections.map((sub: any, sIdx: number) => renderSection(sub, sIdx, [...path, sIdx]))}
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[var(--color-paper-soft)] p-5 md:p-8 rounded-3xl border border-[var(--color-border)] shadow-sm">
      {sections.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[var(--color-border-soft)] rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-success-bg)] flex items-center justify-center mb-6 shadow-sm border border-[var(--color-success-soft)]">
            <FileText className="w-8 h-8 text-[var(--color-green)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-espresso)] mb-2">Editor de Conteúdo</h3>
          <p className="text-[var(--color-neutral)] mb-8 max-w-sm text-center">Comece estruturando o documento através de seções e subseções textuais.</p>
          <Button variant="primary" icon={Plus} size="lg" onClick={addSection}>
            Criar Primeira Seção
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {sections.map((s: any, idx: number) => renderSection(s, idx, [idx]))}
          </div>
          <div className="mt-8 flex justify-center">
             <Button variant="primary" icon={Plus} size="lg" onClick={addSection}>
               Nova Seção Principal
             </Button>
          </div>
        </>
      )}
    </div>
  );
}
