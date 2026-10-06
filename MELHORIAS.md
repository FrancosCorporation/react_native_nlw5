# MELHORIAS — react_native_nlw5

> **Gerado por análise de código em 2026-10-05** · Stack: Expo SDK 41 (2021) + React 16 + TypeScript — app de plantas (NLW5)
> Branch `main` · API apontando para IP LAN hardcoded · sem testes · sem CI
>
> **Este arquivo é um plano de execução.** Cada item tem ID, `arquivo:linha`, mudança exata, critério de aceite e comando de verificação.

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
| DEVOPS-02 | Sem CI | **P2** | *(ausente)* `.github/workflows/` | — |
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

### DEVOPS-02 · Sem CI · [P2]

- **Arquivo:** *(ausente)* `.github/workflows/`
- **Evidência:** nenhum workflow; `tsconfig` existe mas nada roda `tsc`.
- **Impacto:** erros de tipo e lock quebrado passam.
- **Mudança:** workflow: `npx tsc --noEmit` + `npx expo-doctor` + (após `TEST-01`) `npx jest`.
- **Aceite:** PR com erro de tipo bloqueado.
- **Verificação:**
  ```bash
  npx tsc --noEmit && echo OK
  ```

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
5. **`BUG-01`** · **`TEST-01`** · **`DEVOPS-02`**.
6. **`DOC-01`** · **`IMP-01`** (junto do upgrade).

**Dependências:** `IMP-01` dentro do upgrade (`SEC-02`) · `DOC-01` depois de `SEC-01` (documenta a env nova) · `DEVOPS-02` depois de `TEST-01`.

---

## 9. Fora de escopo / riscos

| Item | Decisão | Motivo |
|---|---|---|
| Upgrade Expo 41→latest de uma vez | **Não de uma vez** | Saltos de SDK acumulam breaking changes — seguir caminho incremental com `expo install --fix` a cada salto. |
| Apontar `baseURL` para produção já | **Não sem TLS** | Exigir `https://` fora de `__DEV__`. |
| Manter tarball do GitHub do RN | **Não** | Sem checksum de registry, sem audit. |
| Reescrever em outro framework (Flutter etc.) | **Não** | Projeto de estudo — escopo é corrigir, não reescrever. |

**Riscos:** upgrade de 6+ SDKs pode quebrar notificações/fontes — ter device físico ou Expo Go compatível para teste; sem dispositivo, congelar (caminho B) é mais honesto que upgrade cego.

---

## 10. Definição de pronto (DoD)

**Segurança**
- [ ] `SEC-01` — zero IP hardcoded; base via env
- [ ] `SEC-02` — decisão executada (upgrade ou freeze documentado; sem tarball)

**Infra/bugs**
- [ ] `DEVOPS-01` — `npm ci` sem suppressão; sem `expo-cli` global
- [ ] `BUG-01` — sem `console.log` de payload; sem código morto

**Qualidade/doc**
- [ ] `TEST-01` — ≥ 1 teste
- [ ] `DEVOPS-02` — CI com `tsc --noEmit`
- [ ] `DOC-01` — README + `.env.example`
- [ ] `IMP-01` — sem `expo-app-loading`

**Validação final:**
```bash
grep -rn '192.168\.' src/ || echo OK
npx tsc --noEmit && echo types-OK
npx jest 2>&1 | tail -3
```

---

*Fim do plano. Gerado por leitura direta do código em 2026-10-05. Nenhum item já estava corrigido — todos apontam para defeitos ainda presentes.*
