# ClimbeSoftRad - Novo frontend

A aplicação agora usa o template de `novo-front/main-files`, com os três portais integrados à API do Render. Veja [a documentação da migração](../docs/novo-frontend.md) para estrutura, rotas e validação.


## Publicação na Vercel

O repositório `https://github.com/Gustavomaz11/front-climbesoftrad` será conectado a três projetos distintos. Todos usam `npm run build:vercel` e diretório de saída `dist`. A variável `PORTAL_KIND` seleciona `sourad` (ClimbeSoftRad), `hospital` (Hospital) ou `configuracoes` (Gestão). O build recusa um valor ausente ou inválido para evitar publicar a área errada.

Em cada projeto, configure `VITE_API_URL=/api/v1`, `VITE_OAUTH_CLIENT_ID=crm-web`, `VITE_CONFIGURACOES_URL` com a URL pública da Gestão e `VITE_SOURAD_URL` com a URL pública do ClimbeSoftRad. Essas variáveis são públicas; nenhuma chave da API deve entrar no frontend.

`vercel.json` encaminha `/api/*` para a API no Render e aplica o fallback da aplicação para rotas como `/dashboard` e `/settings/units/list`. Respostas da API não são armazenadas no CDN. O cookie de sessão permanece Secure/HttpOnly e pertence ao domínio do portal. Cadastre as três origens HTTPS exatas em `FRONTEND_ORIGIN` na API; não use uma permissão genérica para todos os projetos Vercel. Cada domínio mantém sua própria sessão.

Existem três aplicações independentes:

| Área | Função | Desenvolvimento | Build |
| --- | --- | --- | --- |
| ClimbeSoftRad | Recebimento de DICOM e elaboração de laudos | `npm run dev:sourad` — http://localhost:5173 | `npm run build:sourad` → `dist-sourad` |
| Gestão | Cadastro de médicos, unidades, modalidades e configurações | `npm run dev:configuracoes` — http://localhost:5175 | `npm run build:configuracoes` → `dist-configuracoes` |
| Hospital | Conferência e envio de exames para o ClimbeSoftRad | `npm run dev:hospital` — http://localhost:5174 | `npm run build:hospital` → `dist-hospital` |

Os nomes das áreas são definidos em `src/config/portal-brand.ts`. O build hospitalar utiliza `src/hospital/HospitalApp.tsx` e não inclui as rotas do laudário. [Fluxo de envio, configuração e permissões](../docs/portais-hospital-sourad.md).

Tela de autenticação do CRM hospitalar, construída com React, TypeScript, Tailwind CSS, React Hook Form e Zod.

## Executar localmente

```bash
npm install
copy .env.example .env.local
npm run dev
```

Defina `VITE_API_URL` com a URL versionada da API, por exemplo `http://localhost:3000/api/v1`, e `VITE_OAUTH_CLIENT_ID=crm-web`.

## Contrato de autenticação

O formulário gera `state` e `code_verifier` com Web Crypto e envia o challenge PKCE S256 no `POST /auth/login`. Em seguida, troca o authorization code e o verifier no `POST /auth/token`. O access token JWT é mantido somente em memória; o refresh token opaco é recebido exclusivamente como cookie `HttpOnly`, com `credentials: "include"`.

A aplicação não persiste senha, verifier ou tokens no armazenamento do navegador. Ao recarregar a página, tenta restaurar a sessão pela rotação do refresh token. O cliente HTTP trata `401` com um único refresh compartilhado entre requisições simultâneas e repete cada requisição no máximo uma vez.

As rotas protegidas aguardam essa restauração antes de decidir entre `/dashboard` e `/login`, evitando piscar a tela de autenticação.

## Verificações

```bash
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

## Componentes de interface

Os componentes-base ficam em `src/components/ui`. Use imports diretos para manter o bundle analisável:

```tsx
import { Alert } from './components/ui/Alert'
import { Button } from './components/ui/Button'
import { Checkbox } from './components/ui/Checkbox'
import { Input } from './components/ui/Input'
```

- `Button`: variantes `primary`, `secondary`, `success`, `danger`, `warning`, `outline` e `ghost`; tamanhos `sm`, `md`, `lg` e `icon`; suporta loading e ícones.
- `Input`: estados `default`, `success`, `warning` e `error`; suporta label, ajuda, erro, ícones e elemento à direita.
- `Alert`: variantes `info`, `success`, `warning`, `error` e `neutral`; suporta título, ícone e ação para fechar.
- `Checkbox`: tons `primary`, `success`, `danger` e `warning`; suporta descrição e erro acessível.

## Empresas, unidades e acesso

Veja [contratos, migração e validação da frente 1](../docs/empresas-unidades-acesso.md). As permissões são resolvidas por vínculo da empresa e unidade selecionada, e os dados existentes foram identificados como Sourad.

## Tutorial do processo

O botão **Tutorial**, na barra superior das telas autenticadas com empresa selecionada, abre um guia de 18 etapas: configuração inicial, entrada do exame, preparação/elaboração e recursos complementares. Cada etapa apresenta tela, responsável, pré-requisitos, campos, instruções, resultado esperado e orientações para bloqueios. Os limites dos módulos ainda pendentes ficam explícitos.

O guia é carregado sob demanda e permite visão geral, navegação por etapa e Anterior/Próxima. No celular, há um seletor de etapas. Os atalhos respeitam as permissões e abrem as telas em outra aba, preservando a empresa/unidade selecionadas. Consultar o tutorial não altera cadastros nem conclui requisitos. O diálogo usa o Headless UI já instalado para controle de foco e fechamento por Escape.

Conteúdo e componentes ficam em `src/features/tutorial`; as etapas são organizadas nos arquivos `tutorial-setup.steps.ts`, `tutorial-intake.steps.ts`, `tutorial-work.steps.ts` e `tutorial-extra.steps.ts`. Atualize esses arquivos quando o fluxo funcional mudar.
