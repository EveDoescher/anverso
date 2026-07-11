# Profile Builder — Plano de Reescrita

## Contexto

A página `/create-profile` precisa ser reescrita do zero. O objetivo é um builder visual que permita ao usuário criar qualquer padrão de formatação acadêmica (ABNT, APA, IEEE, Vancouver, Chicago, etc.) com personalização total, mas com UX amigável — nomes em português, tooltips explicativos, feedback em tempo real e interatividade visual.

---

## Bibliotecas adicionadas

| Biblioteca | Uso |
|------------|-----|
| `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` | Drag-and-drop de componentes e slots |
| `@radix-ui/react-tooltip` | Tooltips explicativos em campos técnicos |
| `@radix-ui/react-accordion` | Seções colapsáveis em formulários longos |
| `@radix-ui/react-select` | Dropdowns customizados (ruleType, alignment, etc) |
| `@radix-ui/react-switch` | Toggles para campos boolean |

---

## Arquitetura geral

### Layout da página

```
┌──────────────┬────────────────────────────────────────────────────┐
│   Sidebar    │  Área principal (troca conforme seção ativa)       │
│              │                                                    │
│  ○ Perfil    │                                                    │
│  ○ Página    │                                                    │
│  ● Compon.   │                                                    │
│  ○ Corpo     │                                                    │
│  ○ Pós-proc  │                                                    │
│              │                                                    │
│  [Salvar]    │                                                    │
└──────────────┴────────────────────────────────────────────────────┘
```

- **Barra superior:** nome do perfil editável inline + badge de validação global + botão Salvar
- **Sidebar fixa à esquerda:** navegação entre seções + indicador ⚠ por seção com problema

---

## Seções

### 1. Perfil
- Nome (obrigatório)
- Descrição
- Visibilidade pública (Switch)

### 2. Página
- Formato de papel: A4 / Letter / Custom (com campos de largura e altura)
- Orientação: Retrato / Paisagem
- Margens: superior, inferior, esquerda, direita (em cm)
- **Fonte base (`fontRoles`):** família de fonte padrão + valores permitidos para o usuário do documento
- **Numeração de páginas:**
  - Habilitar/desabilitar (Switch)
  - Posição: HEADER_RIGHT / HEADER_CENTER / FOOTER_RIGHT / FOOTER_CENTER
  - Contar a partir de (dropdown com componentes)
  - Visível a partir de (dropdown com componentes)
  - Distância da borda vertical e horizontal (cm)

### 3. Componentes
Layout de 3 colunas (ver seção dedicada abaixo).

### 4. Corpo do Texto
Só aparece se existe um componente BODY_CONTENT. Configura:
- **Parágrafos & Títulos:** numbering (enabled, separator, suffix), espaços antes/depois de títulos, page break antes de seção primária, keepWithNext
- **Citações (`citationFormatting`):** pagePrefix, multiAuthorJoiner, etAl, apudConnector, suppressionMarker, emphasisOursLabel, emphasisAuthorLabel, verbalCitationLabel, authorYearSeparator, pageReferenceSeparator, parenOpen/Close, multiSourceSeparator
- **Rótulos de referência cruzada (`crossReferenceLabels`):** labels para seção, figura, tabela, quadro, gráfico, listagem, equação
- **Elementos visuais:** acordeons separados para Figuras, Tabelas, Quadros, Código, Gráficos — cada um com captionTemplate, sourceTemplate, continuationLabels, placement, alignment, dimensões, numberingStrategy, label

### 5. Pós-processamento
- Correção de títulos órfãos (Switch)
- Rótulos de tabelas longas: habilitar + continuesLabel, continuationLabel, conclusionLabel

---

## Seção "Componentes" — 3 colunas

```
┌──────────────────┬────────────────────────────┬─────────────────────────┐
│  Col 1           │  Col 2                     │  Col 3                  │
│  Estrutura doc   │  Visual + Slots/Items       │  Inspetor               │
├──────────────────┼────────────────────────────┼─────────────────────────┤
│ ≡ Capa      ●   │  ┌──────────────────────┐  │  [Componente ou Slot]   │
│ ≡ Folha de R.   │  │  ░░░░░░░░░░░░░░░░░░ │  │                         │
│ ≡ Errata        │  │  ▓▓▓▓▓ TÍTULO ◀─────┼──┼─ Nome: título           │
│ ≡ Corpo         │  │  ░░░ subtítulo ░░░░ │  │  Tipo: TEXTO            │
│ ≡ Referências   │  │                      │  │  Obrigatório: ●         │
│ ≡ Sumário       │  │  ░░░ Cidade/Ano ░░░ │  │  Posição: FULL WIDTH    │
│                 │  └──────────────────────┘  │  Alinhamento: Centro    │
│ + Adicionar     │                            │  Tamanho: 14pt          │
│                 │  Slots:                    │  Bold: ●  Itálico: ○    │
│                 │  ≡ Linhas instit.          │  Maiúsculas: ●          │
│                 │  ≡ Autores                 │  Espaç. antes: 0pt      │
│                 │  ≡ Título      ●           │  Espaç. depois: 0pt     │
│                 │  ≡ Subtítulo               │                         │
│                 │  ≡ Cidade                  │  [Excluir slot]         │
│                 │  + Adicionar slot          │                         │
└──────────────────┴────────────────────────────┴─────────────────────────┘
```

