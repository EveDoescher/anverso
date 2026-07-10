# Frontend — Contrato de Integração com o Backend

Este documento descreve como o Frontend deve se comunicar com o ecossistema de microsserviços do Anverso. Aqui você encontrará detalhes sobre a arquitetura de roteamento, autenticação, endpoints disponíveis e as estruturas de dados (DTOs) esperadas.

---

## 1. Arquitetura e Conexão Base

O ecossistema é formado por múltiplos microsserviços, mas o frontend **nunca** se comunica diretamente com eles. Todas as requisições devem passar pelo **API Gateway**, que atua como ponto único de entrada e saída.

*   **URL Base Local:** `http://localhost:8080`
*   **CORS:** O API Gateway está configurado para aceitar requisições de qualquer origem (`*`), permitindo os métodos `GET`, `POST`, `PUT`, `DELETE` e `OPTIONS` com todos os headers liberados.

### Autenticação

A autenticação é baseada em tokens JWT.
*   Quando o usuário fizer login, o backend retornará um `accessToken` e um `refreshToken`.
*   Para acessar rotas protegidas (como perfil e trabalhos), o frontend deve enviar o `accessToken` no cabeçalho da requisição:
    ```http
    Authorization: Bearer <seu_access_token>
    ```
*   **Nota Interna:** O Gateway valida esse token e o converte internamente em um cabeçalho `X-Account-Id` para os microsserviços. O frontend só precisa se preocupar em enviar o `Authorization: Bearer`.

---

## 2. IAM Service (Autenticação e Usuários)

Este serviço gerencia identidades, login, registro e recuperação de senha.

### Registro de Usuário
*   **Endpoint:** `POST /api/auth/register`
*   **Autenticação:** Nenhuma
*   **Descrição:** Registra um novo usuário e envia um código OTP para verificação de e-mail.
*   **Payload (JSON):**
    ```json
    {
      "name": "Nome Completo",
      "email": "usuario@exemplo.com",
      "password": "SenhaForte123" // Mínimo 8 caracteres
    }
    ```
*   **Retorno (201 Created):**
    ```json
    { "message": "Usuário registrado com sucesso. Por favor, verifique seu e-mail com o código de verificação." }
    ```

### Login com E-mail/Senha
*   **Endpoint:** `POST /api/auth/login`
*   **Autenticação:** Nenhuma
*   **Payload (JSON):**
    ```json
    {
      "email": "usuario@exemplo.com",
      "password": "SenhaForte123"
    }
    ```
*   **Retorno (200 OK):**
    ```json
    {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "d7a8s9d7..."
    }
    ```

### Login com Google
*   **Endpoint:** `POST /api/auth/google`
*   **Autenticação:** Nenhuma
*   **Descrição:** Autentica usando o OAuth2 ID Token fornecido pelo Google.
*   **Payload (JSON):**
    ```json
    {
      "idToken": "google_id_token_aqui"
    }
    ```
*   **Retorno (200 OK):** Idêntico ao retorno do Login convencional (Tokens).

### Verificação de OTP (Para Registro)
*   **Endpoint:** `POST /api/auth/verify-otp`
*   **Autenticação:** Nenhuma
*   **Payload (JSON):**
    ```json
    {
      "email": "usuario@exemplo.com",
      "code": "123456"
    }
    ```
*   **Retorno (200 OK):** Mensagem de sucesso.

### Reenvio de OTP
*   **Endpoint:** `POST /api/auth/resend-otp`
*   **Autenticação:** Nenhuma
*   **Payload (JSON):**
    ```json
    {
      "email": "usuario@exemplo.com"
    }
    ```
*   **Retorno (200 OK):** Mensagem de sucesso.

### Recuperação de Senha (Esqueci a Senha)
*   **Endpoint:** `POST /api/auth/forgot-password`
*   **Autenticação:** Nenhuma
*   **Descrição:** Envia um OTP para o e-mail do usuário.
*   **Payload (JSON):**
    ```json
    {
      "email": "usuario@exemplo.com"
    }
    ```
*   **Retorno (200 OK):** Mensagem informando o envio.

### Redefinição de Senha
*   **Endpoint:** `POST /api/auth/reset-password`
*   **Autenticação:** Nenhuma
*   **Descrição:** Usa o OTP recebido no e-mail para definir uma nova senha.
*   **Payload (JSON):**
    ```json
    {
      "email": "usuario@exemplo.com",
      "otpCode": "123456",
      "newPassword": "NovaSenhaSegura123" // Mínimo 8 caracteres
    }
    ```
