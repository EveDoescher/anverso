# Plano — Adições e Correções Anverso

## Escopo

Implementar todas as correções e melhorias listadas no arquivo `docs/Adições e correções Anverso.md`.

---

## Seção Geral

### 1. Botão de compartilhamento de perfil (`/explore/[id]`)
**Situação:** O botão "Compartilhar" existe (`src/app/explore/[id]/page.tsx:318`) mas não tem handler — só o ícone.
**Ação:** Implementar a funcionalidade usando `navigator.clipboard.writeText(window.location.href)` com feedback visual (toast ou mudança de label temporária).

### 2. Melhorar sistema de filtros e pesquisa no `/explore`
**Situação:** Filtros existem (`explore/page.tsx`), mas o ordenar por "Recentes" usa `favoritesCount` em vez de data de criação (bug linha 105); as tags são inferidas do nome, não de um campo real.
**Ação:** Corrigir o sort "recents" para usar campo de data (verificar o que a API retorna); melhorar inferência de tags ou aguardar campo real da API.

### 3. Comentários externos de contas compartilhadas
**Situação:** O sistema de reviews existe, mas é só para usuários logados em perfis. A funcionalidade é para o **criador de trabalhos** — usuários convidados que recebem compartilhamento de um trabalho em desenvolvimento podem comentar em seções e elementos.
**Ação:** Planejado junto com o item "compartilhamento de trabalhos" no criador de trabalhos. Ver seção Criador de Trabalhos.

### 4. Verificação de perfil de professor
**Situação:** A aba "Verificações" no admin já existe (`admin/page.tsx:376`) mas está vazia — marcada como "em breve".
**Ação:** Implementar a UI da aba de verificações no admin: listar solicitações pendentes (endpoint a confirmar no backend), com ações de aprovar/rejeitar e badge visual no perfil do usuário verificado.

### 5. Renomear "Dashboard"
**Situação:** `/dashboard` usa o título "Dashboard" (`dashboard/page.tsx:158`).
**Ação:** Renomear para **"Minha Área"** — adequado, não agressivo, comum em plataformas BR.

### 6. Consertar acesso público ao explore e reformular sistema de autenticação e redirecionamento
**Situação:** O acesso público ao explore ainda não está funcionando corretamente. Além disso, o sistema de autenticação e redirecionamento de páginas como um todo precisa ser revisado — há casos em que rotas públicas redirecionam indevidamente para login, e rotas autenticadas podem não proteger corretamente.
**Ação:**
- Auditar o middleware/lógica de autenticação para garantir que rotas públicas (`/`, `/explore`, `/explore/[id]`, `/login`, `/register`) não redirecionem para login.
- Garantir que rotas autenticadas (`/dashboard`, `/create-profile`, `/submit-work`, `/admin`) redirecionem para login quando o token está ausente ou inválido.
- Reformular o fluxo de redirecionamento pós-login para retornar o usuário à página que tentou acessar (parâmetro `?redirect=`).
- Verificar comportamento do `fetchApi` e do `skipAuthRedirect` para consistência.

### 7. Filtros — "Ordenar por" quebrando o container
**Situação:** `SegmentedControl` na sidebar do explore (`explore/page.tsx:153`) provavelmente transborda em telas menores.
**Ação:** Ajustar o `SegmentedControl` para caber na sidebar de 256px (`w-64`), mudando para orientação vertical ou reduzindo labels.

### 8. `/explore` não reflete nome e foto real do usuário
**Situação:** O código já busca `authorName` via `/api/users/{ownerId}/public` (`explore/page.tsx:40-46`), mas a foto não é buscada no listing (só no detalhe). Também, o campo `authorPhoto` existe no detalhe mas não nos cards do listing.
**Ação:** Adicionar foto do autor nos cards do listing (avatar pequeno no lugar do ícone `User`).

### 9. Contagem de usos do perfil não funciona
**Situação:** `usageCount` vem da API mas provavelmente não é incrementado no backend ao usar o perfil.
**Ação:** Esta é uma correção de **backend**. Verificar no `anverso-core` se o profile-service incrementa `usageCount` quando um trabalho é criado com aquele profileId. Se não, adicionar. *Sinalizar ao usuário que pode ser necessário.*

