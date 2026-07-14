# Plano: Reestruturação da página submit-work

## Diagnóstico atual

### Ponto 1 — Contrato com o Formatter-service

O payload enviado hoje é construído em `handleSubmit` (page.tsx:351-388) como:
```json
{
  "fileName": "...",
  "profileId": "...",
  "options": { "selectedComponents": [...], "fontFamily": "Times New Roman" },
  "document": { "componentId": { "slotName": "valor" } }
}
```

O que o Formatter-service espera (via `ExportDocxRequest`):
```json
{
  "fileName": "...",
  "profileId": "...",
  "options": { "selectedComponents": [...], "fonts": { "default": "Times New Roman" } },
  "document": {
    "bodyContent": { "sections": [...] },
    "cover": { "slotName": "valor", ... },
    "references": { "entries": [...] },
    "listOfAbbreviations": { "items": [...] }
  }
}
```

**Divergências críticas identificadas:**

1. **`options.fontFamily` → `options.fonts`**: O Formatter-service usa `Map<String, String> fonts` (ex: `{"default": "Times New Roman"}`). O frontend envia `fontFamily: "Times New Roman"` — campo ignorado.

2. **`document.references`**: O frontend envia `{ "items": ["ref1", "ref2"] }` (array de strings). O Formatter-service espera `{ "entries": [{ "id": "...", "type": "...", "title": "...", "year": "...", ... }] }` — `ReferenceEntryRequest` com campos estruturados por tipo de fonte.

3. **SinglePage slots vazios**: O `DocumentContentRequest` ignora componentes SinglePage sem slots (`!sp.hasSlots()`). O frontend manda dados mesmo quando vazios, o que pode poluir o payload ou ser descartado silenciosamente.

4. **`selectedComponents` como lista no `document`**: O front inclui componentes sem fields no `document` (porque `componentFields` não tem entrada para eles), mas o `selectedComponents` no `options` guia quais serão renderizados — isso está OK conceitualmente, mas o front inclui componentes que não têm dados reais.

5. **Campos `type` faltando em `BodyBlockRequest`**: O `BodyEditor` já produz `{ type: "PARAGRAPH", text: "..." }` corretamente, mas o campo `sections` do `formData` pode não estar sendo transmitido com a estrutura exata esperada por `BodySectionRequest` (`id`, `level` obrigatórios).

### Ponto 2 — Usabilidade

Problemas identificados:
- Nomes de componentes são IDs técnicos em camelCase (`bodyContent`, `listOfAbbreviations`) — nenhuma label amigável.
- Campos de slot também são IDs técnicos (`institutionalLines`, `advisor`, etc.) — sem labels legíveis.
- References pede "itens separados por vírgula" mas precisa de formulário estruturado por tipo (livro, artigo, site, etc.).
- Não há indicação de progresso (campos preenchidos vs. obrigatórios).
- Sem distinção visual entre seções obrigatórias e opcionais.
- O auto-fill é confuso: o checkbox "preencher campos iguais" não é óbvio para um usuário comum.

---

## Plano de implementação

### Fase 1 — Correções de contrato (sem tocar na UI)

**1.1 Corrigir `options.fonts`**

Em `handleSubmit` e `handleSaveProgress`, trocar:
```ts
options: { selectedComponents, fontFamily }
```
por:
```ts
options: { selectedComponents, fonts: { default: fontFamily } }
```

**1.2 Corrigir `references`**

O campo `references` hoje é `{ items: string[] }`. Precisa virar `{ entries: ReferenceEntry[] }`.

Criar um editor de referências estruturado (ver Fase 2) e serializar para o formato correto:
```ts
document.references = { entries: formData.references.entries }
```

**1.3 Garantir que `bodyContent.sections` tem `id` e `level`**

Verificar se o `BodyEditor` já produz seções com `id` (UUID) e `level` (inteiro 1–6). Se não, adicionar geração de UUID nas seções no momento da criação.

**1.4 Limpar payload: não enviar componentes SinglePage com todos slots vazios**