*   **Retorno (200 OK):** Mensagem de sucesso.

### Perfil do Usuário
*   **Obter Perfil (GET /api/users/me):** Requer Autenticação. Retorna os dados completos (`id`, `name`, `email`, `isVerified`, `role`, etc.).
*   **Atualizar Perfil (PUT /api/users/me):** Requer Autenticação. Espera `{ "name": "Novo Nome" }`.

---

## 3. Profile Service (Perfis de Formatação)

Este serviço é responsável por gerenciar e fornecer os perfis (regras) de formatação, como ABNT.
*   **Rotas Mapeadas no Gateway:** `/api/v1/profiles/**`
*   **Autenticação:** Requer cabeçalho `Authorization: Bearer <token>`.

### Criar Perfil de Formatação
*   **Endpoint:** `POST /api/v1/profiles`
*   **Autenticação:** Obrigatória (Bearer Token)
*   **Payload (JSON):**
    ```json
    {
      "id": "abnt-unip-profile",
      "name": "ABNT Padrão UNIP",
      "description": "Formatação da ABNT para trabalhos da UNIP",
      "isPublic": true,
      "ownerId": "UUID-Opcional",
      "profileData": "{ ... JSON completo do perfil (em string) ... }"
    }
    ```
*   **Retorno (201 Created):** Vazio.

### 3.1. Estrutura Detalhada do `profileData` (Configurações do Perfil para o Motor)

O campo `profileData` (string JSON) é a verdadeira "alma" da formatação. O frontend que for construir a interface de edição de perfis (Profile Builder) deverá espelhar **toda** a complexidade abaixo para que os perfis gerados sejam 100% válidos no motor.

> **Importante:** Qualquer propriedade descrita como *obrigatória* que for omitida no payload gerará erro `400 Bad Request` no momento em que o usuário mandar formatar um trabalho (em tempo de renderização). O motor faz validação estrita.

#### 3.1.1. Estrutura Raiz
```json
{
  "id": "abnt-unip",
  "displayName": "ABNT Padrão UNIP",
  "componentOrder": ["cover", "titlePage", "bodyContent", "references"],
  "pageRule": { ... },
  "pageNumbering": { ... },
  "postProcessing": { ... },
  "styleRules": [ ... ],
  "componentRules": { ... }
}
```

#### 3.1.2. `pageRule` (Obrigatório)
Define as dimensões físicas da folha e margens globais do documento.
*   `widthCm` e `heightCm` (`double > 0`)
*   `marginTopCm`, `marginRightCm`, `marginBottomCm`, `marginLeftCm` (`double >= 0`)
*   `orientation` (string explícita: `"PORTRAIT"` ou `"LANDSCAPE"`)

#### 3.1.3. `pageNumbering` (Opcional - Numeração ABNT)
Responsável pelas regras complexas de "conta a partir da folha X, mostra o número a partir da folha Y".
*   `enabled`: `boolean`
*   `countFromComponentId`: `string` (Ex: `"titlePage"`). **Atenção:** O ID escolhido *deve* existir em `componentOrder`.
*   `visibleFromComponentId`: `string` (Ex: `"bodyContent"`).
*   `styleId`: `string` (Aponta para um `id` existente dentro de `styleRules`).
*   `placement`: string (`"HEADER_RIGHT" | "HEADER_CENTER" | "FOOTER_RIGHT" | "FOOTER_CENTER"`)
*   `verticalDistanceFromPageEdgeCm` / `horizontalDistanceFromPageEdgeCm`: `double >= 0`

#### 3.1.4. `postProcessing` (Opcional - Motor LibreOffice)
Aciona flags que dizem ao motor de renderização para aplicar heurísticas após gerar o DOCX base.
*   `tableContinuationLabels`: Injeta rótulos (ex: "continua") em tabelas longas. O frontend precisa fornecer: `continuesLabel`, `continuationLabel`, `conclusionLabel` e `labelStyleId`.
*   `orphanTitleCorrection`: `{"enabled": true}` instrui o motor a empurrar títulos que ficaram sozinhos no fim da folha para a folha seguinte.
*   `integrityCheck`: Requer `checkMarginOverflow` (boolean) e `checkFontSubstitution` (boolean). Falhas nisso não quebram o arquivo, mas o backend devolve alertas no header HTTP `X-Formatter-Warnings`.

