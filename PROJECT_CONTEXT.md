# PROJECT_CONTEXT.md — TodoCalendar

> Documento de contexto completo para continuação do desenvolvimento por outro desenvolvedor ou IA.
> Gerado em: 2026-04-10

---

## 1. Visão Geral do Projeto

### Objetivo
Sistema de To-Do List integrado a um Calendário, inspirado no Notion. O usuário visualiza um calendário mensal e pode, para cada dia, criar e gerenciar uma lista de tarefas. O sistema indica visualmente (por cores) o desempenho de cada dia com base na porcentagem de tarefas concluídas.

### Problema que resolve
Ferramentas de produtividade comuns separam calendário e lista de tarefas. Este sistema une os dois em uma única interface: cada dia do calendário é também um contêiner de tarefas, com feedback visual imediato sobre o progresso.

---

## 2. Tecnologias Utilizadas

### Backend
| Item | Detalhe |
|---|---|
| Linguagem | Java 21 |
| Framework | Spring Boot 3.2.4 |
| Persistência | Spring Data JPA + Hibernate |
| Banco de dados | PostgreSQL 16 |
| Validação | Jakarta Bean Validation (`@NotBlank`, `@NotNull`) |
| Redução de boilerplate | Lombok (`@Getter`, `@Setter`, `@Builder`, etc.) |
| Build | Maven 3.9 |

### Frontend
| Item | Detalhe |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Estilização | TailwindCSS 3 |
| Gerenciamento de estado/cache | TanStack Query (React Query) v5 |
| Requisições HTTP | Axios 1.6 |
| Manipulação de datas | date-fns 3 (locale pt-BR) |

### Infraestrutura
| Item | Detalhe |
|---|---|
| Orquestração | Docker Compose |
| Servidor de produção (frontend) | Nginx 1.25 Alpine |
| Imagem do backend | eclipse-temurin:21-jre-alpine |
| Imagem do banco | postgres:16-alpine |

---

## 3. Estrutura do Projeto

```
todo-calendar/
├── docker-compose.yml          # Orquestra os 3 serviços
├── .gitignore
├── README.md
├── PROJECT_CONTEXT.md          # Este arquivo
│
├── backend/                    # API REST — Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/todocalendar/
│       │   ├── TodoCalendarApplication.java   # Ponto de entrada
│       │   ├── config/
│       │   │   ├── CorsConfig.java            # Libera CORS para o frontend
│       │   │   └── GlobalExceptionHandler.java # Erros centralizados em JSON
│       │   ├── entity/
│       │   │   └── Task.java                  # Tabela "tasks" no banco
│       │   ├── dto/
│       │   │   ├── TaskRequest.java           # Entrada: criar/atualizar tarefa
│       │   │   ├── TaskResponse.java          # Saída: dados da tarefa
│       │   │   └── DaySummaryResponse.java    # Saída: resumo/cor de um dia
│       │   ├── repository/
│       │   │   └── TaskRepository.java        # Queries JPA (inclui JPQL agregada)
│       │   ├── service/
│       │   │   └── TaskService.java           # Lógica de negócio + cálculo de cor
│       │   └── controller/
│       │       └── TaskController.java        # Endpoints REST
│       └── resources/
│           └── application.properties        # Config do banco e porta
│
└── frontend/                   # SPA React + TypeScript
    ├── Dockerfile
    ├── nginx.conf               # Proxy /api → backend, fallback SPA
    ├── package.json
    ├── vite.config.ts           # Proxy dev /api → localhost:8081
    ├── tailwind.config.js
    └── src/
        ├── main.tsx             # Ponto de entrada + QueryClientProvider
        ├── App.tsx              # Layout principal (sidebar + calendário + painel)
        ├── index.css            # Imports Tailwind + utilitários de cor
        ├── types/
        │   └── index.ts         # Task, DaySummary, MonthSummary
        ├── api/
        │   └── tasks.ts         # Funções Axios (getTasksByDate, createTask, etc.)
        ├── hooks/
        │   └── useTasks.ts      # Hooks React Query (useTasksByDate, useMonthSummary, etc.)
        └── components/
            ├── Sidebar.tsx      # Navegação lateral
            ├── Calendar.tsx     # Grade mensal com cores e navegação entre meses
            ├── TaskPanel.tsx    # Lista de tarefas + barra de progresso + formulário
            └── TaskItem.tsx     # Item individual: checkbox + título + excluir
```

---

## 4. Funcionalidades Implementadas

### Calendário
- Exibe grade mensal com dias da semana (Dom–Sáb)
- Navegação entre meses (botões ‹ ›)
- Cada dia com tarefas exibe a porcentagem e é colorido conforme o desempenho
- Dia selecionado destacado com anel violeta
- Dia de hoje destacado em violeta quando sem tarefas
- Legenda de cores na parte inferior

### Painel de Tarefas (sidebar direita)
- Exibe o dia selecionado por extenso (ex: "quinta-feira, 10 de abril de 2026")
- Contador "X de Y tarefas concluídas"
- Barra de progresso animada com cor dinâmica
- Lista de tarefas do dia ordenada por data de criação

