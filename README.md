# Desafio Fullstack - Mini Kanban (Veritas)

Este projeto é uma solução para o desafio técnico da Veritas Consultoria, implementando um Mini Kanban fullstack com React no frontend e Go (Golang) no backend.

## Preview

## soon

## 🚀 Funcionalidades

### Backend (Go)

- API RESTful completa com endpoints CRUD (`/tasks`).
- Armazenamento em memória com **persistência bônus em arquivo JSON** (`tasks.json`).
- Roteamento nativo (sem frameworks externos) e middleware de CORS.
- Lógica de concorrência segura usando `sync.RWMutex`.

### Frontend (React)

- Interface de Kanban com 3 colunas fixas: "A Fazer", "Em Progresso", "Concluídas".
- **CRUD completo no frontend:**
  - **Criar:** Adicionar novas tarefas (com título e descrição opcional) na coluna "A Fazer".
  - **Ler:** Buscar e exibir todas as tarefas da API.
  - **Editar:** Editar título e descrição de tarefas existentes.
  - **Excluir:** Remover tarefas.
- **Bônus de Drag-and-Drop:** Mover tarefas entre colunas (atualizando o status no backend) usando `dnd-kit`.

---

## 🛠️ Stack de Tecnologia

- **Backend:** Go (v1.25) (stdlib `net/http`)
- **Frontend:** React (v18) + Vite
- **Estilização:** Tailwind CSS
- **Chamadas de API:** Axios
- **Drag & Drop:** `@dnd-kit/core`

---

## 🏃 Como Rodar o Projeto

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
#1. Navegue para a pasta do frontend em um novo terminal
cd frontend

#2. instale as dependências
npm install

#3. Rode o servidor de desenvolvimento (porta :5173)
npm run dev
```

O app abrirá automaticamente no seu navegador em http://localhost:5173.

## 📝 Decisões Técnicas

- Backend (Go): Optei por usar apenas a biblioteca padrão net/http (sem frameworks como Gin ou Echo) para demonstrar proficiência nos fundamentos do Go, como exigido por um escopo de MVP. A lógica de persistência foi implementada com os.WriteFile e os.ReadFile, protegida por sync.RWMutex para evitar deadlocks (destravando antes de chamar a função de salvar).
- Frontend (React): Utilizei Vite pela sua performance superior. O estado principal é gerenciado no KanbanBoard.jsx e passado para os componentes filhos (Column, TaskCard) via "prop drilling", uma abordagem limpa para um app deste tamanho.
- Drag-and-Drop: A biblioteca dnd-kit foi escolhida por ser leve, moderna e oferecer DragOverlay para uma UI fluida.

---

## 📈 Melhorias Futuras

- Reordenação Persistente: Implementar um campo order no backend para que a reordenação de tarefas na mesma coluna seja persistida.
- Testes: Adicionar testes de unidade simples no backend (Bônus).
- Docker: Criar um docker-compose.yml para unificar a inicialização (Bônus).

---