### 10. Sistema de armazenamento de fotos quebrado
**Situação:** Sem ver o backend não é possível determinar a causa exata. Provavelmente relacionado ao upload de imagens no `work-service` ou ao proxy do gateway.
**Ação:** Investigar o fluxo de upload (`UploadDropzone.tsx`) e os endpoints de armazenamento no `anverso-core`. *Item requer investigação separada no backend.*

### 11. `/explore/[id]` — remover "O que está incluído" e detalhar em "Detalhes do Perfil"
**Situação:** A seção "O que está incluído?" (`explore/[id]/page.tsx:265-274`) é hardcoded com dados falsos de ABNT. A aba "Detalhes do Perfil" (`activeTab === 'details'`) só tem texto genérico.
**Ação:**
- Remover a seção hardcoded "O que está incluído?".
- Na aba "Detalhes do Perfil", parsear o `profileData` do perfil carregado e exibir de forma legível: lista de componentes com seus nomes e tipos, configurações de página (tamanho, margens), fonte padrão, pós-processamento ativo.

### 12. Melhorar estatísticas do painel de administrador
**Situação:** Admin mostra apenas: total usuários, contas ativas, logados hoje (sempre 0 pois endpoint não existe), perfis criados, trabalhos processados.
**Ação:** Adicionar métricas mais relevantes se disponíveis na API: trabalhos por status (DRAFT/COMPLETED/PROCESSING), perfis mais usados (top 5), crescimento de usuários recentes. Remover ou corrigir "Logados Hoje" que sempre retorna 0.

---

## Criador de Perfis

### 13. Renomear para "Criador de Perfil" — remover referências a "Builder"
**Situação:** `BuilderSidebar.tsx:30` exibe "Builder". O nome da pasta é `profile-builder`. A sidebar (`SECTIONS`) usa label "Perfil", "Página", etc — ok. Só o cabeçalho da sidebar tem "Builder".
**Ação:** Alterar o texto "Builder" na sidebar para "Criador de Perfil". Não renomear pastas/componentes (risco de regressão desnecessário).

### 14. Ao selecionar tamanho de folha existente (A4, Ofício etc.) — ocultar largura e altura
**Situação:** Os campos Largura e Altura já ficam `disabled` quando `paperFormat !== 'Custom'` (`create-profile/page.tsx:447-463`), mas continuam **visíveis**.
**Ação:** Ocultar os campos (`display: none` ou condicional) quando o formato não for "Personalizado". Exibir apenas quando `Custom`.

### 15. Seção "Famílias de fonte" — refatoração completa
**Situação:** A UI atual (`create-profile/page.tsx:481-567`) exibe roles de fonte com checkboxes de estilos — confuso. O md pede: definir uma **fonte padrão** e quais são as **opcionais**; remover a lista de nomes de estilos em checkboxes.
**Ação:**
- Renomear seção para "Fontes".
- Expor apenas: dropdown "Fonte padrão" (baseFont) + lista de fontes opcionais adicionais que podem ser escolhidas pelo usuário do trabalho.
- Remover completamente a UI de "Estilos que usam esta fonte" (checkboxes de styleRules por fontRole).
- Manter o serializer funcionando (o contrato do formatter ainda tem `fontRoles` com `styleIds`).

### 16. Numeração de páginas — criar aba separada após "Seções do Documento"
**Situação:** A numeração fica na aba "Página" (`create-profile/page.tsx:570-625`), mas os seletores de componente (`countFromComponentId`, `visibleFromComponentId`) ficam vazios se o usuário ainda não criou componentes. A ordem natural de uso é: página → componentes → numeração.
**Ação:**
- Remover o bloco de numeração de páginas da aba "Página".
- Criar uma nova aba dedicada **"Numeração de Páginas"** na sidebar, posicionada logo após "Seções do Documento" (e antes de "Elementos Textuais").
- Atualizar `BuilderSidebar.tsx` (`SECTIONS`) para incluir a nova entrada `{ id: 'numbering', label: 'Numeração de Páginas' }`.
- Mover a renderização da numeração para um novo `renderNumbering()` na página do criador de perfil.