### Tarefas
- Criar tarefa com título (obrigatório) e descrição (opcional)
- Marcar/desmarcar como concluída (checkbox)
- Excluir tarefa (com confirmação inline — clica em excluir, aparece "Excluir | Cancelar")
- Tarefas concluídas ficam com texto riscado e opacidade reduzida
- Formulário de criação inline (abre/fecha sem sair da página)

### Sincronização de cache
- Ao criar, marcar ou excluir uma tarefa, o cache do React Query é invalidado tanto para a lista do dia quanto para o resumo mensal — o calendário atualiza automaticamente a cor do dia sem recarregar a página

---

## 5. API (Backend)

**Base URL:** `http://localhost:8081/api`

### Endpoints

#### `GET /api/tasks?date=YYYY-MM-DD`
Retorna as tarefas de um dia específico, ordenadas por `createdAt`.

**Resposta 200:**
```json
[
  {
    "id": 1,
    "title": "Estudar Spring Boot",
    "description": "Capítulo 3 do livro",
    "date": "2026-04-10",
    "completed": false,
    "createdAt": "2026-04-10T14:30:00",
    "updatedAt": "2026-04-10T14:30:00"
  }
]
```

---

#### `POST /api/tasks`
Cria uma nova tarefa. `completed` sempre começa como `false`.

**Body:**
```json
{
  "title": "Estudar Spring Boot",
  "description": "Opcional",
  "date": "2026-04-10"
}
```

**Resposta 201:** objeto `TaskResponse` completo.

---

#### `PUT /api/tasks/{id}`
Atualiza título, descrição e/ou data de uma tarefa existente.

**Body:** mesmo formato do POST.
**Resposta 200:** objeto `TaskResponse` atualizado.

---

#### `PATCH /api/tasks/{id}/toggle`
Alterna o campo `completed` (true → false, false → true).

**Resposta 200:** objeto `TaskResponse` com o novo estado.

---

#### `DELETE /api/tasks/{id}`
Exclui uma tarefa.

**Resposta 204:** sem corpo.

---

#### `GET /api/tasks/summary?year=2026&month=4`
Retorna o resumo de todos os dias do mês que possuem ao menos uma tarefa.

**Resposta 200:**
```json
{
  "2026-04-10": {
    "date": "2026-04-10",
    "total": 4,
    "completed": 2,
    "percentage": 50.0,
    "color": "YELLOW"
  },
  "2026-04-11": {
    "date": "2026-04-11",
    "total": 3,
    "completed": 3,
    "percentage": 100.0,
    "color": "GREEN"
  }
}
```

### Erros padronizados
Todos os erros retornam JSON:
```json
{ "error": "mensagem descritiva" }
```
| Situação | Status |
|---|---|
| ID não encontrado | 404 |
| Campo obrigatório ausente ou inválido | 400 (com campo `fields`) |
| Erro interno | 500 |

---

## 6. Regras de Negócio

### Cálculo de porcentagem
```
porcentagem = (tarefas_concluídas / total_tarefas) * 100
```
Calculada no backend via JPQL:
```sql
SELECT t.date, COUNT(t), SUM(CASE WHEN t.completed = true THEN 1 ELSE 0 END)
FROM Task t
WHERE t.date BETWEEN :start AND :end
GROUP BY t.date
```

### Sistema de cores
| Condição | Cor retornada | Visual no frontend |
|---|---|---|
| 100% | `GREEN` | Verde (`bg-green-600`) |
| 70% a 99% | `LIGHT_GREEN` | Verde esmeralda (`bg-emerald-500`) |
| 50% a 69% | `YELLOW` | Amarelo (`bg-yellow-500`) |
| 1% a 49% | `RED` | Vermelho (`bg-red-600`) |
| 0 tarefas | `NONE` | Sem cor |

> **Decisão de design:** o estado `LIGHT_GREEN` (70–99%) foi adicionado além do escopo original para evitar que um dia com 99% de conclusão aparecesse em vermelho, o que seria confuso para o usuário.

### Outras regras
- Uma tarefa sempre nasce com `completed = false`
- Tarefas são vinculadas a uma data (`LocalDate`) — sem hora
- A `date` no formato `YYYY-MM-DD` é obrigatória em toda criação/edição
- O backend nunca retorna a entidade diretamente: usa DTOs (`TaskResponse`, `DaySummaryResponse`)

---

## 7. Como Rodar o Projeto

### Pré-requisitos
- Docker Desktop instalado e rodando

### Com Docker (recomendado)

```bash
# Primeira vez (faz o build das imagens)
docker compose up --build

# Próximas vezes (imagens já existem, mais rápido)
docker compose up

# Derrubar todos os containers
docker compose down
```

Acesse: **http://localhost:3001**

### Portas utilizadas (escolhidas para não conflitar)
| Serviço | Porta no host | Porta no container |
|---|---|---|
| PostgreSQL | 5433 | 5432 |
| Spring Boot API | 8081 | 8081 |
| Frontend (Nginx) | 3001 | 80 |

