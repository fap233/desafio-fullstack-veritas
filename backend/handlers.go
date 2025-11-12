package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

var store = make(map[string]Task)

var mu sync.RWMutex

const jsonFilePath = "tasks.json"

func saveTasksToFile() {
	mu.RLock()
	defer mu.RUnlock()

	tasks := make([]Task, 0, len(store))
	for _, task := range store {
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

	if err := os.WriteFile(jsonFilePath, data, 0644); err != nil {
		log.Printf("Error writing tasks to file: %v", err)
	}
}

func loadTasksFromFile() {
	data, err := os.ReadFile(jsonFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			log.Printf("No existing tasks file found, starting fresh.")
			return
		}
		log.Printf("Error reading tasks from file: %v", err)
		return
	}

	mu.Lock()
	defer mu.Unlock()

	var tasks []Task
	if err := json.Unmarshal(data, &tasks); err != nil {
		log.Printf("Error unmarshaling tasks from JSON: %v", err)
		return
	}

	maxID := 0
	for _, task := range tasks {
		store[task.ID] = task
	}
	log.Printf("Loaded %d tasks from tasks.json. Counter set to %d.", len(store), maxID)
}

// CRUD - CREATE

func createTaskHandler(w http.ResponseWriter, r *http.Request) {
	var newTask Task
	if err := json.NewDecoder(r.Body).Decode(&newTask); err != nil {
		log.Printf("Error decoding JSON: %v", err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if newTask.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}
	newTask.ID = uuid.New().String()
	newTask.Status = ToDoStatus
	newTask.CreatedAt = time.Now().Format(time.RFC3339)

	mu.Lock()
	store[newTask.ID] = newTask
	mu.Unlock()

	saveTasksToFile()

	log.Printf("Task successfully created: ID %s, Title %s", newTask.ID, newTask.Title)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(newTask)
}

func tasksHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getTasksHandler(w, r)
	case http.MethodPost:
		createTaskHandler(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// CRUD - GET
func getTasksHandler(w http.ResponseWriter, _ *http.Request) {
	mu.RLock()
	defer mu.RUnlock()

	tasks := make([]Task, 0, len(store))
	for _, task := range store {
		tasks = append(tasks, task)
	}

	w.Header().Set("Content-Type", "application/json")

	if err := json.NewEncoder(w).Encode(tasks); err != nil {
		log.Printf("Error encoding tasks to JSON: %v", err)
		http.Error(w, "Error generating response", http.StatusInternalServerError)
	}
}

// CRUD - UPDATE

func updateTaskHandler(w http.ResponseWriter, r *http.Request, id string) {
	var updatedTask Task

	if err := json.NewDecoder(r.Body).Decode(&updatedTask); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if updatedTask.Title == "" {
		http.Error(w, "Title is required", http.StatusBadRequest)
		return
	}

	isValidStatus := false
	switch updatedTask.Status {
	case ToDoStatus, InProgressStatus, DoneStatus:
		isValidStatus = true
	}

	if !isValidStatus {

		msg := "Invalid status value. Must be '" + string(ToDoStatus) + "', '" + string(InProgressStatus) + "' or '" + string(DoneStatus) + "'"
		http.Error(w, msg, http.StatusBadRequest)
		return
	}

	mu.Lock()

	_, ok := store[id]

	if !ok {
		mu.Unlock()
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	updatedTask.ID = id
	store[id] = updatedTask

	mu.Unlock()

	saveTasksToFile()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedTask)
}

// CRUD - DELETE
func deleteTaskHandler(w http.ResponseWriter, _ *http.Request, id string) {
	mu.Lock()
	_, ok := store[id]
	if !ok {
		mu.Unlock()
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	delete(store, id)

	mu.Unlock()

	saveTasksToFile()

	log.Printf("Task successfully deleted: ID %s", id)

	w.WriteHeader(http.StatusNoContent)
}

func taskDetailHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/tasks/")

	if id == "" {
		http.Error(w, "Task ID is required", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		updateTaskHandler(w, r, id)
	case http.MethodDelete:
		deleteTaskHandler(w, r, id)
	default:
		http.Error(w, "Method not allowed on this route", http.StatusMethodNotAllowed)
	}
}
