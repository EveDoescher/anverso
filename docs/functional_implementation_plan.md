# Plano de Implementação Funcional (MVP)

Este plano foca **exclusivamente na funcionalidade** do sistema e na integração com o backend, ignorando aspectos de design e estética nesta fase. O objetivo é validar o fluxo de dados, requisições HTTP e roteamento.

## Fase 1: Fundação de Comunicação API
Criar a camada de serviços para abstrair as chamadas ao backend.

- **Cliente HTTP Base:** 
  - Configurar função utilitária (fetch/axios) apontando para `http://localhost:8080`.
  - Configurar interceptor/wrapper para injetar automaticamente o cabeçalho `Authorization: Bearer <token>` caso exista.
  - Implementar tratamento de erros global baseado na RFC 7807 (ler códigos de status HTTP e retornar as mensagens amigáveis).
- **Gerenciamento de Estado de Auth:**
  - Salvar `accessToken` e `refreshToken` no `localStorage` ou em `cookies` (preferencialmente cookies caso utilize Server Actions do Next.js).
  - Criar um React Context de Autenticação para fornecer os dados do usuário logado a toda a aplicação.

## Fase 2: Fluxo de Autenticação (IAM Service)
Criar telas com formulários HTML simples, focadas apenas nos inputs, labels, validação de campos e botões de ação.

- **`/register`:** 
  - Formulário: Nome, E-mail, Senha.
  - Ação: Chamar `POST /api/auth/register`. Ao obter sucesso (201), redirecionar para a tela de OTP.
- **`/verify-otp`:**
  - Formulário: E-mail (preenchido previamente, se possível), Código OTP.
  - Ação: Chamar `POST /api/auth/verify-otp`. Sucesso redireciona para login.
- **`/login`:**
  - Formulário: E-mail, Senha.
  - Ação: Chamar `POST /api/auth/login`. Salvar tokens no storage e redirecionar para a página inicial (Dashboard).
- **`/forgot-password` e `/reset-password`:** 
  - Formulários simples de e-mail (para enviar OTP) e e-mail/código/nova senha (para redefinir).

## Fase 3: Área Logada & Profile Service
Proteger estas rotas para que apenas usuários com token válido as acessem.

- **`/dashboard` (ou `/profile`):**
  - Ação inicial: Buscar perfil com `GET /api/users/me`.
  - UI: Mostrar dados brutos do usuário.
- **`/create-profile` (Builder de Perfis de Formatação):**
  - **Passo 1 (Configurações Gerais):** Inputs para `id`, `name`, `description` e `isPublic`.
  - **Passo 2 (Construtor Visual em 3 Colunas):**
    - **Coluna 1 (Componentes):** Lista de componentes do trabalho (ex: Capa, Resumo, Capítulo). Permite Adicionar, Remover e Reordenar componentes.
    - **Coluna 2 (Elementos):** Ao clicar em um componente, mostra os elementos internos dele (ex: Título, Autor, Ano). Permite Adicionar, Remover e Reordenar os elementos.
    - **Coluna 3 (Configurações/Inspetor):** Se um elemento estiver selecionado, exibe os atributos dele (ex: tipo de dado, obrigatório, uppercase, tamanho da fonte). Se nada estiver selecionado, exibe as configurações gerais do componente.
  - Ação: O estado consolida as 3 colunas no formato JSON esperado e chama `POST /api/v1/profiles`.
- **Preferências de Usuário:**
  - Na própria dashboard, um campo simples para digitar/escolher o `defaultProfileId` e um botão de salvar que chama `PUT /api/v1/preferences/default-profile`.

## Fase 4: Work Service (Trabalhos Acadêmicos)
- **`/submit-work`:**
  - O objetivo é que o frontend construa o JSON dinamicamente, de forma totalmente orientada a dados (Data-Driven), garantindo uma boa experiência ao usuário final:
    - **Seleção de Perfil:** O usuário primeiro escolhe um perfil (ex: ABNT). O frontend consome os dados completos desse perfil (`GET /api/v1/profiles/{profileId}`).
    - **Formulário Dinâmico:** O frontend analisa a estrutura do `profileData` (que define os componentes disponíveis, como Capa, Folha de Rosto, etc., e seus respectivos campos) e renderiza dinamicamente os inputs na tela.
    - **Corpo do Trabalho:** Permite a criação de blocos e seções respeitando as hierarquias definidas pelo perfil selecionado.
  - Ação: O estado do React rastreia esses campos gerados dinamicamente e, no submit, monta a estrutura exata do `document` e `options` exigida pelo motor de formatação.
  - O payload é enviado via `POST /api/v1/works/submit`.

---
### Próximos Passos
Se você aprovar este plano, podemos começar pela **Fase 1 e Fase 2** agora mesmo, criando o cliente base da API e as primeiras telas de login/registro (cruas, apenas funcionais) no Next.js.
