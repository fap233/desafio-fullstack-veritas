package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	// hello world rote
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "KanbanApi already working!")
	})

	// chore rote
	http.HandleFunc("/tasks", tasksHandler)

	// server initialization
	log.Println("Starting server on :8080")

	log.Fatal(http.ListenAndServe(":8080", nil))
}
