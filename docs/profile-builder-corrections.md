# Correções do Profile Builder — Documento de Requisitos

Fonte de verdade: `ProfileDefinition.java` e `docs/ecosystem-contract.md` do Formatter-service.
Verificado contra: `abnt-unip-profile.json` e `apa-unip-profile.json`.

---

## 1. Incompatibilidades estruturais críticas (o Formatter rejeita o JSON)

### 1.1 `pageRule` — chave e estrutura erradas

**Problema:** O serializer emite `pageLayout` com sub-objeto `paperSize` e `margins`. O Formatter lê `pageRule` com campos planos.

**Contrato correto (`ProfileDefinition.PageRuleDefinition`):**
```json
"pageRule": {
  "widthCm": 21,
  "heightCm": 29.7,
  "marginTopCm": 3,
  "marginRightCm": 2,
  "marginBottomCm": 2,
  "marginLeftCm": 3,
  "orientation": "PORTRAIT"
}
```

**O que o serializer emite hoje:**
```json
"pageLayout": {
  "paperSize": { "format": "A4", "widthCm": 21, "heightCm": 29.7 },
  "orientation": "PORTRAIT",
  "margins": { "topCm": 3, "bottomCm": 2, "leftCm": 3, "rightCm": 2 }
}
```

**Correção em `serializeState`:** substituir a montagem de `pageLayout` por:
```ts
pageRule: {
  widthCm: pageLayout.widthCm,
  heightCm: pageLayout.heightCm,
  marginTopCm: pageLayout.marginTopCm,
  marginRightCm: pageLayout.marginRightCm,
  marginBottomCm: pageLayout.marginBottomCm,
  marginLeftCm: pageLayout.marginLeftCm,
  orientation: pageLayout.orientation,
},
```

**Correção em `deserializeContract`:** ler `raw.pageRule` (plano) em vez de `raw.pageLayout.paperSize` + `raw.pageLayout.margins`. Mapear `marginRightCm` e `marginBottomCm` corretamente (a ordem dos campos no Formatter é top/right/bottom/left).

**Correção no `PageState`:** remover `paperFormat` (não existe no contrato). O campo era usado apenas para popular os presets de dimensão na UI — pode continuar existindo como estado interno da UI, mas **não deve ser serializado**.

---

### 1.2 `pageNumbering` — nomes de campo com `Page` no meio

**Problema:** O Formatter usa `verticalDistanceFromPageEdgeCm` e `horizontalDistanceFromPageEdgeCm`. O `BuilderState` e o serializer usam `verticalDistanceFromEdgeCm` (sem `Page`).

**Contrato correto (`ProfileDefinition.PageNumberingRuleDefinition`):**
```json
"pageNumbering": {
  "enabled": true,
  "countFromComponentId": "titlePage",
  "visibleFromComponentId": "bodyContent",
  "styleId": "pageNumber",
  "placement": "HEADER_RIGHT",
  "verticalDistanceFromPageEdgeCm": 2,
  "horizontalDistanceFromPageEdgeCm": 2
}
```

**Correção em `serializeState`:** emitir `verticalDistanceFromPageEdgeCm` e `horizontalDistanceFromPageEdgeCm`.

**Correção em `deserializeContract`:** ler `pn.verticalDistanceFromPageEdgeCm` e `pn.horizontalDistanceFromPageEdgeCm`.

**Correção em `PageState`:** renomear os campos para `verticalDistanceFromPageEdgeCm` e `horizontalDistanceFromPageEdgeCm` (ou manter os nomes internos e apenas corrigir a serialização/desserialização).

---

### 1.3 `ruleType: BIBLIOGRAPHY` — a chave correta é `REFERENCE_LIST`

**Problema:** O `ecosystem-contract.md` e o `ProfileDefinition.java` registram o subtipo como `"BIBLIOGRAPHY"` no JSON, mas o contrato público do `ecosystem-contract.md` lista o ruleType como `REFERENCE_LIST`.

