# Graph Music · Recomendações com Neo4j AuraDB

Aplicação Angular (sem backend) que conecta direto ao **Neo4j AuraDB** para mostrar, para cada ouvinte, as músicas que ele já ouviu e as recomendações do sistema.

## Pré-requisitos

- Node.js 20+ (testado com 24)
- Uma instância AuraDB Free com as credenciais em `../.env` (use `../.env.example` como modelo):

```dotenv
NEO4J_URI=neo4j+s://<id>.databases.neo4j.io
NEO4J_USERNAME=<usuário>
NEO4J_PASSWORD=<senha>
NEO4J_DATABASE=<database>
```

## Como rodar

```bash
npm install
npm start       # http://localhost:4200
```

Ao abrir, o app verifica se o AuraDB tem dados. **Se a instância estiver vazia, ele importa
automaticamente os CSVs de `../resources/datasets`** (exibindo "importando dados iniciais…") e já
abre com o primeiro usuário selecionado. A importação roda em uma única transação e usa `MERGE`,
então é segura mesmo se duas abas abrirem ao mesmo tempo.

| Script          | O que faz                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `npm start`     | Roda `setup` e sobe o servidor de desenvolvimento.                                                 |
| `npm run setup` | Gera `src/environments/neo4j.env.ts` a partir do `.env` e copia os CSVs para `public/datasets`.     |
| `npm run seed`  | **Recria** o grafo pelo terminal: apaga todos os nós e reimporta os CSVs.                          |
| `npm test`      | Testes unitários (Vitest).                                                                         |

O plano de importação (constraints + Cypher de cada CSV) fica em um único arquivo,
[`data/seed/seed-plan.ts`](src/app/data/seed/seed-plan.ts), usado tanto pelo navegador quanto pelo `npm run seed`.

> ⚠️ **Sem backend, as credenciais do AuraDB vão no JavaScript entregue ao navegador.**
> Use apenas localmente/para estudo. O arquivo gerado está no `.gitignore`.

## Arquitetura

```
src/app
├── core/neo4j/          Driver Neo4j (conexão única, leitura) e token de configuração
├── data/
│   ├── queries/         Consultas Cypher em arquivos .cypher (importados como texto)
│   ├── repositories/    Executam as consultas e devolvem linhas tipadas
│   └── seed/            Plano de importação dos CSVs e importação automática de banco vazio
├── domain/              Modelos, definição dos algoritmos e regras (união das recomendações)
├── features/            Componentes de UI (página, cards de algoritmo, música e seletor de usuário)
└── shared/              Utilitários de apresentação (realce de Cypher, duração, bandeiras)
```

O fluxo é sempre `features → domain → data → core`. As consultas ficam isoladas em
[`data/queries`](src/app/data/queries) — o mesmo texto que é executado é exibido nos cards.

## Modelo do grafo

```
(:User)-[:LISTENED_TO {timesListened, liked, listenDate}]->(:Track)
(:Artist)-[:PRODUCES]->(:Track)      (:Artist)-[:FEATURED_IN]->(:Track)
(:Track)-[:BELONGS_TO]->(:Genre)
(:User|Artist)-[:BORN_IN]->(:Nationality)
```

## Algoritmos de recomendação

As recomendações são a **união** dos algoritmos **ativos**. Todas as consultas rodam em paralelo uma
vez por usuário; o interruptor de cada card liga/desliga o algoritmo e a lista é recalculada na hora
(sem nova consulta), em [`domain/recommendation-union.ts`](src/app/domain/recommendation-union.ts).
Músicas que o usuário já ouviu são sempre excluídas; músicas sugeridas por mais de um algoritmo aparecem primeiro.

| Algoritmo              | Consulta                                                                       | Regra                                                         |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Da sua geração         | [`recommend-same-age.cypher`](src/app/data/queries/recommend-same-age.cypher)       | Ouvidas por usuários com até ±5 anos de diferença (top 5).    |
| Dos seus artistas      | [`recommend-from-artists.cypher`](src/app/data/queries/recommend-from-artists.cypher) | Outras músicas e parcerias dos artistas que o usuário ouve.   |
| Top 3 da plataforma    | [`recommend-top-tracks.cypher`](src/app/data/queries/recommend-top-tracks.cypher)   | As 3 mais tocadas (soma de `timesListened`) ainda não ouvidas. |
| Gêneros que você curte | [`recommend-liked-genres.cypher`](src/app/data/queries/recommend-liked-genres.cypher) | Músicas dos 3 gêneros com mais likes do usuário (top 5).      |

Clicar em um card de algoritmo destaca, no painel de recomendações, as músicas que vieram dele.