### Sem Docker (desenvolvimento local)

**Pré-requisitos:**
- Java 21+
- Maven 3.9+
- Node.js 20+
- PostgreSQL rodando na porta **5433** com banco `todocalendar`, usuário `postgres`, senha `postgres`

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
# API disponível em http://localhost:8081
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# App disponível em http://localhost:5173
```

> Em modo de desenvolvimento, o Vite redireciona automaticamente `/api/*` para `http://localhost:8081` via proxy configurado em `vite.config.ts`. Não há problema de CORS.

---

## 8. Estado Atual do Projeto

### Pronto e funcionando
- [x] API REST completa com CRUD de tarefas
- [x] Endpoint de resumo mensal com cálculo de porcentagem e cor
- [x] Tratamento global de erros com respostas JSON padronizadas
- [x] Configuração de CORS para dev e produção
- [x] Calendário mensal interativo com navegação entre meses
- [x] Cores dinâmicas por dia baseadas na porcentagem de conclusão
- [x] Painel de tarefas com barra de progresso animada
- [x] Criar, marcar como concluída e excluir tarefas
- [x] Sincronização automática de cache (React Query)
- [x] Layout escuro inspirado no Notion
- [x] Docker Compose com 3 serviços orquestrados
- [x] Dados persistidos em volume Docker (banco não perde dados ao derrubar containers)

### Ainda não implementado
- [ ] Edição inline de tarefas (título/descrição)
- [ ] Autenticação de usuários (multi-usuário)
- [ ] Drag & drop de tarefas entre dias
- [ ] Filtros por status (mostrar só pendentes, só concluídas)
- [ ] Subtarefas (checklist dentro de uma tarefa)
- [ ] Tags/categorias nas tarefas
- [ ] Notificações ou lembretes
- [ ] Modo claro (light mode)
- [ ] Testes automatizados (unitários e de integração)
- [ ] Paginação na listagem de tarefas (não necessária agora, mas relevante para muitas tarefas)

---

## 9. Próximos Passos Sugeridos

### Curto prazo (próxima sessão)
1. **Edição inline de tarefas** — ao clicar no título, transformar em `<input>` e salvar com `PUT /api/tasks/{id}`
2. **`useUpdateTask` já existe** no hook (`useTasks.ts`) mas ainda não está conectado à UI — basta criar o componente de edição no `TaskItem.tsx`

### Médio prazo
3. **Autenticação** — adicionar Spring Security + JWT no backend; no frontend, tela de login + contexto de usuário
4. **Multi-usuário** — adicionar entidade `User` e associar tarefas ao usuário logado (`Task` ganha campo `userId`)
5. **Testes** — JUnit + Mockito no backend; Vitest + Testing Library no frontend

### Longo prazo
6. **Subtarefas** — nova entidade `SubTask` com FK para `Task`; renderizar como checklist dentro do painel
7. **Migração de banco** — substituir `ddl-auto=update` por Flyway para controle de versão do schema
8. **Deploy** — configurar CI/CD no GitHub Actions; deploy em Railway, Render ou VPS

---

## 10. Boas Práticas e Observações

### Decisões arquiteturais importantes

**DTOs separados da entidade**
O backend nunca expõe a entidade `Task` diretamente. `TaskRequest` recebe os dados da entrada e `TaskResponse` formata a saída. Isso desacopla a API do modelo de banco.

**Variáveis de ambiente no backend**
O `application.properties` usa `${DB_URL:valor_default}`. No Docker, as variáveis são injetadas pelo Compose. Localmente, os defaults funcionam sem configuração extra.

**Proxy no Vite (dev) e Nginx (produção)**
Em desenvolvimento, o Vite redireciona `/api/*` → `localhost:8081`. Em produção, o Nginx faz o mesmo. O frontend nunca precisa saber o endereço do backend — sempre usa `/api`.

**Cache invalidation no React Query**
Toda mutação (criar, toggle, excluir) invalida duas queries: a lista do dia (`['tasks', date]`) e o resumo do mês (`['summary', year, month]`). Isso garante que o calendário e o painel estejam sempre sincronizados sem recarregar a página.

**`npm ci` vs `npm install` no Dockerfile**
O `npm ci` exige `package-lock.json`. Como o lock file não estava commitado na primeira execução, o Dockerfile usa `npm install`. Se quiser segurança de reproducibilidade, commite o `package-lock.json` e volte para `npm ci`.

### Pontos de atenção

- `spring.jpa.hibernate.ddl-auto=update` é adequado para desenvolvimento, mas **não deve ser usado em produção**. Trocar por `validate` e usar Flyway para migrações.
- A senha do banco (`postgres`) é hardcoded no `docker-compose.yml`. Em produção, usar Docker Secrets ou variáveis de ambiente externas.
- O atributo `version: '3.9'` no `docker-compose.yml` gera um warning de obsoleto em versões recentes do Docker Compose. Pode ser removido sem impacto.
- O hook `useUpdateTask` está implementado em `useTasks.ts` mas não tem UI associada ainda — não apagar ao refatorar.