### 17. Aba "Seções do Documento" — adaptar para description e placeholder do formatter-service
**Situação:** O contrato do formatter-service agora tem:
- `ComponentRule.description()` — descrição do componente
- `SlotRule.description()` — descrição do campo
- `SlotRule.placeholder()` — placeholder do campo
Esses campos não são expostos em nenhum lugar da UI atual.
**Ação:**
- Em `SlotInspector.tsx`: adicionar campo "Descrição do campo" e "Placeholder" para cada slot.
- Em `SinglePageForm.tsx` / demais forms de componente: adicionar campo "Descrição do componente".
- Em `profileSerializer.ts`: serializar `description` e `placeholder` nos slots, e `description` nos componentRules.
- Em `profileSerializer.ts`: deserializar esses campos ao carregar.

### 18. Slots — remover "Nome do estilo" (o campo `id` mascarado)
**Situação:** `StyleRuleEditor.tsx:48-58` tem um campo "Nome do estilo" que altera o `displayName` e deriva o `id` automaticamente (`displayNameToStyleId`). O usuário não deveria ver nem controlar o ID do estilo.
**Ação:** O campo "Nome do estilo" no `StyleRuleEditor` que aparece **dentro do SlotInspector** deve ser removido. O `id` do StyleRule deve ser gerado automaticamente e o `displayName` deve ser derivado do nome do slot. O campo "Nome do estilo" pode ser mantido apenas em contextos de edição avançada se necessário — mas no SlotInspector não deve aparecer.

### 19. Slots — "Família de fonte" → "Fonte" com opção "Padrão"
**Situação:** `StyleRuleEditor.tsx:72-80` exibe um select "Família de fonte" com lista fixa.
**Ação:** Renomear para "Fonte". Adicionar opção "Padrão (definida na página)" como primeiro item. Quando selecionado, o slot herda a `baseFont` definida na aba Página.

### 20. Componentes sem slots configuráveis — mover configurações ou explicar
**Situação:** Componentes como `ELEMENT_INDEX`, `SECTION_INDEX` e `BODY_CONTENT` não têm slots visuais no painel central. A coluna da direita (InspectorPanel) fica com o form de configurações, mas a coluna central fica vazia ou sem propósito.
**Ação:** Para esses tipos, colocar as configurações na coluna central e remover/ocultar a coluna direita, ou adicionar texto explicativo na coluna central sobre o que o componente faz automaticamente.

### 21. Componentes "Página Única" e "Texto Livre" — mais explicações
**Situação:** Os forms `SinglePageForm.tsx` e `FlowTextualForm.tsx` têm pouquíssima explicação sobre o que cada configuração faz.
**Ação:** Adicionar tooltips e textos de ajuda para cada opção da "Política de Layout" em `SinglePageForm` e para cada tipo de `FlowItem` em `FlowTextualForm`.

### 22. Não é possível mudar o tipo do componente após criado
**Situação:** O `ruleType` fica fixo após criar o componente. Não há UI para alterá-lo.
**Ação:** Adicionar no `InspectorPanel` (ou no `ComponentList`) um select de tipo com modal de confirmação avisando que slots existentes podem ser perdidos.

### 23. "Agrupar com outros campos" — melhorar UX
**Situação:** `SlotInspector.tsx:195-205` exibe um input de texto livre para `groupId`. O usuário precisa digitar o mesmo nome em vários slots para agrupá-los.
**Ação:** Substituir por um select/multiselect que lista os outros slots do componente. Ao selecionar, o sistema atribui automaticamente o mesmo `groupId` gerado internamente. Mostrar quais slots já estão agrupados entre si.

### 24. Acentuação quebrando para "??"
**Situação:** Alguns títulos e campos com acentuação quebram para "??".
**Ação:** Investigar a causa. Possível problema no `nameToId` (`create-profile/page.tsx:261`) que usa `normalize('NFD')` — pode estar corrompendo texto em algum display. Ou problema de encoding na API. Testar e corrigir.

### 25. Aba "Elementos Textuais" — duas visualizações e falta de configurações de posicionamento
**Situação:** `TextualElementsGallery.tsx:514` divide cada card em grid `grid-cols-2` (schema + editor), o que pode causar "2 visualizações". A coluna está estreita e dificulta a leitura de algumas informações.
**Ação:**
- Corrigir o layout para que o card expandido use largura total da área disponível.
- Adicionar configurações de posicionamento para elementos que suportam disposição variável (figuras, tabelas, gráficos): permitir qualquer ordem possível entre os sub-elementos (legenda, fonte, imagem, etc.) — não apenas os exemplos citados, mas qualquer combinação configurável pelo usuário.

