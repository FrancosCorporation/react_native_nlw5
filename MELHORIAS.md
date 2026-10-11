# MELHORIAS — react_native_nlw5

> **Diagnóstico inicial de 2026-10-05** · Stack à época: Expo SDK 41 (2021) + React 16 + TypeScript — app de plantas (NLW5)
> Branch atual `main` · Expo SDK 57 · TEST-01 continua pendente
>
> **Este arquivo é um plano de execução.** Cada item tem ID, `arquivo:linha`, mudança exata, critério de aceite e comando de verificação.

## Registro de implementação — 2026-10-11

- Migrado do Expo SDK 41 para SDK 57, React Native 0.86 e React 19; removidos o tarball do RN e as ferramentas antigas de CLI.
- Corrigidos URL configurável da API, configuração de permissões, inicialização/splash, notificações, navegação e estados de erro/vazio/paginação das telas.
- Atualizados Docker, README, `.env.example` e workflow de CI.
- `npm run typecheck`, `npm run doctor` (21/21), `npx expo install --check`, exportação web e Docker build passaram. Não foi feita validação em dispositivo iOS/Android.
- A auditoria npm ainda reporta 27 vulnerabilidades transitivas (19 altas, 8 moderadas); `npm audit fix --force` propõe downgrade para Expo 44, portanto não foi aplicado. `npm audit --omit=dev --audit-level=critical` passa sem alertas críticos.
- `TEST-01` continua pendente. Workflow `7220761c2973ad8be029a326e7b6a7d72645f20f` está publicado e a execução remota passou; a CI ainda não roda testes.
- **DEVOPS-03 em andamento:** CI atualizada para actions v7 (runtime Node 24) e runner `ubuntu-24.04`; aguarda execução remota.

---

## 0. Como usar este documento

1. Execute na ordem **P0 → P1 → P2 → P3**, respeitando as ondas da §8.
2. Ao terminar um item: marque `- [x]`, rode o **Verificação**, comite `fix(<ID>): descrição`.
3. **Projeto de estudo NLW5** — a decisão de upgrade do Expo (§9) vem antes de refinar detalhes.
4. **Idioma:** português.

---

## 1. Diagnóstico executivo

App mobile (Expo) de plantas: rotas stack/tabs, notificações locais (`expo-notifications`), fontes Jost, axios para backend Node na porta 3333.

**O que está bem (não regredir):**

| Item | Evidência |
|---|---|
| TypeScript nas rotas/serviços | `src/routes/*.tsx`, `src/services/api.ts` |
| Estrutura organizada (routes/libs/pages/services) | `src/` |
| Notificação com listener e `remove()` no cleanup | `App.tsx:15-21` |
| `.gitignore`/`.dockerignore` | raiz |

**O que está quebrado:**

1. **`baseURL` hardcoded:** `http://192.168.0.130:3333` (`src/services/api.ts:4`) — IP da LAN do autor, **HTTP claro**; para qualquer outro humano o app não conecta, e em rede pública o tráfego é interceptável.
2. **Expo SDK 41 + React 16 (2021, EOL)** — sem correções de segurança/compatibilidade; `react-native` referenciado por **tarball do GitHub** (`sdk-41.0.0.tar.gz`) em vez de npm.
3. **Dockerfile esconde erro:** `RUN npm ci 2>/dev/null || npm install --legacy-peer-deps` — o `2>/dev/null` **apaga o diagnóstico** do `npm ci` e o fallback instala outra árvore.
4. Zero testes; `console.log(data)` de payload de notificação em produção (`App.tsx:19`); código morto comentado (`App.tsx:23-31`).

---

## 2. Tabela de prioridades

