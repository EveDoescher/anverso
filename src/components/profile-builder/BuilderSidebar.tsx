'use client';

import { BuilderSection } from '@/app/create-profile/[[...id]]/page';
import { AlertTriangle, Save, Blocks } from 'lucide-react';
import { Button } from '../ui/Button';

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
    <aside className="w-64 shrink-0 flex flex-col border-r border-[var(--color-border-soft)] bg-[var(--color-paper-soft)] h-full">
      <div className="p-6 border-b border-[var(--color-border-soft)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-forest)] text-white flex items-center justify-center shadow-sm">
          <Blocks size={16} />
        </div>
        <span className="text-sm font-extrabold text-[var(--color-espresso)] uppercase tracking-wider">Builder</span>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {SECTIONS.map(s => {
          const sectionErrors = errors[s.id] ?? [];
          const hasError = sectionErrors.length > 0;
          const isActive = activeSection === s.id;

          return (
            <button
              key={s.id}
              onClick={() => onSectionChange(s.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-all rounded-xl text-left ${
                isActive
                  ? 'bg-white text-[var(--color-green)] shadow-sm border border-[var(--color-border-soft)] font-bold'
                  : 'text-[var(--color-neutral)] hover:bg-[rgba(47,44,45,0.06)] hover:text-[var(--color-espresso)] border border-transparent'
              }`}
            >
              <span>{s.label}</span>
              {hasError && (
                <span title={sectionErrors.join(', ')} className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                  <AlertTriangle size={12} className="text-red-500 shrink-0" />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--color-border-soft)] bg-white">
        <Button
          onClick={onSave}
          loading={isSaving}
          variant="primary"
          className="w-full justify-center"
          icon={Save}
        >
          {isSaving ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
      </div>
    </aside>
  );
}