### 26. Faltam explicações para citações, notas de rodapé, código, tabelas, figuras
**Situação:** Os editores dos elementos textuais existem, mas sem texto de ajuda contextual sobre o que cada configuração significa na prática.
**Ação:** Adicionar `description` em cada `CardDef` e exibi-la abaixo do `card.label`, mais tooltips nos campos menos óbvios.

### 27. Pós-processamento — remover "Estilo do rótulo"
**Situação:** `create-profile/page.tsx:730-736` tem um select "Estilo do rótulo" dentro dos "Rótulos de Tabelas Longas".
**Ação:** Remover apenas o select de "Estilo do rótulo". Manter os campos de texto continua/continuação/conclusão.

### 28. Pós-processamento — remover "Verificação de integridade"
**Situação:** `create-profile/page.tsx:742-778` tem a seção "Verificação de integridade".
**Ação:** Remover completamente o bloco da UI e remover do `PostProcessingState` e do serializer.
> **Nota:** O contrato do formatter-service **tem** `integrityCheck` (verificado no `ecosystem-contract.md`). A remoção é da UI do criador de perfil — o campo pode ser removido do serializer ou mantido hardcoded com defaults razoáveis.

### 29. Sistema aponta quantidade de problemas mas não diz quais/onde
**Situação:** O header do builder mostra "N problema(s)" (`create-profile/page.tsx:885`) mas sem detalhe. O `AlertModal` mostra os erros ao tentar salvar.
**Ação:** Ao clicar no badge de problemas, abrir um painel/modal listando cada erro com link para a seção e componente correspondente.

---

## Criador de Trabalhos

### 30. Tamanho limitado horizontalmente
**Situação:** O criador de trabalhos (`submit-work`) tem layout mais estreito que o criador de perfis.
**Ação:** Ajustar o layout para usar a largura disponível de forma similar ao criador de perfis.

### 31. Sincronização de campos repetidos quebrada
**Situação:** A função de `autoFill` (`submit-work/page.tsx:102`) copia textos para campos que podem não ser a mesma coisa.
**Ação:** Rever a lógica de auto-fill para sincronizar apenas campos com exatamente o mesmo `slotName` entre componentes diferentes.

### 32. Readaptar para description, placeholder e componentes obrigatórios do profile
**Situação:** O criador de trabalhos atual infere campos com base em lógica própria (`submit-work/page.tsx:249-300`). Com os novos campos `description` e `placeholder` no contrato do formatter-service, e a flag `required` do componente, a UI deve derivar essas informações do profileData.
**Ação:**
- Ao carregar o profile, usar `description` do componente para explicar cada seção ao usuário.
- Usar `description` e `placeholder` de cada slot para label e placeholder dos campos de input.
- Usar `ComponentRule.required()` para marcar quais componentes são obrigatórios vs opcionais.
- Atualizar `profileSerializer.ts` para serializar `description` e `placeholder` nos slots.

### 33. Componentes mal interpretados (ex: referências bibliográficas com só campo "Itens")
**Situação:** O submit-work tenta parsear o profileData mas alguns tipos de componente (especialmente `REFERENCE_LIST` / `BIBLIOGRAPHY`) são interpretados como simples lista de texto.
**Ação:** Implementar um editor específico para `REFERENCE_LIST` no criador de trabalhos — com formulário por tipo de referência (livro, artigo, site, etc.), campos estruturados por tipo.

### 34. Padronizar sistema de compartilhamento igual ao de perfis
**Situação:** Compartilhamento de trabalho em desenvolvimento não tem UI padronizada.
**Ação:** Implementar botão "Compartilhar" no criador de trabalhos com a mesma UX do compartilhamento de perfil (link copiável + acesso com permissão de visualização/comentário).

### 35. Comentários em trabalhos compartilhados
**Situação:** Não existe sistema de comentários por seção/elemento no criador de trabalhos.
**Ação:** Implementar sistema de comentários ancorados em seções/elementos, visível para usuários com quem o trabalho foi compartilhado. Requer suporte no backend (work-service).

### 36. Sistema de salvamento "pisca" na primeira vez
**Situação:** Ao salvar pela primeira vez, ocorre um "flash" visual.
**Ação:** Investigar a causa (provavelmente um setState que causa re-render abrupto do conteúdo). Garantir que o estado seja atualizado de forma incremental sem re-montagem completa do componente.