**Verificação do `ProfileDefinition.java` linha 214:**
```java
@JsonSubTypes.Type(value = ReferencesComponentRuleDefinition.class, name = "BIBLIOGRAPHY"),
```

**Conclusão:** o discriminador real no JSON é `"BIBLIOGRAPHY"` (conforme a anotação Jackson). O `ecosystem-contract.md` usa `REFERENCE_LIST` como nome descritivo na tabela, mas o JSON deve ter `"ruleType": "BIBLIOGRAPHY"`. O builder já usa `BIBLIOGRAPHY` — **nenhuma correção necessária aqui**.

---

### 1.4 `fontRoles` — estrutura completamente diferente

**Problema:** O serializer emite `{ "defaultFamily": "...", "allowedFamilies": [...] }`. O Formatter lê um mapa de papéis (ex: `"baseFont"`) onde cada papel tem `default`, `allowedValues` e `styleIds`.

**Contrato correto (`ProfileDefinition.FontRoleDefinition`):**
```json
"fontRoles": {
  "baseFont": {
    "default": "Times New Roman",
    "allowedValues": ["Times New Roman", "Arial"],
    "styleIds": ["pageNumber", "cover.top", "cover.author", ...]
  }
}
```

**Correção necessária em `PageState`:**
```ts
fontRoles: {
  roles: Array<{
    key: string;               // ex: "baseFont"
    defaultFamily: string;
    allowedFamilies: string[];
    styleIds: string[];        // lista de IDs de styleRules que usam este papel
  }>;
}
```

**Correção em `serializeState`:**
```ts
fontRoles: Object.fromEntries(
  pageLayout.fontRoles.roles.map(r => [
    r.key,
    { default: r.defaultFamily, allowedValues: r.allowedFamilies, styleIds: r.styleIds }
  ])
)
```

**Correção em `deserializeContract`:** ler `raw.fontRoles` como mapa de papéis.

**Impacto na UI (`renderPage`):** substituir o select simples de família por um editor que permite adicionar/remover papéis de fonte, configurar o papel `baseFont` com default, allowedValues e selecionar quais styleIds pertencem ao papel.

---

### 1.5 `itemType` vs `type` nos FlowItems

**Problema:** O Formatter usa `itemType` como discriminador Jackson (`@JsonTypeInfo property = "itemType"`, linha 780 do `ProfileDefinition.java`). O serializer emite `type`.

**Contrato correto:**
```json
{ "itemType": "HEADING", "styleId": "errata.heading", "text": "ERRATA" }
```

**O que o serializer emite hoje:**
```json
{ "type": "HEADING", "styleId": "errata.heading", "text": "ERRATA" }
```

**Correção em `serializeState` (case `FLOW_TEXTUAL`):**
```ts
const base: Record<string, unknown> = { itemType: item.type }; // era: { type: item.type }
```

**Correção em `deserializeContract` (case `FLOW_TEXTUAL`):** os itens já chegam com `itemType` do JSON original e são copiados diretamente — o problema só ocorre ao reserializar. Mas o `FlowItem` no `BuilderState` precisa guardar o campo como `type` internamente e serializar como `itemType`. Nenhuma mudança no tipo `FlowItem`, apenas na serialização.

---

### 1.6 Agrupamento de slots em `SINGLE_PAGE` — um grupo pode conter múltiplos slots

**Problema:** O serializer cria um grupo por slot (1:1). Os perfis reais agrupam múltiplos slots em um grupo (ex: `cover.titleBlock` contém `title` e `subtitle`; `cover.bottom` contém `city` e `year`). O deserializer lê os grupos corretamente, mas ao reserializar os perde.

**O problema raiz:** `SlotState` tem `gapWeight` que se refere ao gap **depois do grupo do slot anterior** — mas não há como expressar "este slot pertence ao mesmo grupo que o slot anterior".

**Correção em `SlotState`:**
```ts
export interface SlotState {
  // ... campos existentes ...
  groupId?: string;    // se dois slots têm o mesmo groupId, ficam no mesmo grupo
  gapWeight?: number;  // peso do gap ANTES deste grupo (só relevante no primeiro slot do grupo)
}
```