### Col 1 — Estrutura do documento
- Lista drag-and-drop dos componentes (ordem = componentOrder no JSON)
- Cada item: handle ≡, nome amigável, badge de tipo, toggle on/off, ícone ⚠ se inválido
- Botão "+ Adicionar componente" abre modal de criação (ID, nome, tipo inicial)

### Col 2 — Visual do componente
- **Preview esquemático:** miniatura de página A4 com blocos coloridos por tipo de slot
  - TEXT = azul claro, TEXT_LIST = verde, COMPOSED_TEXT = laranja, SIGNATURE_BLOCK = roxo
  - Slot selecionado fica destacado com borda colorida e seta para Col 3
  - Blocos posicionados conforme `horizontalPlacement` do slot (FULL = largura total, CENTER_TO_RIGHT = metade direita)
- **Lista de slots/items:** abaixo do preview, drag-to-reorder com @dnd-kit
  - Cada item: handle ≡, nome, badge de tipo, botão de excluir
  - Clique seleciona e abre no inspetor
- **Botão "+ Adicionar slot/item"** ao final da lista

### Col 3 — Inspetor
Dispatcher: mostra formulário de componente (quando nenhum slot selecionado) ou formulário de slot.

---

## Formulários por ruleType (Inspetor — nível componente)

### SINGLE_PAGE — "Página Única"
Campos: ID do componente, nome de exibição
Seção Policy (Accordion):
- Estratégia de âncora (anchorStrategy): dropdown com tooltip
- Estratégia de altura de linha (lineHeightStrategy)
- Política de espaçador (spacerStylePolicy)
- Política de segurança (safetyPolicy)

Grupos de layout (lista drag-to-reorder):
- Cada grupo: ID, obrigatório (Switch), lista de slots membros
- GapRules: peso entre grupos (input numérico)

StyleMapping: para cada slot, dropdown "Qual estilo usar" (lista de styleRules)

### FLOW_TEXTUAL — "Texto Livre"
Lista de items (drag-to-reorder):
- Cada item tem dropdown de tipo: HEADING / BLANK_LINES / PLAIN_TEXT / TABLE_BLOCK / BOLD_LABELED_KEYWORDS / PAIR_LIST / REPEAT_GROUP
- Mini-form inline por tipo:
  - HEADING: styleId, text
  - BLANK_LINES: styleId, count
  - PLAIN_TEXT: styleId, slotName
  - TABLE_BLOCK: headerStyleId, cellStyleId, headers (lista), rowsSlotName
  - BOLD_LABELED_KEYWORDS: styleId, labelSlotName, keywordsSlotName, separator, terminator
  - PAIR_LIST: styleId, termsSlotName, definitionsSlotName, separator
  - REPEAT_GROUP: entriesSlotName, pageBreakBetweenEntries (Switch), group (lista recursiva de items)

### BIBLIOGRAPHY — "Lista de Referências"
- headingText, blankLinesAfterHeading, blankLinesBetweenEntries
- sortOrder: ALPHABETICAL / NONE
- **Formato de Autores** (Accordion):
  - surnameUppercase, surnameGivenSeparator, nameTerminator, multiAuthorJoiner, etAlLabel, etAlThreshold
- **Formatos de entrada** (Accordion por tipo — BOOK, BOOK_CHAPTER, JOURNAL, WEBSITE, LEGISLATION, THESIS, CONFERENCE_PAPER, REPORT, STANDARD):
  - Lista drag-to-reorder de partes: source (dropdown ou literal:...), bold, prefix, suffix, optional

### BODY_CONTENT — "Corpo do Texto"
Só pode existir um por perfil (validação).
Configurado majoritariamente na seção "Corpo do Texto" da sidebar.
No inspetor: exibe link para a seção com resumo dos estilos mapeados.

### SECTIONED — "Secionado" (apêndices, anexos)
- headingTemplate com preview ao vivo (ex: "APÊNDICE A – Meu Título")
- indexingStyle: ALPHABETIC / NUMERIC
- bodyContentComponentId: dropdown com componentes BODY_CONTENT existentes
- sectionTitleStyleIdsByLevel: até 6 níveis, cada um com StyleRuleEditor

