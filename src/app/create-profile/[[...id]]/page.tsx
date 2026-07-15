'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import {
  BuilderState,
  ComponentState,
  ComponentRuleType,
  StyleRule,
  PageState,
  PostProcessingState,
  FontRole,
  defaultBuilderState,
  defaultBodyContentState,
  defaultStyleRule,
  serializeState,
  deserializeContract,
} from '@/lib/profileSerializer';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { BuilderSidebar } from '@/components/profile-builder/BuilderSidebar';
import { ComponentList } from '@/components/profile-builder/ComponentList';
import { ComponentVisualPanel } from '@/components/profile-builder/ComponentVisualPanel';
import { InspectorPanel } from '@/components/profile-builder/InspectorPanel';
import { TextualElementsGallery } from '@/components/profile-builder/TextualElementsGallery';
import * as Switch from '@radix-ui/react-switch';
import * as Select from '@radix-ui/react-select';

export type BuilderSection = 'profile' | 'page' | 'components' | 'textual' | 'postprocessing';

// ──────────────────────────────────────────
// Validation
// ──────────────────────────────────────────

function validate(state: BuilderState): Partial<Record<BuilderSection, string[]>> {
  const errors: Partial<Record<BuilderSection, string[]>> = {};

  function add(section: BuilderSection, msg: string) {
    if (!errors[section]) errors[section] = [];
    errors[section]!.push(msg);
  }

  if (!state.name.trim()) add('profile', 'Nome do perfil é obrigatório.');

  const bodyCount = state.components.filter(c => c.ruleType === 'BODY_CONTENT').length;
  if (state.components.length > 0 && bodyCount === 0) {
    add('components', 'Nenhuma seção de Corpo do Texto criada. Adicione um componente do tipo "Corpo do Texto (Capítulos)".');
  }
  if (bodyCount > 1) {
    add('components', 'Apenas um Corpo do Texto é permitido por perfil.');
  }

  for (const comp of state.components) {
    const name = comp.displayName || comp.id;
    if (comp.ruleType === 'BIBLIOGRAPHY') {
      const formats = comp.entryFormats ?? {};
      if (Object.keys(formats).length === 0) {
        add('components', `"${name}": configure ao menos um formato de referência.`);
      }
    }
    if (comp.ruleType === 'ELEMENT_INDEX' || comp.ruleType === 'SECTION_INDEX') {
      if (!comp.headingText?.trim()) {
        add('components', `"${name}": o título da página não pode estar vazio.`);
      }
      if (!comp.sourceComponentId?.trim()) {
        add('components', `"${name}": selecione o corpo do texto de origem.`);
      }
    }
    if (comp.ruleType === 'SINGLE_PAGE') {
      for (const slot of comp.slots ?? []) {
        if (slot.required && !slot.styleId) {
          add('components', `"${name}": o campo "${slot.displayName || slot.id}" é obrigatório e não tem estilo definido.`);
        }
      }
    }
  }

  return errors;
}

function componentErrors(state: BuilderState): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const comp of state.components) {
    const errs: string[] = [];
    if (comp.ruleType === 'BIBLIOGRAPHY' && Object.keys(comp.entryFormats ?? {}).length === 0) {
      errs.push('Nenhum formato de referência configurado.');
    }
    if ((comp.ruleType === 'ELEMENT_INDEX' || comp.ruleType === 'SECTION_INDEX') && !comp.headingText?.trim()) {
      errs.push('Título da página vazio.');
    }
    if ((comp.ruleType === 'ELEMENT_INDEX' || comp.ruleType === 'SECTION_INDEX') && !comp.sourceComponentId?.trim()) {
      errs.push('Corpo do texto de origem não selecionado.');
    }
    if (comp.ruleType === 'SINGLE_PAGE') {
      for (const slot of comp.slots ?? []) {
        if (slot.required && !slot.styleId) errs.push(`Campo "${slot.displayName || slot.id}" sem estilo definido.`);
      }
    }
    if (errs.length > 0) out[comp.id] = errs;
  }
  return out;
}

// ──────────────────────────────────────────
// Small UI helpers
// ──────────────────────────────────────────

function FormField({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-[var(--color-neutral)]/70 mt-0.5">{hint}</p>}
    </div>
  );
}

function NumberInput({ label, value, onChange, step = 0.1, min, hint }: {
  label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; hint?: string;
}) {
  return (
    <FormField label={label} hint={hint}>
      <input
        type="number"
        step={step}
        min={min}
        className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm text-[var(--color-espresso)] focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </FormField>
  );
}