**Correção em `serializeSinglePage`:** ao emitir os grupos, agrupar slots com mesmo `groupId`. Se `groupId` não definido, cada slot fica em seu próprio grupo (comportamento atual).

**Correção em `deserializeContract` (case `SINGLE_PAGE`):** ao ler os grupos, atribuir o mesmo `groupId` (ex: o `id` do grupo) para todos os slots dentro do mesmo grupo.

**Impacto na UI (`ComponentVisualPanel` / `SlotInspector`):** adicionar campo para definir o `groupId` de um slot.

---

### 1.7 `headingStyleId` e `entryStyleId` hardcoded com padrão errado

**Problema:** Para `ELEMENT_INDEX`, `SECTION_INDEX` e `BIBLIOGRAPHY`, o serializer gera IDs como `listOfFigures.heading` e `listOfFigures.entry`. Os perfis reais usam estilos compartilhados como `list.heading` e `list.entry` que existem no pool de `styleRules`. Os IDs gerados não existem no pool — o Formatter retorna 400.

**Correção em `ComponentState`:** adicionar campos para customizar esses IDs:
```ts
// Já existente:
headingText?: string;

// Adicionar:
headingStyleId?: string;   // para BIBLIOGRAPHY, ELEMENT_INDEX, SECTION_INDEX
entryStyleId?: string;     // para BIBLIOGRAPHY, ELEMENT_INDEX
```

**Correção em `serializeState`:**
```ts
// BIBLIOGRAPHY:
headingStyleId: comp.headingStyleId ?? `${comp.id}.heading`,
entryStyleId: comp.entryStyleId ?? `${comp.id}.entry`,

// ELEMENT_INDEX:
headingStyleId: comp.headingStyleId ?? `${comp.id}.heading`,
entryStyleId: comp.entryStyleId ?? `${comp.id}.entry`,

// SECTION_INDEX:
headingStyleId: comp.headingStyleId ?? `${comp.id}.heading`,
```

**Impacto na UI:** adicionar selects de estilo no `BibliographyForm`, `ElementIndexForm` e `SectionIndexForm` para escolher o `headingStyleId` e `entryStyleId` a partir do pool de `styleRules`.

---

### 1.8 `BODY_CONTENT` — figure/table/frame/chart/codeListing/chart não desserializados

**Problema:** O `deserializeContract` no case `BODY_CONTENT` ignora completamente os sub-objetos `figure`, `table`, `frame`, `chart`, `codeListing`, `equation`, `directCitation`, `longDirectCitation` e `footnote`. Ao carregar um perfil e reserializar, todos esses valores são substituídos pelos defaults do `defaultBodyContentState()`.

**Correção em `deserializeContract` (case `BODY_CONTENT`):**

Ler cada sub-objeto do JSON e popular o `BodyContentState`:

```ts
// figure
const fig = rule.figure as Record<string, unknown> | undefined;
if (fig) {
  bc.figure = {
    captionTemplate: (fig.captionTemplate as string) ?? bc.figure.captionTemplate,
    sourceTemplate: (fig.sourceTemplate as string) ?? bc.figure.sourceTemplate,
    alignment: (fig.imageAlignment as 'CENTER'|'LEFT'|'RIGHT') ?? bc.figure.alignment,
    fontSizePt: bc.figure.fontSizePt, // não existe no JSON de figura, vem do caption style
    numberingStrategy: (fig.numberingStrategy as 'GLOBAL_SEQUENTIAL'|'BY_CHAPTER') ?? bc.figure.numberingStrategy,
    label: (fig.label as string) ?? bc.figure.label,
    maxWidthCm: (fig.maxWidthCm as number) ?? bc.figure.maxWidthCm,
    maxHeightCm: (fig.maxHeightCm as number) ?? bc.figure.maxHeightCm,
  };
}

// table — padrão análogo
// frame — padrão análogo
// chart — padrão análogo (ler imageRule aninhado)
// codeListing — padrão análogo
```

