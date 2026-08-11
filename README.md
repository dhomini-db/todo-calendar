🌐 **Site oficial:** [todo-calendar-eight-orpin.vercel.app](https://todo-calendar-eight-orpin.vercel.app)

# TaskFlow

> Sistema de gestão de tarefas diárias com calendário inteligente, recorrência automática e múltiplos temas visuais.

|------------|--------------------------------------------|
| Frontend   | [localhost:3001](http://localhost:3001)     |
| Backend    | [localhost:8081](http://localhost:8081)     |
| PostgreSQL | localhost:5433                             |
🌐 **Acesse o projeto (online):** [todo-calendar-eight-orpin.vercel.app](https://todo-calendar-eight-orpin.vercel.app)
🌐 **Acesse o projeto (online):** [todo-calendar-eight-orpin.vercel.app](https://todo-calendar-eight-orpin.vercel.app)
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