#### 3.1.5. `styleRules` (Array Obrigatório)
Onde se concentram as variações de tipografia. Em vez de hardcodar estilos em cada componente, o frontend os centraliza aqui.
```json
{
  "id": "bodyContent.paragraph",
  "type": "PARAGRAPH", // ou "HEADING_1" a "HEADING_6", "CHARACTER"
  "fontFamily": "Times New Roman",
  "fontSizePt": 12.0,
  "alignment": "JUSTIFIED", // "LEFT" | "RIGHT" | "CENTER"
  "lineSpacing": 1.5,
  "firstLineIndentCm": 1.25,
  "leftIndentCm": 0.0,
  "rightIndentCm": 0.0,
  "spacingBeforePt": 0.0,
  "spacingAfterPt": 0.0,
  "bold": false,
  "italic": false,
  "uppercase": false
}
```

#### 3.1.6. `componentRules` (O Coração do Layout - Obrigatório)
Um mapa onde as chaves são os IDs que estão em `componentOrder` (ex: `cover`, `bodyContent`, `references`) e os valores são as regras de negócio altamente específicas.

##### A. Componentes de Página Única (Ex: `cover`, `titlePage`)
Usam o contrato interno de `SinglePageComponentRule`. Exigem um mapeamento de **slots** e um **sistema de layout elástico (gapRules)**.
1.  **`slots`**: O frontend mapeia que dados o componente aguarda (`TEXT`, `TEXT_LIST`, `COMPOSED_TEXT`, `SIGNATURE_BLOCK_LIST`). Cita-se o `COMPOSED_TEXT`, que exige campos como `template` para montar textos interpolados (ex: `"Monografia aprovada em {date}"`).
2.  **`layoutRule`**: Controla como espalhar o texto verticalmente pela capa inteira.
    *   **`groups`**: Uma lista de blocos. Cada bloco tem `id`, `required` (boolean) e `items`. Cada `item` aponta para o ID de um slot e define a estratégia de tela (`"FULL_CONTENT_WIDTH"`).
    *   **`gapRules`**: É aqui que o frontend diz qual o peso (espaçamento dinâmico) entre os blocos. Ex: `{"fromGroupId": "institution", "toGroupId": "titleBlock", "weight": 30.0}`.
    *   **`policy`**: Parâmetros vitais de renderização como `anchorStrategy` (`"LAST_GROUP_AT_SAFE_AREA_END"`).

##### B. Componente: `bodyContent` (O Corpo do Texto)
Define como títulos, citações, imagens e tabelas se comportam. É imenso e subdividido:
1.  **`styleMapping`**: O frontend diz quais estilos de `styleRules` usar. Requer `sectionTitleStyleIdsByLevel` (array obrigatório ligando estilos a H1, H2, H3), `paragraphStyleId`, `directShortQuoteStyleId`, etc.
2.  **`numbering`**: Configuração automática de capítulos (`{"enabled": true, "separator": ".", "primarySuffix": " "}`).
3.  **`layout`**: Regras exatas de quebra. Ex: `pageBreakBeforePrimarySection` garante que capítulos iniciem em nova página. Exige também os controles `blankLinesAfterSectionTitle`.
4.  **Comportamento de Objetos (`figure`, `table`, `chart`, `codeListing`)**:
    O frontend deve fornecer configurações estritas para **legenda** e **fonte**. Exemplo exigido no payload para `figure`:
    *   `captionStyleId` / `sourceStyleId`
    *   `captionTemplate` (Obrigatório possuir a sintaxe `{number}` e `{caption}`)
    *   `imageAlignment` (`"LEFT" | "CENTER" | "RIGHT"`)
    *   `maxWidthCm` / `maxHeightCm`
    *   `numberingStrategy` (`"GLOBAL_SEQUENTIAL"` ou `"BY_CHAPTER"`)
5.  **`citationFormatting`**: Lógica de citações (ex: `pagePrefix`: `"p."`, `multiAuthorJoiner`: `"; "`, `etAl`: `" et al."`).

##### C. Componente: `references` (Bibliografias)
Gerencia a complexidade de transformar dados em entradas bibliográficas perfeitas ABNT/APA.
1.  **`authorFormat`**: Exige configuração como `etAlThreshold` (número a partir do qual autores viram 'et al.'), `surnameUppercase` (boolean), etc.
2.  **`entryFormats`**: O front precisa mapear a formatação por **tipo de referência** (Ex: Livro, Artigo Web).
    O array monta a string sequencialmente com prefixos e sufixos:
    ```json
    "BOOK": [
      {"source": "authors", "bold": false, "prefix": "", "suffix": ". ", "optional": false},
      {"source": "title", "bold": true, "prefix": "", "suffix": ". ", "optional": false},
      {"source": "city", "bold": false, "prefix": "", "suffix": ": ", "optional": false},
      {"source": "publisher", "bold": false, "prefix": "", "suffix": ", ", "optional": false},
      {"source": "year", "bold": false, "prefix": "", "suffix": ".", "optional": false}
    ]
    ```