No `handleSubmit`, antes de incluir um componente no `document`, verificar se pelo menos um slot tem valor não-vazio. Se todos estiverem vazios e o componente for SinglePage, omitir do `document` (mas manter em `selectedComponents` se habilitado).

---

### Fase 2 — Reestruturação da UX

**2.1 Labels amigáveis para componentes**

Criar um mapa de tradução `componentLabels`:
```ts
const componentLabels: Record<string, string> = {
  cover: 'Capa',
  titlePage: 'Folha de Rosto',
  abstract: 'Resumo em Português',
  foreignAbstract: 'Abstract (Inglês)',
  dedication: 'Dedicatória',
  acknowledgments: 'Agradecimentos',
  epigraph: 'Epígrafe',
  listOfAbbreviations: 'Lista de Abreviaturas',
  listOfSymbols: 'Lista de Símbolos',
  listOfFigures: 'Lista de Figuras',
  listOfTables: 'Lista de Tabelas',
  summary: 'Sumário',
  bodyContent: 'Conteúdo do Trabalho',
  references: 'Referências Bibliográficas',
  appendix: 'Apêndices',
  annex: 'Anexos',
};
```
Exibir `componentLabels[compId] ?? compId` em vez do ID bruto.

**2.2 Labels amigáveis para slots**

Criar mapa `slotLabels` para os nomes de slot mais comuns:
```ts
const slotLabels: Record<string, string> = {
  institutionalLines: 'Linhas da Instituição',
  authors: 'Autor(es)',
  title: 'Título',
  subtitle: 'Subtítulo',
  nature: 'Natureza do Trabalho',
  advisor: 'Orientador(a)',
  coadvisor: 'Coorientador(a)',
  city: 'Cidade',
  year: 'Ano',
};
```

**2.3 Editor de Referências estruturado (`ReferencesEditor`)**

Substituir o campo de texto por um componente que:
- Permite adicionar referências com formulário por tipo (Livro, Artigo, Website, TCC/Dissertação, Capítulo de Livro, Outros)
- Campos variam por tipo: livro tem `publisher`, artigo tem `journal`/`volume`/`issue`, website tem `url`/`accessDate`, etc.
- Cada entrada tem UUID auto-gerado como `id`
- Saída serializa diretamente para `ReferenceEntryRequest` esperado pelo Formatter-service

**2.4 Indicador de progresso por seção**

Na sidebar, mostrar check/estado por seção:
- Cinza: vazia (sem dados preenchidos)
- Amarelo: parcialmente preenchida
- Verde: obrigatórios preenchidos

**2.5 Seções obrigatórias vs. opcionais**

- Seções que não podem ser desmarcadas (cover, bodyContent, references) ficam sem o toggle "Incluir no Trabalho" — já feito parcialmente mas incompleto
- Seções opcionais têm badge "Opcional" próximo ao título

**2.6 Simplificação do auto-fill**

Trocar o checkbox confuso por comportamento automático: campos com mesmo nome e tipo são sincronizados silenciosamente, sem opção de desativar (remover a opção da UI para não confundir).

---

## Arquivos a modificar

| Arquivo | O que muda |
|---|---|
| `src/app/submit-work/[[...id]]/page.tsx` | Correções de contrato (1.1–1.4), labels (2.1–2.2), indicador de progresso (2.4), remoção auto-fill UI (2.6) |
| `src/components/body-editor/BodyEditor.tsx` | Garantir `id` e `level` nas seções (1.3) |
| `src/components/submit-work/ReferencesEditor.tsx` | Novo componente (2.3) |

---

### Fase 3 — Reformulação completa da experiência

Esta fase consolida os achados da análise UX/UI e expande a visão da Fase 2 para tornar a interface compreensível para qualquer usuário, sem conhecimento técnico prévio.

---

#### 3.1 Labels humanos em todo lugar

**Problema diagnosticado no código:** Os IDs técnicos aparecem em três camadas distintas:

1. **Sidebar de navegação** (`page.tsx:653`) — usa `compId.replace(/([A-Z])/g, ' $1')`, que transforma `listOfAbbreviations` em `list Of Abbreviations`. Confuso.
2. **Header da seção ativa** (`page.tsx:674`) — mesma lógica, mesmo problema.
3. **Labels dos campos internos** (`composed`, `signature`, `repeat`) — usam `fName` e `sName` brutos (`institutionalLines`, `coadvisor`).