### ELEMENT_INDEX — "Índice de Elementos"
- elementType: FIGURE / TABLE / FRAME / CHART / CODE_LISTING (nomes: Figuras, Tabelas, Quadros, Gráficos, Listagens de Código)
- headingText, entryTemplate com preview ao vivo
- blankLinesAfterHeading, pageReferenceEnabled (Switch)

### SECTION_INDEX — "Sumário"
- headingText, useTocField (Switch), blankLinesAfterHeading
- entryStyleIdsByLevel: até 6 níveis com StyleRuleEditor

---

## Formulário de Slot (Inspetor — nível slot)

Campos comuns:
- Nome do slot (ID)
- Tipo: TEXT / TEXT_LIST / COMPOSED_TEXT / SIGNATURE_BLOCK_LIST
- Obrigatório (Switch)

Por tipo:
- **COMPOSED_TEXT:** campo template (com chips de placeholder sugeridos) + fieldNames (lista editável de tags)
- **SIGNATURE_BLOCK_LIST:** signatureLineEnabled (Switch), signatureLineText, lineTemplates (lista)

Estilo:
- Dropdown "Estilo:" (lista de styleRules existentes por ID)
- Botão "✏ Editar estilo" ou "+ Criar estilo dedicado" → abre StyleRuleEditor inline

Posicionamento (apenas SINGLE_PAGE):
- Placement: FULL_CONTENT_WIDTH / FROM_PAGE_CENTER_TO_RIGHT_MARGIN / CUSTOM
- maxVisualLinesPerValue (input numérico, com tooltip)
- blankLinesAfter (input numérico)

---

## StyleRuleEditor (componente reutilizável inline)

Campos:
- ID (slug, gerado automaticamente, editável)
- Tipo: PARAGRAPH / HEADING_1 / HEADING_2 / ... / HEADING_6
- Família de fonte (Select)
- Tamanho (pt)
- Alinhamento: JUSTIFIED / LEFT / CENTER / RIGHT
- Espaçamento de linha
- Recuo primeira linha (cm), esquerda (cm), direita (cm)
- Espaçamento antes (pt), depois (pt)
- Bold, Itálico, Maiúsculas (Switch)

---

## Validação em tempo real

Regras:
- Componente BODY_CONTENT: obrigatório ter exatamente um se componentOrder não estiver vazio
- Slot obrigatório (`required: true`) deve ter styleId definido
- headingText e entryTemplate não podem estar vazios em ELEMENT_INDEX e SECTION_INDEX
- BIBLIOGRAPHY requer ao menos um entryFormat configurado

Exibição:
- Badge ⚠ laranja na sidebar por seção com problema
- Badge ⚠ no card de componente na Col 1
- Borda vermelha + mensagem inline no campo inválido
- Botão Salvar bloqueado com tooltip explicando o que está faltando

---

## Arquivos a criar/modificar

### Reescrita
- `src/app/create-profile/[[...id]]/page.tsx` — página principal orquestrando tudo

### Novos componentes (`src/components/profile-builder/`)
- `BuilderSidebar.tsx` — navegação lateral com badges de validação
- `ComponentList.tsx` — Col 1, lista DnD de componentes
- `ComponentVisualPanel.tsx` — Col 2, preview esquemático + lista de slots
- `InspectorPanel.tsx` — Col 3, dispatcher para formulário certo
- `SlotInspector.tsx` — formulário de slot com StyleRuleEditor
- `StyleRuleEditor.tsx` — editor de styleRule reutilizável inline
- `Tooltip.tsx` — wrapper de @radix-ui/react-tooltip com estilo padrão
- `forms/SinglePageForm.tsx`
- `forms/FlowTextualForm.tsx`
- `forms/BibliographyForm.tsx`
- `forms/BodyContentForm.tsx`
- `forms/SectionedForm.tsx`
- `forms/ElementIndexForm.tsx`
- `forms/SectionIndexForm.tsx`

### Nova lib
- `src/lib/profileSerializer.ts` — bidirecional: state do builder ↔ JSON do contrato do Formatter-service

---

## Ordem de implementação

1. `profileSerializer.ts` — base de tudo, sem UI
2. `Tooltip.tsx` + `StyleRuleEditor.tsx` — componentes folha reutilizáveis
3. `BuilderSidebar.tsx` + estrutura da página
4. `ComponentList.tsx` + `ComponentVisualPanel.tsx` + `InspectorPanel.tsx` (Col 1-2-3 vazias mas conectadas)
5. Formulários por ruleType (um por vez, começando por SINGLE_PAGE e BODY_CONTENT)
6. `SlotInspector.tsx`
7. Integração completa + validação
8. Modo edição (carregar perfil existente via serializer)