| ID | Título | Sev | Arquivo | Depende de |
|---|---|---|---|---|
| SEC-01 | baseURL HTTP + IP LAN hardcoded | **P1** | `src/services/api.ts:4` | — |
| DEVOPS-01 | `npm ci 2>/dev/null || npm install --legacy-peer-deps` | **P1** | `Dockerfile` | — |
| SEC-02 | Expo 41 / RN por tarball — stack EOL | **P1** | `package.json` | — |
| TEST-01 | Zero testes | **P2** | *(ausente)* | — |
| BUG-01 | `console.log` de payload + código morto em App.tsx | **P2** | `App.tsx:19,23-31` | — |
| DEVOPS-02 | CI sem etapa de testes | **P2** | `.github/workflows/ci.yml` | TEST-01 |
| DEVOPS-03 | Runtime Node 20 nas actions e runner `ubuntu-latest` variável | **P2** | `.github/workflows/ci.yml` | — |
| DOC-01 | README — IP/backend/setup | **P2** | `README.md` | SEC-01 |
| IMP-01 | expo-app-loading deprecado | **P3** | `App.tsx:3` | SEC-02 |

---

## 3. Segurança

### SEC-01 · `baseURL` HTTP + IP da LAN hardcoded · [P1]

- **Arquivo:** `src/services/api.ts:4`
- **Evidência:**
  ```typescript
  export const api = axios.create({
      baseURL:'http://192.168.0.130:3333'
  })
  ```
  IP fixo do autor, esquema `http://` (sem TLS).
- **Impacto:** (a) app **só funciona** na LAN de quem tem esse IP; (b) em qualquer rede não confiável, req/res (dados de plantas/usuário) em claro — interceptável com spoof de ARP/DNS; (c) aponta para backend que pode não existir mais (porta 3333 do projeto par).
- **Mudança:** `baseURL` via `process.env.EXPO_PUBLIC_API_URL` (padrão Expo ≥49) ou `app.config.ts` + `.env.example` documentando `http://<IP-da-máquina>:3333` para dev local; `https://` obrigatório fora de dev (`__DEV__` gate).
- **Aceite:** zero IPs hardcoded no `grep`; app conecta mudando só o `.env`.
- **Verificação:**
  ```bash
  grep -rn '192.168\.' src/ || echo OK
  grep -n 'EXPO_PUBLIC_API_URL' src/services/api.ts
  ```

### SEC-02 · Expo SDK 41 / React 16 / RN por tarball (stack EOL) · [P1]

- **Arquivo:** `package.json`
- **Evidência:** `"expo": "~41.0.1"` (2021), `"react": "16.13.1"`, `"react-native": "https://github.com/expo/react-native/archive/sdk-41.0.0.tar.gz"` (build não reprodutível — tarball fora de registry com checksum).
- **Impacto:** anos de advisories sem patch (Expo/RN); tarball = sem audit/lock confiável; `expo-cli` global no Dockerfile também deprecado.
- **Mudança:** decisão da §9: upgrade para SDK moderno (`npx expo install --fix`) seguindo o changelog 41→latest, **ou** congelar com aviso no README. Em qualquer caso: trocar tarball por versão de registry.
- **Aceite:** (caminho A) `npx expo-doctor` limpo; (caminho B) README avisa EOL.
- **Verificação:**
  ```bash
  grep -n 'sdk-41.0.0.tar.gz' package.json || echo "sem tarball"
  npx expo-doctor 2>&1 | tail -5
  ```

### SEC-03 · Permissões nativas não utilizadas · [P2]

- **Arquivo:** `app.json`
- **Mudança:** removidas permissões de câmera/localização e modos de background sem uso no aplicativo.
- **Aceite:** configuração nativa não solicita acesso que o fluxo do app não utiliza.
- **Verificação:** `npx expo-doctor`.

---

## 4. Bugs e defeitos funcionais

### BUG-01 · `console.log` de payload e código morto em `App.tsx` · [P2]