### 37. Elementos seccionados e corpo do trabalho — melhorar visualização e UX
**Situação:** Em elementos com itens seccionados (Apêndices, Anexos — tipo `SECTIONED`) e no corpo do trabalho (`BODY_CONTENT`), títulos de nível 6 ficam mal visíveis e a UI dos itens seccionados está com problemas visuais. O mesmo problema de visibilidade de títulos profundos ocorre no `BodyEditor`/`SectionedEditor`.
**Ação:**
- Garantir que títulos de todos os níveis (1-6) tenham estilo visual distinto e legível no editor, tanto no `SectionedEditor` quanto no `BodyEditor`.
- Melhorar a UI dos itens seccionados (indentação visual, drag para reorganizar, hierarquia clara).
- Revisar os componentes `BlockEditor.tsx`, `SectionedEditor.tsx` e `BodyEditor.tsx` para corrigir os mesmos problemas de visibilidade.

---

## Fases de Implementação

Cada fase é uma sessão independente. Os itens dentro de cada fase compartilham os mesmos arquivos e contexto, minimizando o que precisa ser relido a cada sessão.

---

### Fase 1 — Fundação: autenticação, navegação e nomenclatura
**Itens:** 5, 6, 13

**Coesão:** Mudanças que afetam toda a navegação da plataforma. Precisam ser feitas primeiro porque um sistema de autenticação com falhas prejudica o teste de tudo que vem depois. Os renomes (dashboard, builder) são triviais mas convenientes de resolver junto.

**Arquivos principais:**
- `src/lib/api.ts` — lógica de `fetchApi` e `skipAuthRedirect`
- `src/middleware.ts` (ou equivalente) — rotas públicas vs protegidas
- `src/app/dashboard/page.tsx` — renomear título
- `src/components/profile-builder/BuilderSidebar.tsx` — renomear "Builder"
- Configuração de rotas no gateway (`api-gateway`)

**Resultado esperado:** Qualquer usuário não logado consegue navegar em `/explore` e `/explore/[id]` sem ser redirecionado para login. Usuários logados são redirecionados de volta à página original após login.

---

### Fase 2 — Explore: página de descoberta da comunidade
**Itens:** 1, 2, 7, 8, 11

**Coesão:** Todos os itens tocam exclusivamente as páginas `/explore` e `/explore/[id]`. A fase entrega o explore funcional e informativo do ponto de vista do usuário final.

**Arquivos principais:**
- `src/app/explore/page.tsx` — filtros, sort, foto do autor nos cards
- `src/app/explore/[id]/page.tsx` — botão compartilhar, seção "Detalhes do Perfil", remoção do "O que está incluído"

**Resultado esperado:** Explore com filtros corretos, foto real de cada autor, botão de compartilhamento funcional, e a aba "Detalhes do Perfil" exibindo os componentes reais do perfil em vez de texto hardcoded.

---

### Fase 3 — Criador de Perfil: estrutura da sidebar e aba Página
**Itens:** 14, 15, 16, 27, 28

**Coesão:** Todos tocam a estrutura de abas do criador de perfil e o conteúdo das abas "Página" e "Pós-processamento". O item 16 cria uma nova aba, o que muda `BuilderSidebar.tsx` e a página principal do criador — boa âncora para os outros ajustes de estrutura.

**Arquivos principais:**
- `src/components/profile-builder/BuilderSidebar.tsx` — nova aba "Numeração de Páginas"
- `src/app/create-profile/[[...id]]/page.tsx` — ocultar campos de dimensão, refatorar fontes, extrair renderNumbering(), remover estilo do rótulo e verificação de integridade
- `src/lib/profileSerializer.ts` — remover `integrityCheck` do estado e do serializer (ou manter hardcoded)

**Resultado esperado:** Criador de perfil com sidebar reorganizada (nova aba de numeração após seções), campos de tamanho de folha ocultados quando formato é fixo, seção de fontes simplificada, pós-processamento sem campos desnecessários.

---

### Fase 4 — Criador de Perfil: slots, estilos e serializer
**Itens:** 17, 18, 19, 22, 23, 24