**Nota sobre `chart`:** o JSON tem `chart.imageRule` aninhado com os campos de imagem. O deserializer precisa ler `rule.chart.imageRule` para preencher os campos de imagem do gráfico.

---

### 1.9 `sourceComponentId` ausente em `ELEMENT_INDEX` e `SECTION_INDEX`

**Problema:** O contrato do Formatter exige `sourceComponentId` em `ELEMENT_INDEX` e `SECTION_INDEX` — ID do componente `BODY_CONTENT` de onde derivar os dados. Esse campo está ausente no `ComponentState` e no serializer.

**Correção em `ComponentState`:**
```ts
sourceComponentId?: string;  // para ELEMENT_INDEX e SECTION_INDEX
```

**Correção em `serializeState`:**
```ts
// ELEMENT_INDEX:
sourceComponentId: comp.sourceComponentId ?? '',

// SECTION_INDEX:
sourceComponentId: comp.sourceComponentId ?? '',
```

**Impacto na UI:** adicionar select de componente em `ElementIndexForm` e `SectionIndexForm` para escolher o `sourceComponentId` (filtrado para componentes com `ruleType === 'BODY_CONTENT'`).

---

## 2. Perda de dados ao round-trip (carregar e reserializar perde informação)

### 2.1 `layout.keepWithNextOnHeadings` ausente em `BodyContentState`

**Campo no JSON:**
```json
"layout": { "keepWithNextOnHeadings": true }
```

**Correção em `BodyContentState.layout`:**
```ts
layout: {
  // ... campos existentes ...
  keepWithNextOnHeadings: boolean;
}
```

**Correção em `serializeBodyContent`:** incluir no layout serializado.
**Correção em `deserializeContract`:** ler `layout2.keepWithNextOnHeadings`.

---

### 2.2 `layout.inlineHeadingLevels` ausente (APA)

**Campo no JSON (APA):**
```json
"layout": { "inlineHeadingLevels": [4, 5] }
```

Títulos de nível 4 e 5 no APA são inline (run-in heading): o texto continua na mesma linha após o título.

**Correção em `BodyContentState.layout`:**
```ts
layout: {
  // ... campos existentes ...
  inlineHeadingLevels?: number[];
}
```

**Correção em `serializeBodyContent`:** incluir se definido.
**Correção em `deserializeContract`:** ler `layout2.inlineHeadingLevels`.

---

### 2.3 `knownFieldNames` em `SIGNATURE_BLOCK_LIST` não serializado

**Campo no JSON:**
```json
"committeeMembers": {
  "type": "SIGNATURE_BLOCK_LIST",
  "knownFieldNames": ["name", "title", "institutionName", "role"]
}
```

O campo já existe no `SlotRuleDefinition.java` do Formatter e no `SlotState` do builder (`lineTemplates` guarda os templates, mas `knownFieldNames` é separado).

**Correção em `serializeSinglePage`:** no objeto do slot `SIGNATURE_BLOCK_LIST`, incluir:
```ts
knownFieldNames: slot.knownFieldNames ?? [],
```

**Correção em `SlotState`:** adicionar campo (se ainda não existe):
```ts
knownFieldNames?: string[];
```

**Correção em `deserializeContract`:** já é lido via `rawSlot.knownFieldNames` se o campo for adicionado à serialização — verificar que não é descartado.

---

### 2.4 `paragraphStyleId` em `SECTIONED` não serializado

**Campo no JSON:**
```json
"appendix": {
  "ruleType": "SECTIONED",
  "paragraphStyleId": "bodyContent.paragraph"
}
```

O campo existe em `SectionedComponentRuleDefinition.java`. O serializer não o emite.

**Correção em `serializeState` (case `SECTIONED`):**
```ts
paragraphStyleId: comp.paragraphStyleId ?? '',
```

**Correção em `ComponentState`:** adicionar `paragraphStyleId?: string` se não existe.

**Correção em `deserializeContract`:** ler `rule.paragraphStyleId`.

---

### 2.5 `tableContinuationLabels.labelStyleId` hardcoded errado

