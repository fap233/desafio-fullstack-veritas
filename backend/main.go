package main

import (
	"log"
	"net/http"
)

func main() {
	// cria a instância do servidor
	server := NewApiServer()

	// cria o multiplexer
	mux := http.NewServeMux()

	// registra os métodos do servidor
	mux.HandleFunc("/", server.homeHandler)
	mux.HandleFunc("/tasks", server.tasksHandler)
	mux.HandleFunc("/tasks/", server.taskDetailHandler)

	// middleware
	corsHandler := server.enableCORS(mux)

	// inicia o servidor
	log.Println("Starting server on :8080 (Refactored with DI)")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))
}