> **Nota de UX para a Equipe de Frontend:** Dado o volume extremo de complexidade e regras de negócio exigidas pelo `profileData`, **NÃO** exiba um simples campo de texto para edição JSON bruto. O *Profile Builder* deve ser compartimentado em abas (ex: "Dimensões", "Tipografia Global", "Página de Rosto (Arraste e Solte blocos)", "Estilos de Citação", "Regras de Referência Bibliográfica"). É o frontend o responsável por validar se o formulário do usuário gerou um JSON rigoroso com todos esses nós requeridos antes de submeter ao serviço via POST.

### Obter Dados do Perfil
*   **Endpoint:** `GET /api/v1/profiles/{profileId}`
*   **Autenticação:** Obrigatória (Bearer Token)
*   **Retorno (200 OK):** Retorna diretamente o JSON com as configurações do perfil solicitado (`application/json`).

### Preferências do Usuário (Default Profile)
*   **Endpoint:** `PUT /api/v1/preferences/default-profile`
*   **Autenticação:** Obrigatória (Bearer Token)
*   **Payload (JSON):**
    ```json
    {
      "defaultProfileId": "abnt-unip-profile"
    }
    ```
*   **Retorno (204 No Content):** Vazio.

---

## 4. Work Service (Gestão de Trabalhos)

Este serviço recebe os dados do trabalho acadêmico (conteúdo, opções selecionadas, etc.), orquestra o processo de salvamento (no MongoDB) e enviará para formatação (via fila ou Formatter Service).

*   **Rotas Mapeadas no Gateway:** `/api/v1/works/**`
*   **Autenticação:** Requer cabeçalho `Authorization: Bearer <token>`.

### Submeter Trabalho para Formatação/Salvar
*   **Endpoint:** `POST /api/v1/works/submit`
*   **Autenticação:** Obrigatória (Bearer Token)
*   **Payload (JSON):**
    ```json
    {
      "fileName": "meu-tcc",
      "profileId": "abnt-unip-profile",
      "options": {
        "selectedComponents": ["cover", "titlePage", "bodyContent"]
      },
      "document": {
        "cover": {
          "institutionalLines": ["UNIVERSIDADE FICTÍCIA", "CURSO DE ADS"],
          "authors": ["Meu Nome"],
          "title": "TÍTULO DO TRABALHO",
          "city": "São Paulo",
          "year": "2026"
        },
        "titlePage": {
          "authors": ["Meu Nome"],
          "title": "Título",
          "nature": {
             "workType": "TCC",
             "degreeObjective": "obtenção do título de tecnólogo",
             "courseName": "ADS",
             "institutionName": "Universidade Fictícia"
          },
          "advisor": {
             "academicTitle": "Prof. Dr.",
             "name": "Nome do Orientador"
          },
          "city": "São Paulo",
          "year": "2026"
        },
        "bodyContent": {
          "sections": [
            {
              "id": "introducao",
              "level": 1,
              "title": "Introdução",
              "blocks": [
                {
                  "type": "PARAGRAPH",
                  "content": [
                    { "type": "TEXT", "text": "Este é um texto de exemplo." }
                  ]
                }
              ]
            }
          ]
        }
      }
    }
    ```
*   **Retorno (202 Accepted):** Vazio.

> **Importante:** A estrutura do objeto `document` varia amplamente dependendo das opções selecionadas e ainda está sujeita a mudanças de contrato por parte do motor de formatação (conforme descrito na documentação interna `ecosystem-contract.md`). Alguns componentes como `cover`, `titlePage` e `bodyContent` já possuem formatos estabilizados.

---

## 5. Tratamento de Erros

O backend padroniza os erros seguindo a **RFC 7807** (Problem Details for HTTP APIs). Quando ocorrer um erro de validação (como campos obrigatórios ausentes) ou regra de negócio, o frontend receberá uma resposta estruturada.
*   `400 Bad Request` para erros de validação (ex: e-mail inválido, senhas curtas).
*   `401 Unauthorized` se o token JWT estiver ausente, expirado ou for inválido.
*   `429 Too Many Requests` se o frontend estourar o Rate Limit configurado no gateway.
*   `500 Internal Server Error` (nunca exporá stacktraces completos na API pública, manterá um formato JSON limpo).