**Coesão:** Todos tocam `SlotInspector.tsx`, `StyleRuleEditor.tsx` e `profileSerializer.ts` — o núcleo do editor de slots/componentes. O item 17 (description/placeholder) muda o serializer, os itens 18 e 19 mudam o `StyleRuleEditor`, e os itens 22 e 23 mudam o `InspectorPanel`/`ComponentList`. O item 24 (encoding) provavelmente surge ao testar os anteriores.

**Arquivos principais:**
- `src/components/profile-builder/SlotInspector.tsx` — description, placeholder, agrupamento melhorado
- `src/components/profile-builder/StyleRuleEditor.tsx` — remover "Nome do estilo", renomear "Fonte" com opção Padrão
- `src/components/profile-builder/InspectorPanel.tsx` — description do componente, mudança de tipo com confirmação
- `src/components/profile-builder/ComponentList.tsx` — suporte a mudança de tipo
- `src/lib/profileSerializer.ts` — serializar/deserializar description e placeholder nos slots e componentes

**Resultado esperado:** Slots com campos de descrição e placeholder editáveis, sem IDs expostos, com fonte herdável da página, agrupamento por seleção visual, e encoding de acentos corrigido.

---

### Fase 5 — Criador de Perfil: UX, clareza e feedback de erros
**Itens:** 20, 21, 25, 26, 29

**Coesão:** Todos são melhorias de clareza e comunicação com o usuário dentro do criador de perfil — textos de ajuda, tooltips, layout de cards, e feedback de erros. Não alteram estrutura de dados nem contratos, só UI e texto.

**Arquivos principais:**
- `src/components/profile-builder/ComponentVisualPanel.tsx` — layout para componentes sem slots
- `src/components/profile-builder/forms/SinglePageForm.tsx` — tooltips e ajuda
- `src/components/profile-builder/forms/FlowTextualForm.tsx` — tooltips e ajuda
- `src/components/profile-builder/TextualElementsGallery.tsx` — layout, posicionamento configurável, descrições
- `src/app/create-profile/[[...id]]/page.tsx` — badge de problemas clicável com painel de detalhes

**Resultado esperado:** Usuário consegue entender o que cada tipo de componente, slot e elemento textual faz sem precisar de documentação externa. Badge de erros clicável mostra exatamente onde e qual é cada problema.

---

### Fase 6 — Criador de Trabalhos: estrutura, parsing e editores
**Itens:** 30, 31, 32, 33, 36, 37

**Coesão:** Todos tocam `/submit-work` e os editores de conteúdo (`BodyEditor`, `SectionedEditor`, `BlockEditor`). O item 32 (usar description/placeholder do profile) depende da Fase 4 ter adicionado esses campos ao serializer. O item 33 (editor de referências) e o 37 (visibilidade de títulos) são complementares na experiência de preenchimento do trabalho.

**Arquivos principais:**
- `src/app/submit-work/[[...id]]/page.tsx` — layout, auto-fill, parsing por description/placeholder/required
- `src/components/body-editor/BodyEditor.tsx` — visibilidade de títulos profundos, flash de salvamento
- `src/components/body-editor/SectionedEditor.tsx` — visibilidade e UX de itens seccionados
- `src/components/body-editor/BlockEditor.tsx` — visibilidade de títulos nível 6
- Novo componente: editor estruturado para `REFERENCE_LIST`

**Pré-requisito:** Fase 4 concluída (description e placeholder no serializer).

**Resultado esperado:** Criador de trabalhos com layout adequado, campos rotulados e com placeholders vindos do profile, editor de referências funcional por tipo, títulos de todos os níveis legíveis, sem flash de salvamento.

---

### Fase 7 — Backend: correções e stats do admin
**Itens:** 9, 10, 12

**Coesão:** Todos requerem trabalho no `anverso-core` e não dependem de nenhuma das fases anteriores de frontend. Podem ser feitos em paralelo com as fases 3–6, mas agrupados aqui por natureza (backend Java).

**Serviços envolvidos:**
- `work-service` — incrementar `usageCount` no profile-service ao criar/submeter trabalho (item 9)
- `iam-service` — investigar e corrigir armazenamento de `profilePictureUrl` (item 10)
- `work-service` + `profile-service` — novos endpoints de stats para o admin: trabalhos por status, perfis mais usados (item 12)

**Frontend associado (pequeno, pode ser feito junto):**
- `src/app/admin/page.tsx` — exibir as novas métricas quando os endpoints estiverem disponíveis