**Problema:** O serializer hardcoda `labelStyleId: 'bodyContent.paragraph'`. Os perfis reais usam `bodyContent.table.header`.

**Correção:** adicionar `labelStyleId` ao `PostProcessingState.tableContinuationLabels`:
```ts
tableContinuationLabels: {
  // ... campos existentes ...
  labelStyleId: string;
}
```

Serializar e desserializar o valor real. Na UI, adicionar um select de estilo para esse campo.

---

### 2.6 Templates com tokens errados

**Problema:** O `defaultBodyContentState()` usa `{num}` e `{title}` nos templates. O Formatter exige `{number}` e `{caption}` (conforme `ecosystem-contract.md`: _"Deve conter `{number}` e `{caption}`"_).

**Correção em `defaultBodyContentState`:**
```ts
figure: {
  captionTemplate: 'Figura {number} – {caption}',  // era 'Figura {num} – {title}'
  sourceTemplate: 'Fonte: {source}',
  ...
},
table: {
  captionTemplate: 'Tabela {number} – {caption}',
  ...
},
// etc. para frame, chart, codeListing
```

---

### 2.7 `chart.imageRule` não serializado

**Problema:** O Formatter exige `chart.imageRule` como sub-objeto obrigatório com todos os campos de uma figura. O serializer não emite esse campo — emite apenas os campos de topo do `chart`.

**Contrato correto:**
```json
"chart": {
  "captionTemplate": "...",
  "imageRule": {
    "captionStyleId": "bodyContent.figure.caption",
    "imageAlignment": "CENTER",
    "maxWidthCm": 16,
    "maxHeightCm": 18,
    ...
  }
}
```

**Correção em `serializeBodyContent`:** o objeto `chart` deve incluir `imageRule` replicando os campos de imagem:
```ts
chart: {
  captionStyleId: 'bodyContent.figure.caption',
  sourceStyleId: 'bodyContent.figure.source',
  captionTemplate: bc.chart.captionTemplate,
  sourceTemplate: bc.chart.sourceTemplate,
  continuationLabels: { first: 'continua', middle: 'continuação', last: 'conclusão' },
  sourcePlacement: 'LAST_PART_ONLY',
  numberingStrategy: bc.chart.numberingStrategy,
  label: bc.chart.label,
  imageRule: {                          // campo obrigatório pelo Formatter
    captionStyleId: 'bodyContent.figure.caption',
    sourceStyleId: 'bodyContent.figure.source',
    captionTemplate: bc.chart.captionTemplate,
    sourceTemplate: bc.chart.sourceTemplate,
    continuationLabels: { first: 'continua', middle: 'continuação', last: 'conclusão' },
    sourcePlacement: 'LAST_PART_ONLY',
    imageAlignment: bc.chart.alignment,
    maxWidthCm: bc.chart.maxWidthCm ?? 16,
    maxHeightCm: bc.chart.maxHeightCm ?? 18,
    defaultDpi: 96,
    maxImageBytes: 2000000,
    urlFetchTimeoutSeconds: 10,
    fitPolicy: 'SCALE_DOWN_PRESERVE_ASPECT_RATIO',
    numberingStrategy: bc.chart.numberingStrategy,
    label: bc.chart.label,
  },
},
```

---

### 2.8 `BibEntryPart` / `EntrySegmentRule` — campo `italic` ausente (crítico para APA)

**Problema:** A interface `BibEntryPart` no builder não tem `italic`. O `EntrySegmentRuleDefinition.java` tem:
```java
public record EntrySegmentRuleDefinition(
    String source,
    boolean bold,
    boolean italic,   // ← existe no Formatter
    String prefix,
    String suffix,
    boolean optional
)
```

O APA usa itálico extensivamente nas referências (título de livro, nome do periódico, volume). Sem esse campo, o builder não consegue configurar perfis APA.

**Correção em `BibEntryPart`:**
```ts
export interface BibEntryPart {
  source: string;
  bold: boolean;
  italic: boolean;   // adicionar
  prefix: string;
  suffix: string;
  optional: boolean;
}
```

