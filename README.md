# react_native_nlw5

**Projeto de estudo** — app mobile de gerenciamento de plantas ("Plant Manager") construído com React Native + Expo durante a Next Level Week 5 da Rocketseat, em maio de 2021.

![TypeScript](https://img.shields.io/badge/TypeScript-4-3178C6?style=flat&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-Expo%20SDK%2041-61DAFB?style=flat&logo=expo&logoColor=black)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)
![Status](https://img.shields.io/badge/status-projeto%20de%20estudo-blue)

## Sobre

Implementação de estudo do app da NLW 5 (trilha React Native): o usuário se identifica, escolhe plantas por ambiente, agenda lembretes de rega e acompanha suas plantas salvas no dispositivo. Serve como exercício de navegação em pilha/abas, consumo de API REST, persistência local e notificações no Expo.

## Funcionalidades

Comprovadas pelo código:

- **Welcome**: saudação e navegação para a identificação do usuário (`src/pages/Welcome.tsx`);
- **Identificação**: nome salvo no `AsyncStorage` com validação de campo vazio (`src/pages/UserIdentification.tsx`);
- **Confirmação**: tela reutilizável que lê o nome salvo e recebe título/subtítulo/ícone por parâmetros de rota (`src/pages/Confirmation.tsx`);
- **Seleção de plantas**: lista paginada de plantas consumida de API (`axios`), filtro por ambiente (sala, quarto, cozinha, banheiro) e busca de mais itens ao rolar (`src/pages/PlantSelect.tsx`);
- **Cadastro de planta**: seleção de data/hora com `@react-native-community/datetimepicker`, bloqueio de datas passadas e salvamento no `AsyncStorage` (`src/pages/PlantSave.tsx`);
- **Minhas plantas**: próximos lembretes formatados com `date-fns` (pt-BR), remoção com confirmação e animação de loading com Lottie (`src/pages/MyPlants.tsx`, `src/components/Load.tsx`);
- **Notificações locais agendadas** com `expo-notifications` conforme a frequência de rega da planta (`src/libs/storage.ts`);
- Navegação em stack + abas inferiores (`src/routes/stack.routes.tsx`, `src/routes/tab.routes.tsx`).

## Stack

- **TypeScript** + **React Native** com **Expo SDK 41**
- **React Navigation** 5 (stack e bottom-tabs)
- **Axios** para a API de plantas (JSON Server)
- **AsyncStorage** para persistência local
- **date-fns** para datas e intervalos
- **expo-notifications**, **lottie-react-native**, **react-native-svg**, fontes Jost (`@expo-google-fonts/jost`)

## Como rodar

Requer ambiente Expo configurado (`yarn install` na raiz).

1. Instale as dependências e o JSON Server que serve os dados de exemplo:

```bash
yarn install
npm install -g json-server
```

2. Suba a API local (use o IP da sua máquina na rede):

```bash
json-server src/services/server.json --host SEU_IP_LOCAL --port 3333
```

3. Ajuste `baseURL` em `src/services/api.ts` — atualmente aponta para `http://192.168.0.130:3333` (IP do ambiente de desenvolvimento original). **Requer configuração de ambiente.**

4. Inicie o app:

```bash
yarn start        # expo start
yarn android      # abre no Android
yarn ios          # abre no iOS
yarn web          # abre no navegador
```

Observação: `app.json` traz o plugin do `expo-notifications` com caminhos de exemplo (`./local/path/to/...`) para ícone e som — é preciso apontar para arquivos reais antes de usar notificações em produção.

## Estrutura do projeto

```
.
├── App.tsx                    # carrega fontes e listeners de notificação
├── assets/                    # ícone, splash e imagens estáticas
├── src/
│   ├── assets/                # imagens e animação Lottie
│   ├── components/            # Button, Header, Load, cards de planta
│   ├── libs/storage.ts        # persistência + agendamento de notificações
│   ├── pages/                 # Welcome, UserIdentification, PlantSelect...
│   ├── routes/                # stack e abas
│   ├── services/              # axios + server.json (mock)
│   └── styles/                # cores e fontes
├── app.json
└── package.json
```

Outros arquivos de apoio do estudo: `exemplo.tsx` (rascunho de notificações) e `server.json` na raiz (cópia do mock).

## Licença

MIT — veja [LICENSE](LICENSE).