- **Arquivo:** `App.tsx:19` (dentro do listener de notificação), `App.tsx:23-31` (bloco `notifications()` inteiro comentado)
- **Evidência:** `console.log(data)` imprime o conteúdo da notificação (dados da planta) em qualquer build; linhas 23-31 são `/* ... */` com `cancelAllScheduledNotificationsAsync` desativado.
- **Impacto:** vazamento de dados em log (Expo/React Native LogBox vai para stdout em builds de teste/TestFlight); comentário confunde manutenção.
- **Mudança:** remover `console.log` (ou guardar em estado de debug `__DEV__`); apagar o bloco morto (git guarda o histórico).
- **Aceite:** `grep -n 'console.log' src/ App.tsx` sem payloads; sem bloco comentado grande.
- **Verificação:**
  ```bash
  grep -n 'console.log(data)\|cancelAllScheduled' App.tsx || echo OK
  ```

---

## 5. Qualidade: testes

### TEST-01 · Zero testes · [P2]

- **Arquivo:** *(ausente)* `*.test.*`
- **Evidência:** `find . -name '*.test.*'` vazio; `package.json` sem script de teste.
- **Impacto:** refator de rotas/storage (`src/libs/storage`) sem rede de segurança.
- **Mudança:** Jest do Expo (`npx jest`) com 1 smoke test de `src/libs/storage` (funções puras) + 1 de render de `App` se viável sem device.
- **Aceite:** `npm test` ≥ 1 teste verde.
- **Verificação:**
  ```bash
  npx jest 2>&1 | tail -3
  ```

---

## 6. DevOps / Infra

### DEVOPS-01 · Dockerfile esconde a falha e usa fallback · [P1]

- **Arquivo:** `Dockerfile`
- **Evidência:** `RUN npm ci 2>/dev/null || npm install --legacy-peer-deps` — stderr suprimido + fallback; `RUN npm i -g expo-cli` (CLI global deprecado — o Expo agora é `npx expo`); `EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0` expõe devtools na rede.
- **Impacto:** lock dessincronizado vira build silencioso; devtools em 0.0.0.0 em rede de produção.
- **Mudança:** `RUN npm ci` (sem `2>/dev/null`, sem fallback); remover `expo-cli` global (usar `npx expo`); devtools bind localhost ou fora do Docker de produção.
- **Aceite:** build falha com lock errado; sem CLI global.
- **Verificação:**
  ```bash
  grep -n '2>/dev/null\|expo-cli\|0.0.0.0' Dockerfile || echo OK
  ```

### DEVOPS-02 · CI sem etapa de testes · [P2]

- **Arquivo:** `.github/workflows/ci.yml`
- **Evidência inicial:** a análise de 2026-10-05 não encontrou workflow. O CI atual executa `npm ci`, Expo Doctor, typecheck, exportação web e auditoria de dependências de produção.
- **Pendente:** adicionar `npx jest` após implementar TEST-01.
- **Aceite atual:** workflow publicado para `main`; execução `7220761c2973ad8be029a326e7b6a7d72645f20f` passou. Erros de tipos e validações do Expo bloqueiam a CI.
- **Verificação:**
  ```bash
  npx tsc --noEmit && echo OK
  ```

### DEVOPS-03 · Atualizar runtime das actions e fixar runner · [P2]

- **Arquivo:** `.github/workflows/ci.yml`
- **Evidência:** o workflow usava `actions/checkout@v4`, `actions/setup-node@v4` e `runs-on: ubuntu-latest`. As duas actions foram atualizadas para `v7`; seus metadados declaram runtime `node24`. O runner foi fixado em `ubuntu-24.04` para evitar migração automática para uma imagem futura.
- **Mudança:** executada; aguarda CI pós-alteração.
- **Aceite:** Expo Doctor, typecheck, export web e auditoria de dependências de produção passam com as versões atuais; sem etapa de testes enquanto TEST-01 estiver pendente.
- **Verificação:** parse do YAML e CI remota após a mudança.

---

## 7. Documentação

### DOC-01 · README sem o setup do backend/IP · [P2]

- **Arquivo:** `README.md`
- **Evidência:** README não explica qual backend roda na :3333 nem como apontar para ele (o `SEC-01` é a prova: IP de um humano específico).
- **Impacto:** impossível subir o app de acordo com o README.
- **Mudança:** seção "Backend": repo par (qual?), porta 3333, `EXPO_PUBLIC_API_URL` no `.env`; `.env.example` novo.
- **Aceite:** terceiro conecta o app a um backend próprio.
- **Verificação:**
  ```bash
  grep -ni '3333\|API_URL\|backend' README.md
  ```

