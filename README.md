# TodoCalendar

Sistema estilo To-Do List com Calendário, inspirado no Notion.

## Stack

| Camada    | Tecnologia                          |
|-----------|-------------------------------------|
| Backend   | Java 21 + Spring Boot 3.2 + JPA     |
| Banco     | PostgreSQL 16                       |
| Frontend  | React 18 + TypeScript + Vite        |
| Estilo    | TailwindCSS                         |
| Estado    | TanStack Query (React Query)        |
| Infra     | Docker + Docker Compose             |

## Portas

| Serviço    | Host   | Container |
|------------|--------|-----------|
| PostgreSQL | 5433   | 5432      |
| API        | 8081   | 8081      |
| Frontend   | 3001   | 80        |

## Como rodar

```bash
docker compose up --build
```

Acesse: http://localhost:3001

## API Endpoints

| Método | Rota                            | Descrição                     |
|--------|---------------------------------|-------------------------------|
| GET    | /api/tasks?date=YYYY-MM-DD      | Tarefas de um dia             |
| POST   | /api/tasks                      | Criar tarefa                  |
| PUT    | /api/tasks/{id}                 | Atualizar tarefa              |
| PATCH  | /api/tasks/{id}/toggle          | Alternar conclusão            |
| DELETE | /api/tasks/{id}                 | Excluir tarefa                |
| GET    | /api/tasks/summary?year=&month= | Resumo mensal com cores       |

## Regras de cor

| Porcentagem | Cor          |
|-------------|--------------|
| 100%        | Verde        |
| 70–99%      | Verde claro  |
| 50–69%      | Amarelo      |
| 1–49%       | Vermelho     |
| Sem tarefas | Sem cor      |
