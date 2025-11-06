package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"
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

	mu.Lock()
	defer mu.Unlock()

	_, ok := store[id]

	if !ok {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	updatedTask.ID = id
	store[id] = updatedTask

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedTask)
}

// CRUD - DELETE
func deleteTaskHandler(w http.ResponseWriter, _ *http.Request, id string) {
	mu.Lock()
	defer mu.Unlock()
	_, ok := store[id]
	if !ok {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	delete(store, id)

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