**Impacto na UI (`BibliographyForm` / `EntryFormatEditor`):** adicionar checkbox de `italic` ao lado do checkbox de `bold` em cada segmento.

---

### 2.9 `AuthorFormatRule` — 5 campos ausentes para APA

**Problema:** O `AuthorFormatRuleDefinition.java` tem 11 campos. O `ComponentState.authorFormat` só tem 6.

**Campos ausentes:**
```java
// AuthorFormatRuleDefinition.java
String lastAuthorJoiner,          // ex: ", & " (APA)
AuthorFormatRule.NameOrder nameOrder,  // SURNAME_FIRST | GIVEN_FIRST
Boolean initialsOnly,             // true no APA (Lima, C. E.)
Boolean initialsDotted,           // true no APA (C. E.)
Boolean initialsSpaced            // true no APA (C. E. em vez de C.E.)
```

**Correção em `ComponentState.authorFormat`:**
```ts
authorFormat?: {
  surnameUppercase: boolean;
  surnameGivenSeparator: string;
  nameTerminator: string;
  multiAuthorJoiner: string;
  etAlLabel: string;
  etAlThreshold: number;
  lastAuthorJoiner?: string;                    // adicionar
  nameOrder?: 'SURNAME_FIRST' | 'GIVEN_FIRST'; // adicionar
  initialsOnly?: boolean;                       // adicionar
  initialsDotted?: boolean;                     // adicionar
  initialsSpaced?: boolean;                     // adicionar
};
```

**Impacto na UI (`BibliographyForm`):** expandir o formulário de formato de autores com os novos campos.

---

### 2.10 `ReferencesFormattingRule` — campos de nota bibliográfica ausentes

**Problema:** `ReferencesFormattingRuleDefinition.java` tem `noteFormats`, `shortNoteFormats` e `ibidEnabled` além dos `entryFormats`. O builder só suporta `entryFormats`.

Esses campos são usados em normas que empregam notas bibliográficas (Vancouver numérico, Chicago). Não afetam ABNT e APA diretamente, mas serão necessários para outros perfis.

**Correção em `ComponentState`:**
```ts
noteFormats?: Partial<Record<BibRefType, BibEntryPart[]>>;
shortNoteFormats?: Partial<Record<BibRefType, BibEntryPart[]>>;
ibidEnabled?: boolean;
```

---

## 3. Dados extras emitidos que não existem no contrato

Esses campos não causam rejeição (o Formatter ignora campos desconhecidos via Jackson), mas poluem o JSON e podem indicar drift de contrato futuro.

### 3.1 `integrityCheck` e `pdfOutput` no `postProcessing`

Existem no `ProfileDefinition.java` (`IntegrityCheckDefinition`, `PdfOutputDefinition`) — **não são extras**. Estão corretamente no contrato. Nenhuma correção necessária.

### 3.2 `fontRoles` no formato errado (coberto em 1.4)

Já coberto. A estrutura `{ defaultFamily, allowedFamilies }` simplesmente não é reconhecida.

---

## 4. Campos que o Formatter ignora silenciosamente (não causam erro, mas estão errados)

| Campo emitido | Problema |
|---|---|
| `pageLayout` (raiz) | Chave desconhecida — `pageRule` seria o correto |
| `fontRoles.defaultFamily` | Estrutura errada — Formatter espera mapa de papéis |
| `componentRules.*.ruleType` ausente | Ausência do discriminador faz Jackson falhar ao ler |

**Nota sobre o 3o item:** o serializer **não emite `ruleType`** dentro de cada componentRule. O Formatter usa esse campo como discriminador Jackson (`@JsonTypeInfo property = "ruleType"`). Sem ele, o Formatter não consegue desserializar o componentRule. **Isso é crítico.**

**Correção em `serializeState`:** cada componentRule deve incluir `ruleType`:
```ts
// SINGLE_PAGE:
componentRules[comp.id] = { ruleType: 'SINGLE_PAGE', componentId: comp.id, ... }

// FLOW_TEXTUAL:
componentRules[comp.id] = { ruleType: 'FLOW_TEXTUAL', componentId: comp.id, ... }

// e assim por diante para todos os tipos
```

