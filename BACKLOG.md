# TodoCalendar — Backlog de Funcionalidades

> Organizado por prioridade. Atualizado em: 2026-04-10

---

## 🔴 Alta Prioridade

### Personalização de Temas
- **Status:** Estrutura pronta (`ThemeContext` + CSS vars por `[data-theme]`)
- **O que falta:** Tela de configurações na sidebar para trocar de tema em tempo real
- **Temas disponíveis:** Amber Night ✅ | Arctic Blue (vars prontas) | Rose Dawn (vars prontas)
- **Estimativa:** 1 sessão

### Dashboard de Estatísticas
- Tela separada com visão macro do desempenho do usuário
- Gráfico de barras: score por dia dos últimos 30 dias
- Streak de dias com score ≥ 70%
- Taxa de conclusão por tipo de tarefa (positivas vs negativas)
- Tarefa mais frequente, hábito mais resistido
- **Novo endpoint sugerido:** `GET /api/stats?period=30d`

### Testes Automatizados
- **Backend:** JUnit 5 + Mockito — unit tests para `TaskService`, `UserService`, `JwtService`
- **Frontend:** Vitest + Testing Library — testes para `TaskItem`, `TaskPanel`, `AuthContext`
- **Integração:** `@SpringBootTest` para os endpoints de auth e tarefas

---

## 🟡 Média Prioridade

### Migração de Banco com Flyway
- Substituir `ddl-auto=update` por Flyway para controle versionado do schema
- Scripts SQL em `resources/db/migration/`
- Necessário antes de qualquer deploy em produção

### Filtros de Tarefas
- Filtrar por: todas / só pendentes / só concluídas / só positivas / só negativas
- UI: chips de filtro no topo do painel de tarefas
- Sem mudança no backend necessária (filtrar no frontend)

### Drag & Drop de Tarefas
- Arrastar tarefa de um dia para outro no calendário
- Biblioteca sugerida: `@dnd-kit/core`
- **Novo endpoint:** `PATCH /api/tasks/{id}/move?date=YYYY-MM-DD`

### Edição de Tipo de Tarefa
- Permitir alterar POSITIVE ↔ NEGATIVE de uma tarefa existente via toggle no `TaskItem`
- Já existe `PUT /api/tasks/{id}` que aceita `type` — só falta UI

### Perfil do Usuário
- Tela para editar nome, email e senha
- **Novos endpoints:** `GET /api/users/me`, `PUT /api/users/me`, `PUT /api/users/me/password`

---

## 🟢 Baixa Prioridade

### Gamificação
- Sistema de conquistas: "7 dias seguidos acima de 80%", "Primeiro hábito resistido", etc.
- XP diário baseado no score
- Nível do usuário (Iniciante → Consistente → Mestre)
- Entidade `Achievement` no backend
- UI: badge na sidebar com nível atual

### Subtarefas
- Checklist dentro de uma tarefa (ex: "Estudar" → [ ] ler capítulo 1, [ ] fazer exercícios)
- Nova entidade `SubTask` com FK para `Task`
- UI: lista expansível no `TaskItem`

### Login Avançado
- OAuth2 com Google / GitHub
- Recuperação de senha por e-mail (Spring Mail + token temporário)
- 2FA (autenticação em dois fatores)

### Notificações
- Lembrete diário de adicionar tarefas (push notification via Service Worker)
- Alerta de streak em risco (não abriu o app há 2 dias)

### Modo Semana / Modo Lista
- Alternar entre visão mensal (atual), visão semanal e lista simples
- Visão semanal: 7 colunas com tarefas do dia inline

### Exportação de Dados
- Exportar histórico de tarefas em CSV ou PDF
- Útil para análise pessoal ou backup

### App Mobile
- PWA (Progressive Web App): já possível adicionando `manifest.json` e Service Worker
- App nativo: React Native reutilizando a lógica de hooks e API

### Deploy em Produção
- CI/CD: GitHub Actions → build → push para Registry → deploy
- Plataformas sugeridas: Railway (simples) / Fly.io / VPS com Nginx
- Substituir `ddl-auto=update` por `validate` + Flyway
- Secrets via variáveis de ambiente (não hardcoded)
- HTTPS com certificado Let's Encrypt

---

## 📐 Dívida Técnica

| Item | Impacto | Esforço |
|---|---|---|
| Substituir `ddl-auto=update` por Flyway | Alto (produção) | Médio |
| Remover senha hardcoded no `docker-compose.yml` | Alto (segurança) | Baixo |
| Adicionar paginação em `GET /api/tasks?date=` | Baixo (volume atual) | Baixo |
| Commitar `package-lock.json` e usar `npm ci` | Médio (reproducibilidade) | Baixo |
| Remover `version: '3.9'` do `docker-compose.yml` | Baixo (só aviso) | Baixo |

---

## 💡 Ideia de Roadmap

```
v0.1  ✅ CRUD de tarefas + Calendário colorido
v0.2  ✅ Autenticação JWT + Multi-usuário + Redesign
v0.3  ✅ Tipos de tarefa (positivas/negativas) + Sistema de temas
v0.4  → Dashboard de estatísticas + Filtros + Testes
v0.5  → Gamificação + Conquistas
v1.0  → Deploy em produção + PWA + Flyway
```
