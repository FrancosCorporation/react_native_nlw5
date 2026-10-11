# Plant Manager — NLW5

Aplicativo de estudo para organizar plantas da casa e receber lembretes locais de rega. O app salva seu nome e suas plantas no aparelho; o catálogo de exemplo é servido por uma API JSON local.

## Requisitos

- Node.js 22.13 ou superior;
- Android Studio/emulador, iOS Simulator ou um aparelho com Expo Go compatível;
- o servidor do catálogo em execução durante o desenvolvimento.

## Instalação

```bash
npm ci
cp .env.example .env
```

Configure `EXPO_PUBLIC_API_URL` em `.env` de acordo com o dispositivo:

| Ambiente | Endereço de desenvolvimento |
| --- | --- |
| iOS Simulator ou navegador | `http://localhost:3333` |
| Emulador Android | `http://10.0.2.2:3333` |
| Aparelho físico | `http://<IP-da-maquina-na-rede>:3333` |

O endereço HTTP só é aceito em desenvolvimento. Builds fora de `__DEV__` exigem uma API HTTPS.

## Catálogo local

Em um terminal, inicie o JSON Server com o catálogo incluído:

```bash
npx --yes json-server@0.17.4 --watch src/services/server.json --host 0.0.0.0 --port 3333
```

A máquina e o aparelho precisam estar na mesma rede quando você usar um dispositivo físico. O backend é apenas um mock para o exercício; não contém autenticação nem deve ser exposto publicamente.

## Iniciar o aplicativo

```bash
npm start
```

Abra o projeto pelo QR code no Expo Go ou pressione `a`/`i` para abrir um emulador disponível. Para a versão web:

```bash
npm run web
```

Use as ferramentas locais para validar a configuração e os tipos:

```bash
npm run doctor
npm run typecheck
```

Os lembretes locais pedem permissão quando você adiciona a primeira planta. A agenda da planta usa a frequência recomendada pelo catálogo e pode ser cancelada ao removê-la.

## O que o app oferece

- cadastro do nome no aparelho;
- catálogo de plantas com filtro por ambiente e paginação;
- instruções de cuidado e escolha de horário para rega;
- lista de plantas salvas, próxima rega e cancelamento dos lembretes;
- navegação por abas e fontes Jost.

## Stack

Expo SDK 57, React Native 0.86, React 19, React Navigation 7, TypeScript 6, AsyncStorage e Expo Notifications.

## Estrutura

```text
App.tsx                     inicialização, fontes e notificações
app.json                    identidade e plugins nativos
src/
├── components/             botões, cabeçalho, cartões e loading
├── libs/storage.ts         persistência e lembretes locais
├── pages/                  boas-vindas, catálogo, cadastro e jardim
├── routes/                 navegação tipada
└── services/               API e catálogo JSON de exemplo
assets/                     ícone, splash e ilustrações
```

## Licença

MIT — veja [LICENSE](LICENSE).
