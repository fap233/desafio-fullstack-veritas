# Desafio Fullstack - Mini Kanban (Veritas)

Este projeto é uma solução para o desafio técnico da Veritas Consultoria, implementando um Mini Kanban fullstack com React no frontend e Go (Golang) no backend.

## Preview

<https://github.com/user-attachments/assets/ace2c9cc-f472-43df-b883-99edc4085ded>

## 🚀 Funcionalidades

### Backend (Go)

- API RESTful completa com endpoints CRUD (`/tasks`).
- Armazenamento em memória com **persistência bônus em arquivo JSON** (`tasks.json`).
- Roteamento nativo (sem frameworks externos) e middleware de CORS.
- Lógica de concorrência segura usando `sync.RWMutex`.
- **Testes Unitários:** Cobertura de testes para os principais handlers.

### Frontend (React)

- Interface de Kanban com 3 colunas fixas: "A Fazer", "Em Progresso", "Concluídas".
- **CRUD completo no frontend:**
  - **Criar:** Adicionar novas tarefas (com título e descrição opcional) na coluna "A Fazer".
  - **Ler:** Buscar e exibir todas as tarefas da API.
  - **Editar:** Editar título e descrição de tarefas existentes.
  - **Excluir:** Remover tarefas.
- **Drag-and-Drop:** Mover tarefas entre colunas (atualizando o status no backend) usando `dnd-kit`.
- **UX Aprimorada:** Feedbacks de loading, tratamento de erros e validações visuais.
- **Responsividade:** Layout adaptável para Mobile (colunas empilhadas) e Desktop.
- **React Compiler:** Otimização automática de renderização ativada.

### Infraestrutura & DevOps

- **Docker:** Containerização completa com multi-stage builds.
- **Docker Compose:** Orquestração de todo o ambiente com um único comando.
- **Infra:** Docker, Nginx (Proxy Reverso para o Frontend), Alpine Linux.

---

## 🛠️ Stack de Tecnologia

- **Backend:** Go (v1.25) (stdlib `net/http`)
- **Frontend:** React (v18) + Vite
- **Estilização:** Tailwind CSS
- **Chamadas de API:** Axios
- **Drag & Drop:** `@dnd-kit/core`

---

## 🏃 Como Rodar o Projeto

### Opção 1: Usando Docker 🐳

Esta opção sobe todo o ambiente (Backend + Frontend + Banco JSON) isoladamente, sem precisar instalar Go ou Node.js na sua máquina.

1. Certifique-se de ter o **Docker** e **Docker Compose** instalados.
2. Na raiz do projeto, execute:

```bash
docker compose up --build

```

Acesse a aplicação em: http://localhost:5173

(Para parar, pressione Ctrl + C no terminal)

---

### Opção 2: Manualmente 🛠️

Você precisará de dois terminais abertos simultaneamente.

### 1. Backend (Go)

```bash
# 1. Navegue para a pasta do backend
cd backend

# 2. Instale/Atualize as dependências
go mod tidy

# 3. Rode o servidor (porta :8080)
go run .

```

O servidor iniciará na http://localhost:8080 com a persistência do tasks.json ativa.

### 2. Frontend (React)

```bash
# 1. Navegue para a pasta do frontend em um novo terminal
cd frontend

# 2. instale as dependências
npm install

# 3. Rode o servidor de desenvolvimento (porta :5173)
npm run dev
```

O app abrirá automaticamente no seu navegador em http://localhost:5173.

---

## 🧪 Como Rodar os Testes (Backend)

O projeto possui testes unitarios para garantir a integridade da API.

```bash
cd backend

go test -v
```

## 📂 Documentação do Projeto

A documentação exigida (User Flow) encontra-se na pasta /docs.

- User Flow (Fluxo do Usuário): Diagrama detalhando as interações do usuário.

## 📝 Decisões Técnicas

- Backend (Go): Optei por usar apenas a biblioteca padrão net/http (sem frameworks como Gin ou Echo) para demonstrar proficiência nos fundamentos do Go, como exigido por um escopo de MVP. A lógica de persistência foi implementada com os.WriteFile e os.ReadFile, protegida por sync.RWMutex para evitar deadlocks (destravando antes de chamar a função de salvar).
- Frontend (React):
  - Utilizei Vite pela sua performance superior. O estado principal é gerenciado no KanbanBoard.jsx e passado para os componentes filhos (Column, TaskCard) via "prop drilling", uma abordagem limpa para um app deste tamanho.
  - Utilizei React 19 com o novo React Compiler para garantir performance máxima sem a necessidade excessiva de useMemo/useCallback manuais. O @dnd-kit foi escolhido pela acessibilidade e leveza.
  - Drag-and-Drop: A biblioteca dnd-kit foi escolhida por ser leve, moderna e oferecer DragOverlay para uma UI fluida.
- Docker: Configurei multi-stage builds para garantir imagens finais extremamente leves (Alpine) e seguras, fixando as versões das imagens base para evitar quebras futuras.

---

## 📈 Melhorias Futuras

- Reordenação Persistente: Implementar um campo order no backend para que a reordenação de tarefas na mesma coluna seja persistida.
- Adicionar banco de dados para armazenamento mais robusto (ex: SQLite, PostgreSQL).
- Adicionar sistema de autenticação de usuários.
- Adicionar permissões de acesso.
- Adicionar data limite e notificações para tarefas.
- Permitir criação de múltiplos quadros Kanban por usuário.
- Permitir anexar arquivos às tarefas.
- Permitir comentários nas tarefas.
- Permitir filtros e buscas avançadas.
- Implementar temas (claro/escuro).
- Implementar seleção de idiomas.
- Implementar Select All / Bulk Actions para tarefas.
- Implementar Undo/Redo para ações do usuário.
- Implementar integração com calendários (Google Calendar, Outlook).
- Implementar integração com ferramentas de comunicação (Slack, Microsoft Teams).
- Melhorar responsividade e design UI/UX.

---
