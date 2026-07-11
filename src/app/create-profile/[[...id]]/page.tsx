'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import {
  BuilderState,
  ComponentState,
  ComponentRuleType,
  StyleRule,
  PageState,
  PostProcessingState,
  defaultBuilderState,
  defaultBodyContentState,
  defaultStyleRule,
  serializeState,
  deserializeContract,
} from '@/lib/profileSerializer';
import { AlertModal, AlertModalType } from '@/components/ui/AlertModal';
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
    add('components', 'Nenhum componente de Corpo do Texto. Adicione um BODY_CONTENT.');
  }
  if (bodyCount > 1) {
    add('components', 'Apenas um componente BODY_CONTENT é permitido.');
  }

  for (const comp of state.components) {
    if (comp.ruleType === 'BIBLIOGRAPHY') {
      const formats = comp.entryFormats ?? {};
      if (Object.keys(formats).length === 0) {
        add('components', `Componente "${comp.id}": configure ao menos um formato de entrada.`);
      }
    }
    if (comp.ruleType === 'ELEMENT_INDEX' || comp.ruleType === 'SECTION_INDEX') {
      if (!comp.headingText?.trim()) {
        add('components', `Componente "${comp.id}": título não pode estar vazio.`);
      }
    }
    if (comp.ruleType === 'SINGLE_PAGE') {
      for (const slot of comp.slots ?? []) {
        if (slot.required && !slot.styleId) {
          add('components', `Slot obrigatório "${slot.id}" (${comp.id}) sem estilo definido.`);
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
      errs.push('Sem formatos de entrada configurados.');
    }
    if ((comp.ruleType === 'ELEMENT_INDEX' || comp.ruleType === 'SECTION_INDEX') && !comp.headingText?.trim()) {
      errs.push('Título vazio.');
    }
    if (comp.ruleType === 'SINGLE_PAGE') {
      for (const slot of comp.slots ?? []) {
        if (slot.required && !slot.styleId) errs.push(`Slot "${slot.id}" obrigatório sem estilo.`);
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
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
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
        className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
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
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            value={state.name}
            onChange={e => setState(s => ({ ...s, name: e.target.value }))}
            placeholder="Ex: ABNT 2023"
          />
        </FormField>
        <FormField label="Descrição">
          <textarea
            className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
            rows={3}
            value={state.description}
            onChange={e => setState(s => ({ ...s, description: e.target.value }))}
            placeholder="Descreva as regras e o uso recomendado..."
          />
        </FormField>
        <label className="flex items-center gap-3 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
          <Switch.Root
            checked={state.isPublic}
            onCheckedChange={v => setState(s => ({ ...s, isPublic: v }))}
            className={`w-10 h-6 rounded-full transition-colors ${state.isPublic ? 'bg-blue-600' : 'bg-slate-300'}`}
          >
            <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
          </Switch.Root>
          <div>
            <p className="text-sm font-medium text-slate-700">Perfil público</p>
            <p className="text-xs text-slate-400">Outros usuários poderão visualizar e usar este perfil.</p>
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
          <h2 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Dimensões e orientação</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Formato de papel">
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                value={page.orientation}
                onChange={e => updatePage('orientation', e.target.value as 'PORTRAIT' | 'LANDSCAPE')}
              >
                <option value="PORTRAIT">Retrato</option>
                <option value="LANDSCAPE">Paisagem</option>
              </select>
            </FormField>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Largura (cm)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                disabled={page.paperFormat !== 'Custom'}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                value={page.widthCm}
                onChange={e => updatePage('widthCm', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Altura (cm)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                disabled={page.paperFormat !== 'Custom'}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                value={page.heightCm}
                onChange={e => updatePage('heightCm', Number(e.target.value))}
              />
              {page.paperFormat !== 'Custom' && (
                <p className="text-[10px] text-slate-400 mt-0.5">Selecione "Personalizado" para editar</p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Margens (cm)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <NumberInput label="Superior" value={page.marginTopCm} onChange={v => updatePage('marginTopCm', v)} />
            <NumberInput label="Inferior" value={page.marginBottomCm} onChange={v => updatePage('marginBottomCm', v)} />
            <NumberInput label="Esquerda" value={page.marginLeftCm} onChange={v => updatePage('marginLeftCm', v)} />
            <NumberInput label="Direita" value={page.marginRightCm} onChange={v => updatePage('marginRightCm', v)} />
          </div>
        </section>

        <section>
          <h2 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Fonte base</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Família padrão">
              <select
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                value={page.fontRoles.defaultFamily}
                onChange={e => updatePage('fontRoles', { ...page.fontRoles, defaultFamily: e.target.value })}
              >
                {['Times New Roman', 'Arial', 'Calibri', 'Georgia', 'Verdana'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
            <h2 className="text-base font-bold text-slate-800">Numeração de páginas</h2>
            <Switch.Root
              checked={pn.enabled}
              onCheckedChange={v => updatePageNumbering('enabled', v)}
              className={`w-10 h-6 rounded-full transition-colors ${pn.enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform translate-x-1 data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
          {pn.enabled && componentIds.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              <p className="font-semibold mb-1">Ainda sem seções criadas</p>
              <p>Crie as seções do documento na aba <strong>Componentes</strong> primeiro. Depois volte aqui para definir a partir de qual seção a contagem e a exibição do número de página começam.</p>
            </div>
          )}
          {pn.enabled && componentIds.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Começar a contar a partir de" hint="A página desta seção será a número 1, mas o número pode não aparecer ainda">
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  value={pn.countFromComponentId}
                  onChange={e => updatePageNumbering('countFromComponentId', e.target.value)}>
                  <option value="">— Selecione uma seção —</option>
                  {state.components.map(c => <option key={c.id} value={c.id}>{c.displayName || c.id}</option>)}
                </select>
              </FormField>
              <FormField label="Mostrar número a partir de" hint="A partir desta seção o número aparece impresso na folha">
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  value={pn.visibleFromComponentId}
                  onChange={e => updatePageNumbering('visibleFromComponentId', e.target.value)}>
                  <option value="">— Selecione uma seção —</option>
                  {state.components.map(c => <option key={c.id} value={c.id}>{c.displayName || c.id}</option>)}
                </select>
              </FormField>
              <FormField label="Posição na página">
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500"
                  value={pn.placement}
                  onChange={e => updatePageNumbering('placement', e.target.value as PageState['pageNumbering']['placement'])}>
                  <option value="HEADER_RIGHT">Cabeçalho direito</option>
                  <option value="HEADER_CENTER">Cabeçalho centralizado</option>
                  <option value="FOOTER_RIGHT">Rodapé direito</option>
                  <option value="FOOTER_CENTER">Rodapé centralizado</option>
                </select>
              </FormField>
              <div className="grid grid-cols-2 gap-2">
                <NumberInput label="Dist. da borda vertical (cm)" value={pn.verticalDistanceFromEdgeCm} onChange={v => updatePageNumbering('verticalDistanceFromEdgeCm', v)} />
                <NumberInput label="Dist. da borda horizontal (cm)" value={pn.horizontalDistanceFromEdgeCm} onChange={v => updatePageNumbering('horizontalDistanceFromEdgeCm', v)} />
              </div>
            </div>
          )}
          {!pn.enabled && (
            <p className="text-sm text-slate-400 italic">Numeração de páginas desabilitada.</p>
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
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
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
        <div className="border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Correção de títulos órfãos</p>
              <p className="text-xs text-slate-400">Move títulos isolados no fim da página para a próxima.</p>
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

        <div className="border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Rótulos de tabelas longas</p>
              <p className="text-xs text-slate-400">Injeta rótulos em tabelas que quebram de página.</p>
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
            <div className="grid grid-cols-3 gap-3">
              {([
                { key: 'continuesLabel', label: 'Início (continua)' },
                { key: 'continuationLabel', label: 'Meio (continuação)' },
                { key: 'conclusionLabel', label: 'Fim (conclusão)' },
              ] as const).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                  <input type="text" className="w-full border border-slate-300 rounded p-2 text-xs focus:ring-2 focus:ring-blue-500"
                    value={pp.tableContinuationLabels[key]}
                    onChange={e => updatePostProcessing('tableContinuationLabels', { ...pp.tableContinuationLabels, [key]: e.target.value })} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">Verificação de integridade</p>
              <p className="text-xs text-slate-400">Avisos via header HTTP ao formatar.</p>
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
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  checked={pp.integrityCheck.checkMarginOverflow}
                  onChange={e => updatePostProcessing('integrityCheck', { ...pp.integrityCheck, checkMarginOverflow: e.target.checked })} />
                <span className="text-sm text-slate-600">Verificar overflow de margens</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  checked={pp.integrityCheck.checkFontSubstitution}
                  onChange={e => updatePostProcessing('integrityCheck', { ...pp.integrityCheck, checkFontSubstitution: e.target.checked })} />
                <span className="text-sm text-slate-600">Verificar substituição de fontes</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="text-sm text-slate-600">Máx. de páginas:</label>
                <input type="number" min="1" className="border border-slate-300 rounded p-1.5 w-20 text-sm"
                  value={pp.integrityCheck.maxPages}
                  onChange={e => updatePostProcessing('integrityCheck', { ...pp.integrityCheck, maxPages: parseInt(e.target.value) })} />
              </div>
            </div>
          )}
        </div>

        <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Exportar PDF simultâneo</p>
            <p className="text-xs text-slate-400">Gera PDF além do DOCX padrão.</p>
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
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4 shadow-sm">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 transition">
            ← Voltar
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <h1 className="text-lg font-bold text-slate-800">Novo Perfil de Formatação</h1>
        </header>

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
          {/* Opção 1: do zero */}
          <div
            onClick={() => setShowStartScreen(false)}
            className="bg-white border-2 border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-8 cursor-pointer transition group"
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition">
                +
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition">Criar do zero</h2>
                <p className="text-slate-500 text-sm">Comece com uma página em branco e defina todas as regras manualmente.</p>
              </div>
            </div>
          </div>

          {/* Opção 2: usar como base */}
          <div>
            <h2 className="text-base font-bold text-slate-700 mb-1">Ou usar um perfil existente como ponto de partida</h2>
            <p className="text-sm text-slate-400 mb-4">Todas as configurações serão copiadas. Você pode alterar o que quiser antes de salvar.</p>

            {loadingStartProfiles && (
              <div className="text-sm text-slate-400 animate-pulse p-6 text-center border border-slate-200 rounded-xl bg-white">
                Carregando perfis disponíveis...
              </div>
            )}

            {!loadingStartProfiles && startProfiles.length === 0 && (
              <div className="text-sm text-slate-400 p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white">
                Nenhum perfil disponível ainda.
              </div>
            )}

            {!loadingStartProfiles && startProfiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {startProfiles.map(p => (
                  <div
                    key={p.id}
                    onClick={() => loadAsBase(p.id)}
                    className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-5 cursor-pointer transition group flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 mb-1 group-hover:text-blue-700 transition">{p.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{p.description || 'Sem descrição.'}</p>
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800 transition flex items-center gap-1">
            ← Voltar
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <input
            type="text"
            className="text-lg font-bold text-slate-800 bg-transparent border-none outline-none focus:ring-0 placeholder-slate-300"
            value={state.name}
            onChange={e => setState(s => ({ ...s, name: e.target.value }))}
            placeholder="Nome do perfil..."
          />
          {hasErrors && (
            <span className="text-xs text-orange-500 font-medium bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
              ⚠ {Object.values(errors).flat().length} problema(s)
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
            <h3 className="text-lg font-bold text-slate-800">Adicionar seção ao documento</h3>
            <p className="text-sm text-slate-500">Cada seção representa uma parte do trabalho acadêmico.</p>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nome da seção</label>
              <input
                type="text"
                autoFocus
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"
                value={newCompName}
                onChange={e => setNewCompName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addComponent(); if (e.key === 'Escape') setShowAddModal(false); }}
                placeholder="Ex: Capa, Folha de Rosto, Resumo..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de seção</label>
              <div className="space-y-1.5">
                {(Object.entries(RULE_TYPE_LABELS) as [ComponentRuleType, string][]).map(([v, l]) => (
                  <label
                    key={v}
                    className={`flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer transition ${
                      newCompType === v ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input type="radio" name="compType" className="text-blue-600"
                      checked={newCompType === v} onChange={() => setNewCompType(v)} />
                    <span className="text-sm text-slate-700">{l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => { setShowAddModal(false); setNewCompName(''); setNewCompType('SINGLE_PAGE'); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">
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
            <h3 className="text-xl font-bold text-slate-900">Opções de Versionamento</h3>
            <p className="text-sm text-slate-600">Como deseja lidar com a versão anterior?</p>
            <div className="space-y-3">
              {[
                { value: true, title: 'Manter versão anterior', desc: 'Usuários mantêm acesso vitalício à versão passada.' },
                { value: false, title: 'Sobrepor versão anterior', desc: 'Versão antiga preservada por 30 dias apenas para backup.' },
              ].map(opt => (
                <label key={String(opt.value)}
                  className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition ${keepOldVersion === opt.value ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="v" checked={keepOldVersion === opt.value} onChange={() => setKeepOldVersion(opt.value)}
                    className="mt-1 w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{opt.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition">
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