### IMP-01 · `expo-app-loading` deprecado · [P3]

- **Arquivo:** `App.tsx:3`
- **Evidência:** `import AppLoading from 'expo-app-loading'` — pacote deprecado desde SDK 42+ (substituído por `expo-splash-screen`).
- **Impacto:** bloqueio de upgrade (item ligado ao `SEC-02`).
- **Mudança:** migrar para `expo-splash-screen` durante o upgrade do SDK.
- **Aceite:** sem import de `expo-app-loading`.
- **Verificação:**
  ```bash
  grep -rn 'expo-app-loading' src/ App.tsx package.json || echo OK
  ```

---

## 8. Ordem de execução (waves)

### Wave 1 — Decisão (antes de código)
1. **§9:** upgrade do Expo **ou** congelamento documentado.

### Wave 2 — Correções imediatas (P1)
2. **`SEC-01`** — baseURL configurável (não depende do upgrade).
3. **`DEVOPS-01`** — Dockerfile honesto.
4. **`SEC-02`** — execução da decisão 1 (tarball→registry no mínimo).

### Wave 3 — Qualidade (P2)
5. **`BUG-01`** está concluído; **`TEST-01`** continua pendente e **`DEVOPS-02`** já valida typecheck e Expo. Integrar Jest depende de TEST-01.
6. **`DOC-01`** · **`IMP-01`** (junto do upgrade).

**Dependências atuais:** `IMP-01` foi entregue junto com SEC-02; `DOC-01` acompanha SEC-01. Adicionar Jest ao workflow depende de TEST-01.

---

## 9. Fora de escopo / riscos

| Item | Decisão | Motivo |
|---|---|---|
| Upgrade Expo 41→57 | **Executado** | Alinhado com `expo install --fix`; Expo Doctor 21/21, exportação web e Docker build passaram. Falta validar notificações e comportamento nativo em dispositivo iOS/Android. |
| Apontar `baseURL` para produção já | **Não sem TLS** | Exigir `https://` fora de `__DEV__`. |
| Manter tarball do GitHub do RN | **Não** | Sem checksum de registry, sem audit. |
| Reescrever em outro framework (Flutter etc.) | **Não** | Projeto de estudo — escopo é corrigir, não reescrever. |

**Riscos e pendências:** notificações e comportamento nativo precisam de validação em dispositivo iOS/Android. A auditoria encontrou 27 alertas transitivos (19 altos, 8 moderados); a correção forçada do npm propõe Expo 44 e foi recusada para preservar o SDK atual. TEST-01 segue pendente.

---

## 10. Definição de pronto (DoD)

**Segurança**
- [x] `SEC-01` — zero IP hardcoded; base via env
- [x] `SEC-02` — upgrade executado e tarball removido
- [x] `SEC-03` — permissões não utilizadas removidas

**Infra/bugs**
- [x] `DEVOPS-01` — `npm ci` sem suppressão; sem `expo-cli` global
- [x] `BUG-01` — sem `console.log` de payload; sem código morto

**Qualidade/doc**
- [ ] `TEST-01` — ≥ 1 teste
- [x] `DEVOPS-02` — CI com typecheck e validações do Expo
- [ ] `DEVOPS-03` — actions v7/Node 24 e runner Ubuntu 24.04; aguardando CI
- [x] `DOC-01` — README + `.env.example`
- [x] `IMP-01` — sem `expo-app-loading`

**Validação final:**
```bash
grep -rn '192.168\.' src/ || echo OK
npx tsc --noEmit && echo types-OK
npx jest 2>&1 | tail -3
```

---

*Fim do plano. Gerado por leitura direta do código em 2026-10-05. Nenhum item já estava corrigido — todos apontam para defeitos ainda presentes.*