**Solução:** Aplicar `componentLabels` e `slotLabels` (já adicionados no código) em **todos** os três pontos. Os helpers `formatLabel()` e `formatComponentLabel()` já estão disponíveis.

---

#### 3.2 Indicador de progresso no sidebar

**Problema:** O sidebar não dá nenhuma informação sobre o que já foi preenchido. O usuário navega às cegas entre as seções.

**Solução:** A função `getSectionStatus()` já foi implementada. Aplicar no botão do sidebar:

- **Cinza** (círculo vazio): seção não iniciada
- **Amarelo** (círculo com traço): parcialmente preenchida
- **Verde** (checkmark): campos obrigatórios preenchidos
- Seções desabilitadas (`enabledComponents[compId] === false`) exibem ícone de "excluída" sem coloração de status.

Também adicionar uma barra de progresso geral no topo do sidebar (ex: "5 de 8 seções prontas").

---

#### 3.3 Distinção visual entre obrigatórias e opcionais

**Problema:** O toggle "Incluir no Trabalho" some nas seções obrigatórias mas nenhuma explicação é dada. O usuário não sabe se a seção está travada ou simplesmente não tem toggle.

**Solução:**
- Seções obrigatórias: exibir badge `Obrigatório` (vermelho/coral) fixo no header, sem toggle.
- Seções opcionais: exibir badge `Opcional` (slate) e manter o toggle existente, mas com label mais clara: "Incluir esta seção no documento".
- No sidebar: seções opcionais desabilitadas exibem o nome riscado com opacidade reduzida (comportamento já existe, apenas consolidar).

---

#### 3.4 Seções automáticas mais informativas

**Problema atual** (`page.tsx:939-944`): quando uma seção não tem campos para preencher, exibe apenas "Seção Automática" com um checkmark. O usuário não sabe o que vai aparecer no documento.

**Solução:** Adicionar descrição específica por seção. Criar um mapa `componentDescriptions`:

```ts
const componentDescriptions: Record<string, string> = {
  summary: 'O Sumário será gerado automaticamente a partir das seções e títulos do seu Conteúdo do Trabalho.',
  listOfFigures: 'A Lista de Figuras será preenchida automaticamente com as figuras inseridas no Conteúdo do Trabalho.',
  listOfTables: 'A Lista de Tabelas será preenchida automaticamente com as tabelas inseridas no Conteúdo do Trabalho.',
};
```

Exibir o texto correspondente no lugar do genérico atual.

---

#### 3.5 Campo "Nome do Trabalho" mais amigável

**Problema** (`page.tsx:595-604`): O label diz "Nome do Arquivo (sem acentos)" — linguagem técnica que expõe um detalhe de implementação ao usuário.

**Solução:**
- Label: `"Nome do Trabalho"` (sem menção a "arquivo")
- Helper text abaixo do input: `"Será o nome do arquivo gerado. Use apenas letras, números e underline."` 
- Sanitização já ocorre no `handleSubmit` — não mudar a lógica, apenas a apresentação.
- Placeholder: `"ex: meu_tcc_2025"` (manter exemplo real e útil).

---

#### 3.6 Botão de submit com ícone correto

**Problema** (`page.tsx:977`): O botão final usa o ícone `Save` (disquete) com texto "Finalizar e Formatar". O ícone não comunica "envio para formatação" — parece um simples salvar.

**Solução:** Trocar para `FileCheck2` ou `Sparkles`. O texto já está correto, só o ícone está desalinhado com a ação.

---

#### 3.7 Auto-fill — comportamento silencioso com feedback sutil

**Debate:** O plano original propunha remover o checkbox. A análise sugere alternativa: manter controle mas com linguagem clara.

**Decisão proposta:** Manter o checkbox no sidebar, mas:
- Label nova: `"Sincronizar campos repetidos"` (mais descritiva)
- Tooltip `title`: `"Campos com o mesmo nome em seções diferentes (ex: Autor) serão preenchidos automaticamente ao mesmo tempo."`
- Remover do sidebar a seção "Configurações" que agrupa fonte + auto-fill de forma genérica. Separar em grupos nomeados: **"Documento"** (fonte) e **"Comportamento"** (sincronização).

