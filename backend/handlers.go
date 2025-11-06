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

func tasksHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		getTasksHandler(w, r)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

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