const RULE_TYPE_LABELS: Record<ComponentRuleType, string> = {
  SINGLE_PAGE: 'Página Única (Capa, Folha de Rosto...)',
  FLOW_TEXTUAL: 'Texto Livre (Agradecimentos, Epígrafe...)',
  BIBLIOGRAPHY: 'Lista de Referências',
  BODY_CONTENT: 'Corpo do Texto (Capítulos)',
  SECTIONED: 'Secionado (Apêndices, Anexos)',
  ELEMENT_INDEX: 'Índice de Elementos (Lista de Figuras...)',
  SECTION_INDEX: 'Sumário',
};

// ──────────────────────────────────────────
// Page
// ──────────────────────────────────────────

export default function CreateProfile() {
  const params = useParams();
  const profileId = params?.id ? (params.id as string[])[0] : null;
  const isEditMode = !!profileId;
  const router = useRouter();

  const [state, setState] = useState<BuilderState>(defaultBuilderState());
  const [activeSection, setActiveSection] = useState<BuilderSection>('profile');
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [keepOldVersion, setKeepOldVersion] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<ComponentRuleType>('SINGLE_PAGE');

  // Tela inicial — só aparece no modo criação
  const [showStartScreen, setShowStartScreen] = useState(!isEditMode);
  const [startProfiles, setStartProfiles] = useState<{ id: string; name: string; description: string }[]>([]);
  const [loadingStartProfiles, setLoadingStartProfiles] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    show: boolean; title: string; message: string; type: AlertModalType; redirectUrl?: string;
  }>({ show: false, title: '', message: '', type: 'info' });

  function showAlert(title: string, message: string, type: AlertModalType, redirectUrl?: string) {
    setModalConfig({ show: true, title, message, type, redirectUrl });
  }
  function closeModal() {
    const url = modalConfig.redirectUrl;
    setModalConfig(prev => ({ ...prev, show: false }));
    if (url) router.push(url);
  }

  const errors = validate(state);
  const compErrors = componentErrors(state);
  const hasErrors = Object.keys(errors).length > 0;
  const bodyContent = state.components.find(c => c.ruleType === 'BODY_CONTENT');

  // ── Load profiles for start screen ──
  useEffect(() => {
    if (isEditMode) return;
    setLoadingStartProfiles(true);
    fetchApi('/api/v1/profiles')
      .then(r => r.json())
      .then(data => setStartProfiles(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingStartProfiles(false));
  }, [isEditMode]);

  async function loadAsBase(id: string) {
    try {
      const res = await fetchApi(`/api/v1/profiles/${id}`);
      const data = await res.json();
      const raw = typeof data.profileData === 'string' ? JSON.parse(data.profileData) : data.profileData;
      const loaded = deserializeContract(raw ?? {});
      // Limpa nome e descrição para o usuário preencher o novo perfil
      loaded.name = '';
      loaded.description = '';
      setState(loaded);
      setShowStartScreen(false);
    } catch {
      showAlert('Erro', 'Não foi possível carregar o perfil selecionado.', 'error');
    }
  }

  // ── Load for edit mode ──
  useEffect(() => {
    if (!isEditMode) return;
    fetchApi(`/api/v1/profiles/${profileId}`)
      .then(r => r.json())
      .then(data => {
        const raw = typeof data.profileData === 'string' ? JSON.parse(data.profileData) : data.profileData;
        const loaded = deserializeContract(raw ?? {});
        loaded.name = data.name ?? loaded.name;
        loaded.description = data.description ?? '';
        loaded.isPublic = data.isPublic ?? true;
        setState(loaded);
      })
      .catch(() => showAlert('Erro', 'Não foi possível carregar o perfil.', 'error'));
  }, [isEditMode, profileId]);

  // ── Helpers ──
  function updatePage<K extends keyof PageState>(key: K, value: PageState[K]) {
    setState(s => ({ ...s, page: { ...s.page, [key]: value } }));
  }
  function updatePageNumbering<K extends keyof PageState['pageNumbering']>(key: K, value: PageState['pageNumbering'][K]) {
    setState(s => ({ ...s, page: { ...s.page, pageNumbering: { ...s.page.pageNumbering, [key]: value } } }));
  }
  function updatePostProcessing<K extends keyof PostProcessingState>(key: K, value: PostProcessingState[K]) {
    setState(s => ({ ...s, postProcessing: { ...s.postProcessing, [key]: value } }));
  }
  function updateComponent(updated: ComponentState) {
    setState(s => ({ ...s, components: s.components.map(c => c.id === updated.id ? updated : c) }));
  }
  function addStyleRule(rule: StyleRule) {
    setState(s => ({
      ...s,
      styleRules: s.styleRules.some(r => r.id === rule.id)
        ? s.styleRules.map(r => r.id === rule.id ? rule : r)
        : [...s.styleRules, rule],
    }));
  }

  const selectedComponent = state.components.find(c => c.id === selectedComponentId) ?? null;

  function nameToId(name: string): string {
    return name
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      || 'componente';
  }

  function addComponent() {
    if (!newCompName.trim()) return;
    const baseId = nameToId(newCompName.trim());
    const id = state.components.find(c => c.id === baseId)
      ? `${baseId}_${state.components.length}`
      : baseId;
    const comp: ComponentState = {
      id,
      displayName: newCompName.trim(),
      ruleType: newCompType,
      enabled: true,
      ...(newCompType === 'SINGLE_PAGE' && { slots: [], policy: undefined }),
      ...(newCompType === 'FLOW_TEXTUAL' && { flowItems: [] }),
      ...(newCompType === 'BODY_CONTENT' && { bodyContent: defaultBodyContentState() }),
    };
    setState(s => ({ ...s, components: [...s.components, comp] }));
    setSelectedComponentId(id);
    setSelectedSlotId(null);
    setActiveSection('components');
    setShowAddModal(false);
    setNewCompName('');
    setNewCompType('SINGLE_PAGE');
  }

  function deleteComponent(id: string) {
    setState(s => ({ ...s, components: s.components.filter(c => c.id !== id) }));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
      setSelectedSlotId(null);
    }
  }

  // ── Save ──
  async function handleSave() {
    if (hasErrors) {
      const firstSection = Object.keys(errors)[0] as BuilderSection;
      showAlert('Validação', Object.values(errors).flat().join('\n'), 'error');
      setActiveSection(firstSection);
      return;
    }

    if (isEditMode) {
      setShowVersionModal(true);
      return;
    }

    await doSave();
  }

  async function doSave(keepOld?: boolean) {
    setIsSaving(true);
    try {
      const contract = serializeState(state, isEditMode ? undefined : undefined);
      const payload = {
        name: state.name,
        description: state.description,
        isPublic: state.isPublic,
        profileData: JSON.stringify(contract),
        ...(isEditMode && {
          keepOldVersion: keepOld ?? keepOldVersion,
          oldVersionName: `v${Date.now()}`,
        }),
      };

      const res = await fetchApi(
        isEditMode ? `/api/v1/profiles/${profileId}` : '/api/v1/profiles',
        { method: isEditMode ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error(await res.text());
      showAlert('Sucesso', isEditMode ? 'Perfil atualizado!' : 'Perfil criado!', 'success', '/dashboard');
    } catch (e: unknown) {
      showAlert('Erro', (e instanceof Error ? e.message : String(e)) || 'Erro ao salvar.', 'error');
    } finally {
      setIsSaving(false);
      setShowVersionModal(false);
    }
  }

  // ──────────────────────────────────────────
  // Section renderers
  // ──────────────────────────────────────────

  function renderProfile() {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
        <FormField label="Nome do Perfil">
          <input
            type="text"
            className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            value={state.name}
            onChange={e => setState(s => ({ ...s, name: e.target.value }))}
            placeholder="Ex: ABNT 2023"
          />
        </FormField>
        <FormField label="Descrição">
          <textarea
            className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={state.description}
            onChange={e => setState(s => ({ ...s, description: e.target.value }))}
            placeholder="Descreva as regras e o uso recomendado..."
          />
        </FormField>
        <label className="flex items-center gap-3 cursor-pointer p-3 border border-[var(--color-border-soft)] rounded-lg hover:bg-[var(--color-paper)]">
          <Switch.Root
            checked={state.isPublic}
            onCheckedChange={v => setState(s => ({ ...s, isPublic: v }))}
            className={`w-10 h-6 rounded-full transition-colors ${state.isPublic ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
          </Switch.Root>
          <div>
            <p className="text-sm font-medium text-[var(--color-espresso)]">Perfil público</p>
            <p className="text-xs text-[var(--color-neutral)]/70">Outros usuários poderão visualizar e usar este perfil.</p>
          </div>
        </label>
      </div>
    );
  }

  function renderPage() {
    const page = state.page;
    const pn = page.pageNumbering;
    const componentIds = state.components.map(c => c.id);

    return (
      <div className="max-w-3xl mx-auto space-y-8 py-6 px-4">
        <section>
          <h2 className="text-base font-bold text-[var(--color-espresso)] mb-4 border-b border-[var(--color-border-soft)] pb-2">Dimensões e orientação</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Formato de papel">
              <select
                className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                value={page.paperFormat}
                onChange={e => {
                  const fmt = e.target.value as PageState['paperFormat'];
                  const presets: Record<string, [number, number]> = {
                    A3: [29.7, 42],
                    A4: [21, 29.7],
                    A5: [14.8, 21],
                    Letter: [21.59, 27.94],
                    Legal: [21.59, 35.56],
                    Tabloid: [27.94, 43.18],
                  };
                  if (presets[fmt]) {
                    updatePage('widthCm', presets[fmt][0]);
                    updatePage('heightCm', presets[fmt][1]);
                  }
                  updatePage('paperFormat', fmt);
                }}
              >
                <option value="A3">A3 (29.7 × 42 cm)</option>
                <option value="A4">A4 (21 × 29.7 cm)</option>
                <option value="A5">A5 (14.8 × 21 cm)</option>
                <option value="Letter">Carta / Letter (21.59 × 27.94 cm)</option>
                <option value="Legal">Legal (21.59 × 35.56 cm)</option>
                <option value="Tabloid">Tabloid (27.94 × 43.18 cm)</option>
                <option value="Custom">Personalizado</option>
              </select>
            </FormField>
            <FormField label="Orientação">
              <select
                className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                value={page.orientation}
                onChange={e => updatePage('orientation', e.target.value as 'PORTRAIT' | 'LANDSCAPE')}
              >
                <option value="PORTRAIT">Retrato</option>
                <option value="LANDSCAPE">Paisagem</option>
              </select>
            </FormField>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Largura (cm)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                disabled={page.paperFormat !== 'Custom'}
                className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm text-[var(--color-espresso)] focus:ring-2 focus:ring-blue-500 disabled:bg-[var(--color-paper-soft)] disabled:text-[var(--color-neutral)]/70 disabled:cursor-not-allowed"
                value={page.widthCm}
                onChange={e => updatePage('widthCm', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Altura (cm)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                disabled={page.paperFormat !== 'Custom'}
                className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm text-[var(--color-espresso)] focus:ring-2 focus:ring-blue-500 disabled:bg-[var(--color-paper-soft)] disabled:text-[var(--color-neutral)]/70 disabled:cursor-not-allowed"
                value={page.heightCm}
                onChange={e => updatePage('heightCm', Number(e.target.value))}
              />
              {page.paperFormat !== 'Custom' && (
                <p className="text-[10px] text-[var(--color-neutral)]/70 mt-0.5">Selecione "Personalizado" para editar</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--color-espresso)] mb-4 border-b border-[var(--color-border-soft)] pb-2">Margens (cm)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NumberInput label="Superior" value={page.marginTopCm} onChange={v => updatePage('marginTopCm', v)} />
            <NumberInput label="Inferior" value={page.marginBottomCm} onChange={v => updatePage('marginBottomCm', v)} />
            <NumberInput label="Esquerda" value={page.marginLeftCm} onChange={v => updatePage('marginLeftCm', v)} />
            <NumberInput label="Direita" value={page.marginRightCm} onChange={v => updatePage('marginRightCm', v)} />
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-[var(--color-espresso)] mb-1 border-b border-[var(--color-border-soft)] pb-2">Famílias de fonte</h2>
          <p className="text-xs text-[var(--color-neutral)] mb-3">Defina qual família tipográfica usar para o corpo do texto, títulos e código. O papel "Fonte principal" é obrigatório.</p>
          <div className="space-y-3">
            {page.fontRoles.roles.map((role, ri) => {
              const FONT_ROLE_LABELS: Record<string, string> = {
                baseFont: 'Fonte principal (corpo do texto)',
                headingFont: 'Fonte de títulos',
                codeFont: 'Fonte de código',
              };
              const roleLabel = FONT_ROLE_LABELS[role.key] ?? role.key;
              const isBase = role.key === 'baseFont';
              return (
                <div key={ri} className="border border-[var(--color-border-soft)] rounded-lg p-3 space-y-3 bg-white">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-[var(--color-neutral)] mb-0.5">Papel</label>
                      <select
                        className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                        value={role.key}
                        disabled={isBase}
                        onChange={e => {
                          const roles = page.fontRoles.roles.map((r, i) => i === ri ? { ...r, key: e.target.value } : r);
                          updatePage('fontRoles', { roles });
                        }}
                      >
                        <option value="baseFont">Fonte principal (corpo do texto)</option>
                        <option value="headingFont">Fonte de títulos</option>
                        <option value="codeFont">Fonte de código</option>
                        {!['baseFont', 'headingFont', 'codeFont'].includes(role.key) && (
                          <option value={role.key}>{role.key}</option>
                        )}
                      </select>
                      {isBase && <p className="text-[10px] text-[var(--color-neutral)]/70 mt-0.5">Obrigatório — não pode ser removido</p>}
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-[var(--color-neutral)] mb-0.5">Família padrão</label>
                      <select className="w-full border border-[var(--color-border-soft)] rounded p-1.5 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                        value={role.defaultFamily}
                        onChange={e => {
                          const roles = page.fontRoles.roles.map((r, i) => i === ri ? { ...r, defaultFamily: e.target.value } : r);
                          updatePage('fontRoles', { roles });
                        }}>
                        {['Times New Roman', 'Arial', 'Calibri', 'Georgia', 'Verdana', 'Courier New'].map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    {!isBase && (
                      <button
                        className="mt-4 text-red-400 hover:text-red-600 text-lg font-bold px-1"
                        onClick={() => updatePage('fontRoles', { roles: page.fontRoles.roles.filter((_, i) => i !== ri) })}
                      >×</button>
                    )}
                  </div>

                  {state.styleRules.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-semibold text-[var(--color-neutral)] mb-1">Estilos que usam {roleLabel.split(' ')[0].toLowerCase() === 'fonte' ? 'esta' : 'este'} {roleLabel.split(' ').slice(0, 2).join(' ').toLowerCase()}</label>
                      <div className="grid grid-cols-2 gap-1">
                        {state.styleRules.map(r => (
                          <label key={r.id} className="flex items-center gap-1.5 cursor-pointer text-xs text-[var(--color-espresso)] hover:text-[var(--color-espresso)]">
                            <input
                              type="checkbox"
                              className="w-3.5 h-3.5 text-blue-600 rounded border-[var(--color-border-soft)]"
                              checked={role.styleIds.includes(r.id)}
                              onChange={e => {
                                const styleIds = e.target.checked
                                  ? [...role.styleIds, r.id]
                                  : role.styleIds.filter(id => id !== r.id);
                                const roles = page.fontRoles.roles.map((ro, i) => i === ri ? { ...ro, styleIds } : ro);
                                updatePage('fontRoles', { roles });
                              }}
                            />
                            {r.displayName || r.id}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <button
              className="text-blue-600 text-sm hover:underline"
              onClick={() => updatePage('fontRoles', {
                roles: [...page.fontRoles.roles, { key: 'headingFont', defaultFamily: 'Arial', allowedFamilies: [], styleIds: [] }]
              })}
            >+ Adicionar família de fonte</button>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 border-b border-[var(--color-border-soft)] pb-2">
            <h2 className="text-base font-bold text-[var(--color-espresso)]">Numeração de páginas</h2>
            <Switch.Root
              checked={pn.enabled}
              onCheckedChange={v => updatePageNumbering('enabled', v)}
              className={`w-10 h-6 rounded-full transition-colors ${pn.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
          {pn.enabled && componentIds.length === 0 && (
            <div className="p-4 bg-[var(--color-cream)] border border-[var(--color-border-soft)] rounded-lg text-sm text-[var(--color-gold)]">
              <p className="font-semibold mb-1">Ainda sem seções criadas</p>
              <p>Crie as seções do documento na aba <strong>Componentes</strong> primeiro. Depois volte aqui para definir a partir de qual seção a contagem e a exibição do número de página começam.</p>
            </div>
          )}
          {pn.enabled && componentIds.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Começar a contar a partir de" hint="A página desta seção será a número 1, mas o número pode não aparecer ainda">
                <select className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  value={pn.countFromComponentId}
                  onChange={e => updatePageNumbering('countFromComponentId', e.target.value)}>
                  <option value="">— Selecione uma seção —</option>
                  {state.components.map(c => <option key={c.id} value={c.id}>{c.displayName || c.id}</option>)}
                </select>
              </FormField>
              <FormField label="Mostrar número a partir de" hint="A partir desta seção o número aparece impresso na folha">
                <select className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  value={pn.visibleFromComponentId}
                  onChange={e => updatePageNumbering('visibleFromComponentId', e.target.value)}>
                  <option value="">— Selecione uma seção —</option>
                  {state.components.map(c => <option key={c.id} value={c.id}>{c.displayName || c.id}</option>)}
                </select>
              </FormField>
              <FormField label="Posição na página">
                <select className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  value={pn.placement}
                  onChange={e => updatePageNumbering('placement', e.target.value as PageState['pageNumbering']['placement'])}>
                  <option value="HEADER_RIGHT">Cabeçalho direito</option>
                  <option value="HEADER_CENTER">Cabeçalho centralizado</option>
                  <option value="FOOTER_RIGHT">Rodapé direito</option>
                  <option value="FOOTER_CENTER">Rodapé centralizado</option>
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="Dist. da borda vertical (cm)" value={pn.verticalDistanceFromPageEdgeCm} onChange={v => updatePageNumbering('verticalDistanceFromPageEdgeCm', v)} />
                <NumberInput label="Dist. da borda horizontal (cm)" value={pn.horizontalDistanceFromPageEdgeCm} onChange={v => updatePageNumbering('horizontalDistanceFromPageEdgeCm', v)} />
              </div>
            </div>
          )}
          {!pn.enabled && (
            <p className="text-sm text-[var(--color-neutral)]/70 italic">Numeração de páginas desabilitada.</p>
          )}
        </section>
      </div>
    );
  }

  function renderComponents() {
    return (
      <div className="flex flex-1 min-h-0 h-full">
        <ComponentList
          components={state.components}
          selectedId={selectedComponentId}
          onSelect={id => { setSelectedComponentId(id); setSelectedSlotId(null); }}
          onChange={components => setState(s => ({ ...s, components }))}
          onAdd={() => setShowAddModal(true)}
          validationErrors={compErrors}
        />
        <ComponentVisualPanel
          component={selectedComponent}
          selectedSlotId={selectedSlotId}
          onSelectSlot={id => setSelectedSlotId(id)}
          onUpdateComponent={updateComponent}
          styleRules={state.styleRules}
          onAddStyleRule={addStyleRule}
        />
        <InspectorPanel
          component={selectedComponent}
          selectedSlotId={selectedSlotId}
          styleRules={state.styleRules}
          allComponents={state.components}
          onUpdateComponent={updated => { updateComponent(updated); }}
          onAddStyleRule={addStyleRule}
        />
      </div>
    );
  }

  function renderTextualElements() {
    const bc = bodyContent?.bodyContent ?? defaultBodyContentState();
    const onChange = (updated: typeof bc) => {
      if (bodyContent) {
        updateComponent({ ...bodyContent, bodyContent: updated });
      }
    };
    return (
      <div className="max-w-3xl mx-auto py-6 px-4">
        {!bodyContent && (
          <div className="mb-4 bg-[var(--color-cream)] border border-[var(--color-border-soft)] rounded-lg p-3 text-sm text-amber-800">
            Adicione um componente <strong>Corpo do Texto</strong> na seção Componentes para salvar essas configurações.
          </div>
        )}
        <TextualElementsGallery state={bc} onChange={onChange} />
      </div>
    );
  }

  function renderPostProcessing() {
    const pp = state.postProcessing;
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6 px-4">
        <div className="border border-[var(--color-border-soft)] rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-espresso)]">Correção de títulos órfãos</p>
              <p className="text-xs text-[var(--color-neutral)]/70">Move títulos isolados no fim da página para a próxima.</p>
            </div>
            <Switch.Root
              checked={pp.orphanTitleEnabled}
              onCheckedChange={v => updatePostProcessing('orphanTitleEnabled', v)}
              className={`w-10 h-6 rounded-full transition-colors ${pp.orphanTitleEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
        </div>

        <div className="border border-[var(--color-border-soft)] rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-espresso)]">Rótulos de tabelas longas</p>
              <p className="text-xs text-[var(--color-neutral)]/70">Injeta rótulos em tabelas que quebram de página.</p>
            </div>
            <Switch.Root
              checked={pp.tableContinuationLabels.enabled}
              onCheckedChange={v => updatePostProcessing('tableContinuationLabels', { ...pp.tableContinuationLabels, enabled: v })}
              className={`w-10 h-6 rounded-full transition-colors ${pp.tableContinuationLabels.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
          {pp.tableContinuationLabels.enabled && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'continuesLabel', label: 'Início (continua)' },
                  { key: 'continuationLabel', label: 'Meio (continuação)' },
                  { key: 'conclusionLabel', label: 'Fim (conclusão)' },
                ] as const).map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">{label}</label>
                    <input type="text" className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                      value={pp.tableContinuationLabels[key]}
                      onChange={e => updatePostProcessing('tableContinuationLabels', { ...pp.tableContinuationLabels, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Estilo do rótulo</label>
                <select className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                  value={pp.tableContinuationLabels.labelStyleId}
                  onChange={e => updatePostProcessing('tableContinuationLabels', { ...pp.tableContinuationLabels, labelStyleId: e.target.value })}>
                  <option value="">— Selecione —</option>
                  {state.styleRules.map(r => <option key={r.id} value={r.id}>{r.displayName || r.id}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="border border-[var(--color-border-soft)] rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--color-espresso)]">Verificação de integridade</p>
              <p className="text-xs text-[var(--color-neutral)]/70">Avisos via header HTTP ao formatar.</p>
            </div>
            <Switch.Root
              checked={pp.integrityCheck.enabled}
              onCheckedChange={v => updatePostProcessing('integrityCheck', { ...pp.integrityCheck, enabled: v })}
              className={`w-10 h-6 rounded-full transition-colors ${pp.integrityCheck.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
          {pp.integrityCheck.enabled && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-[var(--color-border-soft)]"
                  checked={pp.integrityCheck.checkMarginOverflow}
                  onChange={e => updatePostProcessing('integrityCheck', { ...pp.integrityCheck, checkMarginOverflow: e.target.checked })} />
                <span className="text-sm text-[var(--color-neutral)]">Verificar overflow de margens</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-[var(--color-border-soft)]"
                  checked={pp.integrityCheck.checkFontSubstitution}
                  onChange={e => updatePostProcessing('integrityCheck', { ...pp.integrityCheck, checkFontSubstitution: e.target.checked })} />
                <span className="text-sm text-[var(--color-neutral)]">Verificar substituição de fontes</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="text-sm text-[var(--color-neutral)]">Máx. de páginas:</label>
                <input type="number" min="1" className="border border-[var(--color-border-soft)] rounded p-1.5 w-20 text-sm"
                  value={pp.integrityCheck.maxPages}
                  onChange={e => updatePostProcessing('integrityCheck', { ...pp.integrityCheck, maxPages: parseInt(e.target.value) })} />
              </div>
            </div>
          )}
        </div>

        <div className="border border-[var(--color-border-soft)] rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-espresso)]">Exportar PDF simultâneo</p>
            <p className="text-xs text-[var(--color-neutral)]/70">Gera PDF além do DOCX padrão.</p>
          </div>
          <Switch.Root
            checked={pp.pdfOutputEnabled}
            onCheckedChange={v => updatePostProcessing('pdfOutputEnabled', v)}
            className={`w-10 h-6 rounded-full transition-colors ${pp.pdfOutputEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
          </Switch.Root>
        </div>
      </div>
    );
  }

  // ── Tela inicial (só criação) ──
  if (showStartScreen) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex flex-col font-sans">
        <header className="bg-white border-b border-[var(--color-border-soft)] px-4 py-3 flex items-center gap-4 shadow-sm">
          <Link href="/dashboard" className="text-sm text-[var(--color-neutral)] hover:text-[var(--color-espresso)] transition">
            ← Voltar
          </Link>
          <div className="h-5 w-px bg-[var(--color-border-soft)]" />
          <h1 className="text-lg font-bold text-[var(--color-espresso)]">Novo Perfil de Formatação</h1>
        </header>

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Opção 1: do zero */}
          <div
            onClick={() => setShowStartScreen(false)}
            className="bg-white border-2 border-[var(--color-border-soft)] hover:border-blue-400 hover:shadow-md rounded-xl p-8 cursor-pointer transition group"
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                +
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--color-espresso)] mb-1 group-hover:text-blue-700 transition">Criar do zero</h2>
                <p className="text-[var(--color-neutral)] text-sm">Comece com uma página em branco e defina todas as regras manualmente.</p>
              </div>
            </div>
          </div>

          {/* Opção 2: usar como base */}
          <div>
            <h2 className="text-base font-bold text-[var(--color-espresso)] mb-1">Ou usar um perfil existente como ponto de partida</h2>
            <p className="text-sm text-[var(--color-neutral)]/70 mb-4">Todas as configurações serão copiadas. Você pode alterar o que quiser antes de salvar.</p>

            {loadingStartProfiles && (
              <div className="text-sm text-[var(--color-neutral)]/70 animate-pulse p-6 text-center border border-[var(--color-border-soft)] rounded-xl bg-white">
                Carregando perfis disponíveis...
              </div>
            )}

            {!loadingStartProfiles && startProfiles.length === 0 && (
              <div className="text-sm text-[var(--color-neutral)]/70 p-6 text-center border-2 border-dashed border-[var(--color-border-soft)] rounded-xl bg-white">
                Nenhum perfil disponível ainda.
              </div>
            )}

            {!loadingStartProfiles && startProfiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startProfiles.map(p => (
                  <div
                    key={p.id}
                    onClick={() => loadAsBase(p.id)}
                    className="bg-white border border-[var(--color-border-soft)] hover:border-blue-400 hover:shadow-md rounded-xl p-5 cursor-pointer transition group flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-[var(--color-espresso)] mb-1 group-hover:text-blue-700 transition">{p.name}</h3>
                      <p className="text-sm text-[var(--color-neutral)] line-clamp-3 leading-relaxed">{p.description || 'Sem descrição.'}</p>
                    </div>
                    <p className="text-blue-600 text-sm font-medium mt-4">Usar como base →</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  const isComponentsSection = activeSection === 'components';

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-[var(--color-border-soft)] px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-[var(--color-neutral)] hover:text-[var(--color-espresso)] transition flex items-center gap-1">
            ← Voltar
          </Link>
          <div className="h-5 w-px bg-[var(--color-border-soft)]" />
          <input
            type="text"
            className="text-lg font-bold text-[var(--color-espresso)] bg-transparent border-none outline-none focus:ring-0 placeholder-slate-300"
            value={state.name}
            onChange={e => setState(s => ({ ...s, name: e.target.value }))}
            placeholder="Nome do perfil..."
          />
          {hasErrors && (
            <span className="text-xs text-orange-500 font-medium bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle size={12} /> {Object.values(errors).flat().length} problema(s)
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
        >
          {isSaving ? 'Salvando...' : isEditMode ? 'Atualizar Perfil' : 'Salvar Perfil'}
        </button>
      </header>

      {/* Body */}
      <div className={`flex flex-1 min-h-0 ${isComponentsSection ? 'overflow-hidden h-[calc(100vh-57px)]' : ''}`}>
        <BuilderSidebar
          activeSection={activeSection}
          onSectionChange={s => { setActiveSection(s); setSelectedSlotId(null); }}
          errors={errors}
          onSave={handleSave}
          isSaving={isSaving}
        />

        <main className={`flex-1 min-w-0 ${isComponentsSection ? 'flex overflow-hidden' : 'overflow-auto'}`}>
          {activeSection === 'profile' && renderProfile()}
          {activeSection === 'page' && renderPage()}
          {activeSection === 'components' && renderComponents()}
          {activeSection === 'textual' && renderTextualElements()}
          {activeSection === 'postprocessing' && renderPostProcessing()}
        </main>
      </div>

      {/* Add component modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-espresso)]">Adicionar seção ao documento</h3>
            <p className="text-sm text-[var(--color-neutral)]">Cada seção representa uma parte do trabalho acadêmico.</p>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Nome da seção</label>
              <input
                type="text"
                autoFocus
                className="w-full border border-[var(--color-border-soft)] rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                value={newCompName}
                onChange={e => setNewCompName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addComponent(); if (e.key === 'Escape') setShowAddModal(false); }}
                placeholder="Ex: Capa, Folha de Rosto, Resumo..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-espresso)] mb-1">Tipo de seção</label>
              <div className="space-y-1.5">
                {(Object.entries(RULE_TYPE_LABELS) as [ComponentRuleType, string][]).map(([v, l]) => (
                  <label
                    key={v}
                    className={`flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer transition ${
                      newCompType === v ? 'border-blue-500 bg-blue-50' : 'border-[var(--color-border-soft)] hover:border-[var(--color-border-soft)] hover:bg-[var(--color-paper)]'
                    }`}
                  >
                    <input type="radio" name="compType" className="text-blue-600"
                      checked={newCompType === v} onChange={() => setNewCompType(v)} />
                    <span className="text-sm text-[var(--color-espresso)]">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => { setShowAddModal(false); setNewCompName(''); setNewCompType('SINGLE_PAGE'); }}
                className="px-4 py-2 text-sm font-medium text-[var(--color-neutral)] hover:bg-[var(--color-paper-soft)] rounded-lg transition">
                Cancelar
              </button>
              <button onClick={addComponent} disabled={!newCompName.trim()}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-40">
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Versioning modal */}
      {showVersionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-xl font-bold text-[var(--color-espresso)]">Opções de Versionamento</h3>
            <p className="text-sm text-[var(--color-neutral)]">Como deseja lidar com a versão anterior?</p>
            <div className="space-y-3">
              {[
                { value: true, title: 'Manter versão anterior', desc: 'Usuários mantêm acesso vitalício à versão passada.' },
                { value: false, title: 'Sobrepor versão anterior', desc: 'Versão antiga preservada por 30 dias apenas para backup.' },
              ].map(opt => (
                <label key={String(opt.value)}
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${keepOldVersion === opt.value ? 'border-blue-600 bg-blue-50' : 'border-[var(--color-border-soft)] hover:bg-[var(--color-paper)]'}`}>
                  <input type="radio" name="v" checked={keepOldVersion === opt.value} onChange={() => setKeepOldVersion(opt.value)}
                    className="mt-1 w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-[var(--color-espresso)] text-sm">{opt.title}</p>
                    <p className="text-xs text-[var(--color-neutral)] mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 text-sm font-semibold text-[var(--color-espresso)] hover:bg-[var(--color-paper-soft)] rounded-lg transition">
                Cancelar
              </button>
              <button onClick={() => doSave(keepOldVersion)}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        show={modalConfig.show}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={closeModal}
      />
    </div>
  );
}
