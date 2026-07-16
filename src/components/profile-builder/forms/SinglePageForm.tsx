'use client';

import { ComponentState } from '@/lib/profileSerializer';
import { Tooltip } from '../Tooltip';

interface Props {
  comp: ComponentState;
  onChange: (updated: ComponentState) => void;
}

const ANCHOR_STRATEGIES = [
  { value: 'LAST_GROUP_AT_SAFE_AREA_END', label: 'Último grupo na borda segura (padrão)' },
  { value: 'DISTRIBUTE_EVENLY', label: 'Distribuir grupos uniformemente' },
  { value: 'TOP_ALIGN', label: 'Alinhar ao topo' },
];

const LINE_HEIGHT_STRATEGIES = [
  { value: 'MAX_EXACT_LINE_HEIGHT', label: 'Altura máxima exata (padrão)' },
  { value: 'PROPORTIONAL', label: 'Proporcional ao conteúdo' },
];

const SPACER_POLICIES = [
  { value: 'NEXT_GROUP_STYLE', label: 'Estilo do próximo grupo (padrão)' },
  { value: 'BLANK', label: 'Linha em branco simples' },
];

const SAFETY_POLICIES = [
  { value: 'MARGIN_BASED', label: 'Baseada nas margens da página (padrão)' },
  { value: 'CONTENT_AREA', label: 'Área de conteúdo útil' },
];

const POLICY_HINTS = {
  anchorStrategy: {
    LAST_GROUP_AT_SAFE_AREA_END: 'O último grupo de campos é posicionado ao final da área segura da página. Use para capas com data e local na parte inferior.',
    DISTRIBUTE_EVENLY: 'Os grupos são distribuídos igualmente ao longo da página, com espaços proporcionais entre eles.',
    TOP_ALIGN: 'Todos os grupos são alinhados ao topo da página, sem espaço extra entre eles.',
  },
  lineHeightStrategy: {
    MAX_EXACT_LINE_HEIGHT: 'Usa a maior altura de linha entre os elementos do grupo para garantir alinhamento consistente.',
    PROPORTIONAL: 'A altura da linha é proporcional ao tamanho do conteúdo real em cada campo.',
  },
  spacerStylePolicy: {
    NEXT_GROUP_STYLE: 'O espaçador usa o estilo do grupo seguinte — útil para manter a fonte correta nas linhas em branco.',
    BLANK: 'Linhas em branco sem estilo específico.',
  },
  safetyPolicy: {
    MARGIN_BASED: 'A área segura é calculada a partir das margens definidas na aba Página.',
    CONTENT_AREA: 'A área segura corresponde à área de conteúdo efetiva após aplicar margens e cabeçalhos/rodapés.',
  },
} as const;

function SelectField({ label: lbl, value, options, onChange, tooltip }: {
  label: string; value: string; options: { value: string; label: string }[];
  onChange: (v: string) => void; tooltip?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-semibold text-[var(--color-neutral)] mb-1">
        {lbl}
        {tooltip && (
          <Tooltip content={tooltip}>
            <span className="text-[var(--color-neutral)]/70 cursor-help text-[10px] border border-[var(--color-border-soft)] rounded-full px-1">?</span>
          </Tooltip>
        )}
      </label>
      <select
        className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs text-[var(--color-espresso)] bg-white focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function SinglePageForm({ comp, onChange }: Props) {
  const policy = comp.policy ?? {
    anchorStrategy: 'LAST_GROUP_AT_SAFE_AREA_END',
    lineHeightStrategy: 'MAX_EXACT_LINE_HEIGHT',
    spacerStylePolicy: 'NEXT_GROUP_STYLE',
    safetyPolicy: 'MARGIN_BASED',
  };

  function setPolicy(key: keyof typeof policy, value: string) {
    onChange({ ...comp, policy: { ...policy, [key]: value } });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[var(--color-neutral)] mb-1">Nome de exibição</label>
        <input
          type="text"
          className="w-full border border-[var(--color-border-soft)] rounded p-2 text-xs text-[var(--color-espresso)] focus:ring-2 focus:ring-blue-500"
          value={comp.displayName}
          onChange={e => onChange({ ...comp, displayName: e.target.value })}
          placeholder="Ex: Capa"
        />
      </div>

      <details className="border border-[var(--color-border-soft)] rounded-lg">
        <summary className="px-3 py-2 text-xs font-semibold text-[var(--color-neutral)] cursor-pointer hover:bg-[var(--color-paper)] rounded-lg">
          Política de Layout (avançado)
        </summary>
        <div className="p-3 space-y-3 border-t border-[var(--color-border-soft)]">
          <SelectField
            label="Estratégia de âncora"
            value={policy.anchorStrategy}
            options={ANCHOR_STRATEGIES}
            onChange={v => setPolicy('anchorStrategy', v)}
            tooltip={POLICY_HINTS.anchorStrategy[policy.anchorStrategy as keyof typeof POLICY_HINTS.anchorStrategy] ?? 'Define como os grupos se distribuem verticalmente na página'}
          />
          <SelectField
            label="Estratégia de altura de linha"
            value={policy.lineHeightStrategy}
            options={LINE_HEIGHT_STRATEGIES}
            onChange={v => setPolicy('lineHeightStrategy', v)}
            tooltip={POLICY_HINTS.lineHeightStrategy[policy.lineHeightStrategy as keyof typeof POLICY_HINTS.lineHeightStrategy]}
          />
          <SelectField
            label="Política de espaçador"
            value={policy.spacerStylePolicy}
            options={SPACER_POLICIES}
            onChange={v => setPolicy('spacerStylePolicy', v)}
            tooltip={POLICY_HINTS.spacerStylePolicy[policy.spacerStylePolicy as keyof typeof POLICY_HINTS.spacerStylePolicy]}
          />
          <SelectField
            label="Política de segurança"
            value={policy.safetyPolicy}
            options={SAFETY_POLICIES}
            onChange={v => setPolicy('safetyPolicy', v)}
            tooltip={POLICY_HINTS.safetyPolicy[policy.safetyPolicy as keyof typeof POLICY_HINTS.safetyPolicy]}
          />
        </div>
      </details>

      <p className="text-[11px] text-[var(--color-green)] bg-blue-50 border border-blue-100 rounded p-2">
        Use o painel central para adicionar e reordenar slots desta página.
      </p>
    </div>
  );
}