**Resultado esperado:** Contagem de usos de perfil funcionando, fotos de perfil aparecendo corretamente, painel admin com métricas reais.

---

### Fase 8 — Features avançadas: compartilhamento, comentários e verificações
**Itens:** 3, 4, 34, 35

**Coesão:** Todas são features novas que requerem criação do zero no backend antes de qualquer UI. São as mais complexas e independentes entre si, mas agrupadas aqui por requererem a mesma postura: projetar contrato de API → implementar backend → implementar frontend.

**Sub-features e dependências:**

**34 + 3 — Compartilhamento e comentários em trabalhos:**
- Backend: criar endpoints de compartilhamento no work-service (tabela de permissões por trabalho + convidados)
- Backend: criar endpoints de comentários por seção/elemento no work-service
- Frontend: botão "Compartilhar" no criador de trabalhos, sistema de comentários ancorados
- Pré-requisito: Fase 6 concluída

**4 — Verificação de professor:**
- Backend: criar sistema de KYC docente no iam-service (solicitação, fila de aprovação, badge no usuário)
- Frontend: aba "Verificações" no admin com lista de solicitações pendentes e ações de aprovar/rejeitar
- Independente das demais sub-features desta fase

**Resultado esperado:** Usuários podem compartilhar trabalhos em desenvolvimento com outros, que podem comentar por seção. Professores podem solicitar verificação de credencial, e admins podem aprovar/rejeitar.

---

## Respostas às perguntas de backend (investigado em anverso-core)

**Item 9 — usageCount:**
O campo `usageCount` existe na entidade `FormattingProfile` (default 0), mas **nenhum código incrementa esse valor** quando um trabalho é criado ou submetido. O `WorkService` não chama o profile-service. Precisa ser implementado no backend: ao criar/submeter um trabalho com `profileId`, o work-service deve chamar o profile-service para incrementar `usageCount`.

**Item 10 — Armazenamento de fotos:**
O `StorageService` no work-service salva arquivos em disco local (`storage/works/`) com UUID + nome original, retornando uma URL `/files/[uniqueFileName]`. O `AcademicWork` tem apenas o campo `fileUrl` (String). Não há lógica de upload de imagens de perfil de usuário neste serviço — o problema de fotos quebradas provavelmente está no iam-service (campo `profilePictureUrl` no `User`) ou no gateway. Requer investigação específica no iam-service.

**Item 4 — Verificação de professor:**
O `VerificationController` e `VerificationService` existem, mas implementam apenas verificação por **OTP** (registro/reset de senha) — não há nenhum endpoint de verificação de credencial docente/institucional. O sistema de KYC para professores **precisa ser criado do zero** no backend. No frontend, a aba "Verificações" do admin pode ser implementada assim que o backend existir.

**Item 12 — Stats do admin:**
- `GET /api/v1/works/stats` — **existe**, retorna `{ totalWorks: Long }`.
- `GET /api/users/stats` — **existe**, requer role ADMIN, retorna `{ loggedInUsers: Long }` contando sessões de refresh token ativas. O valor "0" provavelmente ocorre porque o endpoint existe mas os refresh tokens são limpos ou o campo não é populado corretamente. Investigar.
- Para métricas adicionais (trabalhos por status, perfis mais usados), os endpoints **não existem** e precisariam ser criados no backend.

**Item 34 — Compartilhamento de trabalhos:**
**Não existe** nenhum campo ou endpoint de compartilhamento no work-service. Precisa ser criado do zero (tabela de permissões por trabalho + endpoints no backend + UI no frontend).

**Item 35 — Comentários em trabalhos:**
**Não existe** nenhuma entidade, campo ou endpoint de comentários no work-service. Precisa ser criado do zero no backend antes de qualquer implementação no frontend.

**Item 6 — Gateway de autenticação:**
O `JwtAuthenticationGatewayFilterFactory` faz bypass apenas para:
- `GET /api/v1/profiles/**`
- `OPTIONS` em qualquer rota

Todas as demais rotas exigem `Authorization: Bearer <JWT>`. O gateway injeta `X-Account-Id` com o `userId` do token para os serviços downstream. O problema de acesso público ao explore pode estar em rotas do gateway não cobertas por esse bypass, ou no frontend não tratando corretamente a ausência de token.
