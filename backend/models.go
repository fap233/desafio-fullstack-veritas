package main

type Status string

const (
	ToDoStatus       Status = "A Fazer"
	InProgressStatus Status = "Em Progresso"
	DoneStatus       Status = "Concluídas"
)

type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description,omitempty"`
	Status      Status `json:"status"`
	CreatedAt   string `json:"created_at"`
}
