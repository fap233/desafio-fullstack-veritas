package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"sync"
)

var store = make(map[string]Task)

var mu sync.RWMutex

var taskIDCounter = 0

func getNextTaskID() string {
	mu.Lock()
	defer mu.Unlock()

	taskIDCounter++
	return strconv.Itoa(taskIDCounter)
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
	newTask.ID = getNextTaskID()
	newTask.Status = ToDoStatus

	mu.Lock()
	store[newTask.ID] = newTask
	mu.Unlock()

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