---

## 5. Validação na UI — itens a adicionar

### 5.1 Validar `sourceComponentId` em ELEMENT_INDEX e SECTION_INDEX
Deve referenciar um componente com `ruleType === 'BODY_CONTENT'`. Adicionar ao `validate()` e `componentErrors()`.

### 5.2 Validar `styleIds` do fontRole
Todos os IDs em `fontRoles[role].styleIds` devem existir no pool de `styleRules`. Alertar na UI se um style foi removido mas ainda está referenciado em um papel de fonte.

### 5.3 Validar `headingStyleId` e `entryStyleId`
Os IDs selecionados em componentes de índice devem existir no pool de `styleRules`.

### 5.4 Validar templates com tokens corretos
Se um `captionTemplate` não contiver `{number}` ou `{caption}`, emitir aviso.

---

## 6. Resumo das mudanças por arquivo

### `src/lib/profileSerializer.ts`

| Mudança | Tipo |
|---|---|
| `serializeState`: emitir `pageRule` plano em vez de `pageLayout` aninhado | Crítico |
| `serializeState`: emitir `verticalDistanceFromPageEdgeCm` (com `Page`) | Crítico |
| `serializeState`: emitir `ruleType` em cada componentRule | Crítico |
| `serializeState`: emitir `itemType` em vez de `type` nos FlowItems | Crítico |
| `serializeState`: respeitar `groupId` ao montar grupos em SINGLE_PAGE | Crítico |
| `serializeState`: usar `comp.headingStyleId` e `comp.entryStyleId` se definidos | Crítico |
| `serializeState`: emitir `chart.imageRule` aninhado | Importante |
| `serializeState`: emitir `sourceComponentId` em ELEMENT_INDEX e SECTION_INDEX | Crítico |
| `serializeState`: emitir `fontRoles` como mapa de papéis | Crítico |
| `serializeState`: emitir `paragraphStyleId` em SECTIONED | Importante |
| `serializeState`: emitir `knownFieldNames` em SIGNATURE_BLOCK_LIST | Importante |
| `serializeState`: emitir `tableContinuationLabels.labelStyleId` real | Importante |
| `deserializeContract`: ler `pageRule` plano | Crítico |
| `deserializeContract`: ler `verticalDistanceFromPageEdgeCm` (com `Page`) | Crítico |
| `deserializeContract`: ler `figure`, `table`, `frame`, `chart`, `codeListing` no BODY_CONTENT | Crítico |
| `deserializeContract`: ler `chart.imageRule` aninhado | Importante |
| `deserializeContract`: ler `paragraphStyleId` em SECTIONED | Importante |
| `deserializeContract`: ler `sourceComponentId` em ELEMENT_INDEX e SECTION_INDEX | Crítico |
| `deserializeContract`: ler `fontRoles` como mapa de papéis | Crítico |
| `deserializeContract`: ler `knownFieldNames` em SIGNATURE_BLOCK_LIST | Importante |
| `BibEntryPart`: adicionar campo `italic` | Crítico (APA) |
| `ComponentState.authorFormat`: adicionar 5 campos APA | Crítico (APA) |
| `ComponentState`: adicionar `headingStyleId`, `entryStyleId`, `sourceComponentId`, `paragraphStyleId` | Crítico |
| `ComponentState`: adicionar `noteFormats`, `shortNoteFormats`, `ibidEnabled` | Importante |
| `BodyContentState.layout`: adicionar `keepWithNextOnHeadings` e `inlineHeadingLevels` | Importante |
| `SlotState`: adicionar `groupId` e `knownFieldNames` | Crítico |
| `PostProcessingState.tableContinuationLabels`: adicionar `labelStyleId` | Importante |
| `defaultBodyContentState`: corrigir tokens `{num}` → `{number}`, `{title}` → `{caption}` | Importante |
| `PageState`: remover `paperFormat` da serialização (manter apenas como estado de UI) | Menor |
| `PageState.fontRoles`: reestruturar para suportar mapa de papéis com `styleIds` | Crítico |

