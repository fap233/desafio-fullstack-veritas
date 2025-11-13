package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

// struct principal
type ApiServer struct {
	store    map[string]Task
	mu       sync.RWMutex
	filePath string
}

// construtor
func NewApiServer() *ApiServer {
	server := &ApiServer{
		store:    make(map[string]Task),
		filePath: "tasks.json",
	}

	server.loadTasksFromFile()
	return server
}

// persistência (private)
func (s *ApiServer) saveTasksToFile() {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tasks := make([]Task, 0, len(s.store))
	for _, task := range s.store {
		tasks = append(tasks, task)
	}

	sort.Slice(tasks, func(i, j int) bool {
		return tasks[i].CreatedAt < tasks[j].CreatedAt
	})

	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		log.Printf("Error marshaling tasks to JSON: %v", err)
		return
	}

	if err := os.WriteFile(s.filePath, data, 0644); err != nil {
		log.Printf("Error writing tasks to file: %v", err)
	}
}

func (s *ApiServer) loadTasksFromFile() {
	data, err := os.ReadFile(s.filePath)
	if err != nil {
		if os.IsNotExist(err) {
			log.Printf("No existing tasks file found, starting fresh.")
			return
		}
		log.Printf("Error reading tasks from file: %v", err)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var tasks []Task
	if err := json.Unmarshal(data, &tasks); err != nil {
		log.Printf("Error unmarshaling tasks from JSON: %v", err)
		return
	}

	for _, task := range tasks {
		s.store[task.ID] = task
	}
	log.Printf("Loaded %d tasks from tasks.json.", len(s.store))
}

// métodos handlers

// CRUD - CREATE
func (s *ApiServer) createTaskHandler(w http.ResponseWriter, r *http.Request) {
	var req CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding JSON: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if req.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	newTask := Task{
		ID:          uuid.New().String(),
		Title:       req.Title,
		Description: req.Description,
		Status:      ToDoStatus,
		CreatedAt:   time.Now().Format(time.RFC3339),
	}

	s.mu.Lock()
	s.store[newTask.ID] = newTask
	s.mu.Unlock()

	s.saveTasksToFile() // Chamada de método

	log.Printf("Task successfully created: ID %s, Title %s", newTask.ID, newTask.Title)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newTask)
}

func (s *ApiServer) tasksHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.getTasksHandler(w, r) // Chama o método get
	case http.MethodPost:
		s.createTaskHandler(w, r) // Chama o método create
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// CRUD - GET
func (s *ApiServer) getTasksHandler(w http.ResponseWriter, _ *http.Request) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	tasks := make([]Task, 0, len(s.store))
	for _, task := range s.store {
		tasks = append(tasks, task)
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(tasks); err != nil {
		log.Printf("Error encoding tasks to JSON: %v", err)
		http.Error(w, "Error generating response", http.StatusInternalServerError)
	}
}

// CRUD - UPDATE
func (s *ApiServer) updateTaskHandler(w http.ResponseWriter, r *http.Request, id string) {
	var req UpdateTaskRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	isValidStatus := false
	switch req.Status {
	case ToDoStatus, InProgressStatus, DoneStatus:
		isValidStatus = true
	}

	if !isValidStatus {
		msg := "Invalid status value. Must be '" + string(ToDoStatus) + "', '" + string(InProgressStatus) + "' or '" + string(DoneStatus) + "'"
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	s.mu.Lock()

	existingTask, ok := s.store[id]
	if !ok {
		s.mu.Unlock()
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	existingTask.Title = req.Title
	existingTask.Description = req.Description
	existingTask.Status = req.Status

	s.store[id] = existingTask
	s.mu.Unlock()

	s.saveTasksToFile()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(existingTask)
}

// CRUD - DELETE
func (s *ApiServer) deleteTaskHandler(w http.ResponseWriter, _ *http.Request, id string) {
	s.mu.Lock()
	_, ok := s.store[id]
	if !ok {
		s.mu.Unlock()
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	delete(s.store, id)
	s.mu.Unlock()

	s.saveTasksToFile()

	log.Printf("Task successfully deleted: ID %s", id)

	w.WriteHeader(http.StatusNoContent)
}

func (s *ApiServer) taskDetailHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/tasks/")

	if id == "" {
		http.Error(w, "Task ID is required", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		s.updateTaskHandler(w, r, id)
	case http.MethodDelete:
		s.deleteTaskHandler(w, r, id)
	default:
		http.Error(w, "Method not allowed on this route", http.StatusMethodNotAllowed)
	}
}

// handlers Auxiliares
func (s *ApiServer) enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *ApiServer) homeHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "KanbanApi (v2 - Refactored) already working!")
}
