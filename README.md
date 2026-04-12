# TaskFlow

> Sistema de gestão de tarefas diárias com calendário inteligente, recorrência automática e múltiplos temas visuais.

🌐 **Acesse o projeto:** [taskflow-dhomini.vercel.app](https://taskflow-dhomini.vercel.app)

---

## Visão Geral

TaskFlow é uma aplicação full-stack para organização de hábitos e tarefas diárias. Cada dia do calendário reflete visualmente o desempenho do usuário com base nas tarefas concluídas. Suporta tarefas positivas (metas), negativas (hábitos a evitar) e recorrentes (geradas automaticamente).

### Funcionalidades

- **Calendário interativo** com cores por desempenho diário (verde → vermelho)
- **Painel de tarefas** por dia com score de boas escolhas
- **Tarefas recorrentes** — crie uma vez, apareça todos os dias automaticamente
- **Recorrência Diária ou Semanal** com seleção de dias da semana
- **Sidebar redimensionável** com persistência no navegador
- **4 temas visuais**: Studio Dark, Arctic, Rose Dawn e Amber Night
- **Autenticação JWT** com registro e login por usuário

---

## Stack Tecnológica

| Camada      | Tecnologia                                         |
|-------------|----------------------------------------------------|
| Frontend    | React 18 + TypeScript + Vite                       |
| Estilização | CSS Custom Properties                              |
| Estado      | TanStack Query v5 (React Query)                    |
| Roteamento  | React Router v6                                    |
| Backend     | Java 21 + Spring Boot 3.2 + Spring Security        |
| Banco       | PostgreSQL 16                                      |
| Auth        | JWT (JJWT)                                         |
| Infra       | Docker + Docker Compose + Nginx                    |
| Deploy      | Vercel (frontend) + Railway (backend)              |

---

## Executar Localmente

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- Node.js 20+ (somente para desenvolvimento frontend)
- Java 21+ e Maven (somente para desenvolvimento backend)

### Com Docker (recomendado)

```bash
# Clonar o repositório
git clone https://github.com/dhomini-db/todo-calendar.git
cd todo-calendar

# Subir todos os serviços
docker compose up --build
```

| Serviço    | URL                       |
|------------|---------------------------|
| Frontend   | http://localhost:3001      |
| Backend    | http://localhost:8081      |
| PostgreSQL | localhost:5433             |

### Frontend (desenvolvimento)

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

O Vite faz proxy automático de `/api` para `localhost:8081`.

### Backend (desenvolvimento)

```bash
cd backend
mvn spring-boot:run
```

Requer PostgreSQL rodando localmente na porta 5433.

---

## Variáveis de Ambiente

### Frontend (`.env`)

```env
# URL do backend em produção (Vercel não tem proxy de servidor)
# Em dev e Docker, deixe em branco — /api é resolvido pelo proxy local
VITE_API_URL=https://todo-calendar-production-30b9.up.railway.app/api
```

Copie `.env.example` como ponto de partida:

```bash
cp frontend/.env.example frontend/.env
```

### Backend

| Variável          | Padrão                      | Descrição                             |
|-------------------|-----------------------------|---------------------------------------|
| `DB_URL`          | `jdbc:postgresql://...`     | URL JDBC do PostgreSQL                |
| `DB_USER`         | `postgres`                  | Usuário do banco                      |
| `DB_PASSWORD`     | `postgres`                  | Senha do banco                        |
| `JWT_SECRET`      | (chave de dev embutida)     | Chave secreta para assinar tokens JWT |
| `ALLOWED_ORIGINS` | `http://localhost:3001,...` | Origens CORS separadas por vírgula    |

> **Em produção**: `ALLOWED_ORIGINS` é gerenciado pelo Railway. O backend aceita automaticamente qualquer subdomínio `*.vercel.app`.

---

## Deploy

### Frontend — Vercel

```bash
cd frontend
npx vercel --prod
```

O arquivo `frontend/vercel.json` já configura o fallback de rotas para SPA (React Router).

### Backend — Railway

Deploy automático via GitHub. Qualquer `push` na branch `main` aciona o redeploy no Railway.

**URL do backend:** `https://todo-calendar-production-30b9.up.railway.app`

---

## API — Endpoints

### Autenticação

| Método | Rota                 | Descrição         |
|--------|----------------------|-------------------|
| POST   | `/api/auth/register` | Criar conta       |
| POST   | `/api/auth/login`    | Login + token JWT |

### Tarefas

| Método | Rota                              | Descrição                        |
|--------|-----------------------------------|----------------------------------|
| GET    | `/api/tasks?date=YYYY-MM-DD`      | Tarefas de um dia                |
| POST   | `/api/tasks`                      | Criar tarefa                     |
| PUT    | `/api/tasks/{id}`                 | Atualizar tarefa                 |
| PATCH  | `/api/tasks/{id}/toggle`          | Alternar conclusão               |
| DELETE | `/api/tasks/{id}`                 | Excluir tarefa                   |
| GET    | `/api/tasks/summary?year=&month=` | Resumo mensal com score de cores |

### Tarefas Recorrentes

| Método | Rota                         | Descrição                    |
|--------|------------------------------|------------------------------|
| GET    | `/api/templates`             | Listar templates do usuário  |
| POST   | `/api/templates`             | Criar template recorrente    |
| PUT    | `/api/templates/{id}`        | Atualizar template           |
| PATCH  | `/api/templates/{id}/toggle` | Ativar / pausar template     |
| DELETE | `/api/templates/{id}`        | Excluir template             |

---

## Estrutura do Projeto

```
todo-calendar/
├── backend/                    # Spring Boot API
│   ├── src/main/java/
│   │   └── com/todocalendar/
│   │       ├── controller/     # REST endpoints
│   │       ├── service/        # Regras de negócio
│   │       ├── entity/         # Entidades JPA
│   │       ├── dto/            # Request / Response DTOs
│   │       ├── repository/     # Spring Data JPA
│   │       ├── security/       # JWT filter
│   │       └── config/         # SecurityConfig, AppConfig
│   └── Dockerfile
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/         # Sidebar, Calendar, TaskPanel, TaskItem
│   │   ├── pages/              # CalendarPage, Dashboard, Graficos, etc.
│   │   ├── hooks/              # useTasks, useTemplates
│   │   ├── api/                # Axios client
│   │   ├── contexts/           # AuthContext, ThemeContext
│   │   └── types/              # TypeScript types
│   ├── public/                 # Logo SVG, favicon
│   ├── vercel.json             # Configuração de deploy (SPA routing)
│   └── Dockerfile
└── docker-compose.yml
```

---

## Licença

MIT