### `src/app/create-profile/[[...id]]/page.tsx`

| Mudança |
|---|
| `validate()`: adicionar validação de `sourceComponentId` em ELEMENT_INDEX e SECTION_INDEX |

### `src/components/profile-builder/forms/BibliographyForm.tsx`

| Mudança |
|---|
| `EntryFormatEditor`: adicionar checkbox `italic` em cada segmento |
| Seção `authorFormat`: adicionar campos `lastAuthorJoiner`, `nameOrder`, `initialsOnly`, `initialsDotted`, `initialsSpaced` |
| Adicionar selects de `headingStyleId` e `entryStyleId` (filtrado do pool de styleRules) |

### `src/components/profile-builder/forms/ElementIndexForm.tsx`

| Mudança |
|---|
| Adicionar select de `sourceComponentId` (filtrado para BODY_CONTENT) |
| Adicionar selects de `headingStyleId` e `entryStyleId` |

### `src/components/profile-builder/forms/SectionIndexForm.tsx`

| Mudança |
|---|
| Adicionar select de `sourceComponentId` (filtrado para BODY_CONTENT) |
| Adicionar select de `headingStyleId` |

### `src/components/profile-builder/forms/SectionedForm.tsx`

| Mudança |
|---|
| Adicionar select de `paragraphStyleId` |

### `src/components/profile-builder/forms/BodyContentForm.tsx`

| Mudança |
|---|
| Adicionar checkbox `keepWithNextOnHeadings` na seção de layout |
| Adicionar campo `inlineHeadingLevels` (lista de níveis inline) na seção de layout |
| Adicionar campo `labelStyleId` ao tableContinuationLabels |
| Corrigir labels dos templates para indicar tokens corretos (`{number}`, `{caption}`, `{source}`) |

### `src/components/profile-builder/SlotInspector.tsx`

| Mudança |
|---|
| Adicionar campo `groupId` (text input) para agrupar slots em um mesmo grupo de layout |
| Adicionar campo `knownFieldNames` (lista editável) para SIGNATURE_BLOCK_LIST |

### `src/app/create-profile/[[...id]]/page.tsx` — seção `renderPage`

| Mudança |
|---|
| Substituir select simples de fonte por editor de papéis de fonte (`fontRoles`) que permite definir `key`, `defaultFamily`, `allowedFamilies` e a lista de `styleIds` do papel |

---

## 7. Ordem recomendada de implementação

**Fase 1 — Bloqueadores (sem esses o Formatter rejeita qualquer saída do builder):**
1. `ruleType` em cada componentRule (item 4, nota)
2. `pageRule` plano (item 1.1)
3. `itemType` nos FlowItems (item 1.5)
4. `fontRoles` como mapa de papéis (item 1.4)
5. `sourceComponentId` em ELEMENT_INDEX e SECTION_INDEX (item 1.9)

**Fase 2 — Fidelidade de round-trip (carregar perfil existente e reserializar com fidelidade):**
6. Desserializar figure/table/frame/chart/codeListing (item 1.8)
7. `chart.imageRule` aninhado (item 2.7)
8. Agrupamento de slots (`groupId`) (item 1.6)
9. `headingStyleId`/`entryStyleId` configuráveis (item 1.7)
10. `paragraphStyleId` em SECTIONED (item 2.4)
11. `keepWithNextOnHeadings` e `inlineHeadingLevels` (itens 2.1 e 2.2)
12. `knownFieldNames` em SIGNATURE_BLOCK_LIST (item 2.3)
13. `tableContinuationLabels.labelStyleId` real (item 2.5)
14. Corrigir tokens nos templates (item 2.6)
15. `verticalDistanceFromPageEdgeCm` com `Page` (item 1.2)

**Fase 3 — Suporte a APA e normas com notas:**
16. `italic` em `BibEntryPart` (item 2.8)
17. 5 campos APA em `authorFormat` (item 2.9)
18. `noteFormats`, `shortNoteFormats`, `ibidEnabled` (item 2.10)