---

#### 3.8 Helper text contextual por tipo de campo

**Problema:** Campos do tipo `array` mostram apenas "Separe múltiplos itens por vírgula" — útil mas genérico. Em contextos específicos (keywords do resumo, abreviaturas) falta exemplo concreto.

**Solução:** Adicionar dicas específicas por slot no mapa `slotLabels` estendido:

```ts
const slotHints: Record<string, string> = {
  keywords: 'Ex: Aprendizado de Máquina, Redes Neurais, Visão Computacional',
  institutionalLines: 'Ex: Universidade Federal de Brasília\nFaculdade de Tecnologia',
  nature: 'Ex: Trabalho de Conclusão de Curso apresentado como requisito parcial...',
  authors: 'Um autor por linha ou separados por vírgula',
};
```

Exibir como helper text abaixo do campo relevante.

---

#### 3.9 Estado vazio do sidebar (antes de selecionar seção)

**Problema menor:** Ao carregar com perfil já selecionado e `activeTab = 0`, tudo funciona. Mas se `componentOrder` vier vazio (perfil malformado), o formulário fica em branco sem mensagem de erro.

**Solução:** Adicionar guard no render do formulário: se `componentOrder.length === 0` após carregar o perfil, exibir mensagem de erro com botão "Trocar Perfil".

---

#### 3.10 Acessibilidade de teclado nos botões de remoção

**Problema** (`page.tsx:750, 835`): Os botões de remover item (`✕`) usam o caractere `✕` como conteúdo. Isso é inacessível para leitores de tela e viola `aria-labels`.

**Solução:** Trocar para o ícone `<X />` do Lucide (já importado) com `aria-label="Remover"`:

```tsx
<button aria-label="Remover" ...>
  <X className="w-3.5 h-3.5" />
</button>
```

---

## Arquivos a modificar (revisado)

| Arquivo | O que muda |
|---|---|
| `src/app/submit-work/[[...id]]/page.tsx` | Contratos (1.1–1.4), labels (3.1), progresso (3.2), badges (3.3), seções automáticas (3.4), nome do trabalho (3.5), botão submit (3.6), auto-fill label (3.7), helper texts (3.8), guard vazio (3.9), acessibilidade botões (3.10) |
| `src/components/body-editor/BodyEditor.tsx` | Garantir `id` e `level` nas seções (1.3) |
| `src/components/submit-work/ReferencesEditor.tsx` | Novo componente (2.3) |

## Ordem de implementação recomendada

```
Fase 1 — Contratos (sem impacto visual, baixo risco)
  1.1 options.fonts                    ✅ já feito
  1.2 ReferencesEditor (contrato)      → Fase 2, item 2.3
  1.3 bodyContent sections id+level    → verificar BodyEditor
  1.4 Limpar payload vazio             → handleSubmit

Fase 2 — Quick wins de UX (alto impacto, baixo esforço)
  3.1 Labels componentLabels/slotLabels em todos os pontos
  3.5 Campo "Nome do Trabalho"
  3.6 Botão submit com ícone correto
  3.10 Botões ✕ → <X aria-label>

Fase 3 — Estrutura visual (médio esforço)
  3.2 Indicador de progresso no sidebar (getSectionStatus já pronto)
  3.3 Badges Obrigatório/Opcional
  3.4 Seções automáticas descritivas
  3.7 Auto-fill label e organização do sidebar
  3.8 Helper texts por slot
  3.9 Guard componentOrder vazio

Fase 4 — Novo componente (maior esforço)
  2.3 ReferencesEditor estruturado por tipo
```

## O que NÃO muda

- Estrutura do BodyEditor e SectionedEditor — já produzem formato correto
- Fluxo de seleção de perfil — funciona bem
- Lógica de rascunho (draft) — funciona, apenas corrigir `options.fonts`
- Backend (anverso-core e Formatter-service) — nenhuma mudança necessária
