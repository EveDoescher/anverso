'use client';

import { BuilderSection } from '@/app/create-profile/[[...id]]/page';
import { AlertTriangle } from 'lucide-react';

interface SidebarProps {
  activeSection: BuilderSection;
  onSectionChange: (s: BuilderSection) => void;
  errors: Partial<Record<BuilderSection, string[]>>;
  onSave: () => void;
  isSaving: boolean;
}

const SECTIONS: { id: BuilderSection; label: string }[] = [
  { id: 'profile', label: 'Perfil' },
  { id: 'page', label: 'Página' },
  { id: 'components', label: 'Seções do Documento' },
  { id: 'textual', label: 'Elementos Textuais' },
  { id: 'postprocessing', label: 'Pós-processamento' },
];

export function BuilderSidebar({ activeSection, onSectionChange, errors, onSave, isSaving }: SidebarProps) {
  return (
    <aside className="w-52 shrink-0 flex flex-col border-r border-slate-200 bg-white h-full">
      <div className="p-4 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Builder</span>
      </div>

      <nav className="flex-1 py-2">
        {SECTIONS.map(s => {
          const sectionErrors = errors[s.id] ?? [];
          const hasError = sectionErrors.length > 0;
          const isActive = activeSection === s.id;

          return (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span>{s.label}</span>
              {hasError && (
                <span title={sectionErrors.join(', ')}><AlertTriangle size={13} className="text-orange-500 shrink-0" /></span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {isSaving ? 'Salvando...' : 'Salvar Perfil'}
        </button>
      </div>
    </aside>
  );
}
