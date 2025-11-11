package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func setup() {
	store = make(map[string]Task)
	taskIDCounter = 0
}

func TestCreateTaskHandler(t *testing.T) {
	setup()

	taskPayload := `{"title": "Test Task", "description": "This is a test task."}`
	bodyReader := bytes.NewReader([]byte(taskPayload))

	req := httptest.NewRequest(http.MethodPost, "/tasks", bodyReader)

	rr := httptest.NewRecorder()

	createTaskHandler(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected status %d, got %d", http.StatusCreated, rr.Code)
	}

	if len(store) != 1 {
		t.Errorf("expected store length 1, got %d", len(store))
	}

	var createdTask Task
	if err := json.NewDecoder(rr.Body).Decode(&createdTask); err != nil {
		t.Fatalf("could not decode response body: %v", err)
	}

	if createdTask.Title != "Test Task" {
		t.Errorf("expected title 'Test Task', got '%s'", createdTask.Title)
	}

	if createdTask.ID != "1" {
		t.Errorf("expected ID '1', got '%s'", createdTask.ID)
	}
}

func TestCreateTaskHandler_NoTitle(t *testing.T) {
	setup()

	taskPayload := `{"description": "This is a test task without a title."}`
	bodyReader := bytes.NewReader([]byte(taskPayload))

	req := httptest.NewRequest(http.MethodPost, "/tasks", bodyReader)
	rr := httptest.NewRecorder()

	createTaskHandler(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, rr.Code)
	}
}

func TestGetTaskHandler(t *testing.T) {
	setup()
	store["1"] = Task{ID: "1", Title: "Task 1", Status: ToDoStatus}
	store["2"] = Task{ID: "2", Title: "Task 2", Status: InProgressStatus}

	req := httptest.NewRequest(http.MethodGet, "/tasks/1", nil)
	rr := httptest.NewRecorder()

	getTasksHandler(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rr.Code)
	}

	var tasks []Task
	if err := json.NewDecoder(rr.Body).Decode(&tasks); err != nil {
		t.Fatalf("could not decode response body: %v", err)
	}

	if len(tasks) != 2 {
		t.Errorf("expected 2 tasks, got %d", len(tasks))
	}
}

func TestUpdateTaskHandler(t *testing.T) {
	setup()

	store["1"] = Task{ID: "1", Title: "Original Title", Status: ToDoStatus}

	updatePayload := `{"title": "Updated Title", "description": "Updated description", "status": "Em Progresso"}`
	bodyReader := bytes.NewReader([]byte(updatePayload))

	req := httptest.NewRequest(http.MethodPut, "/tasks/1", bodyReader)
	rr := httptest.NewRecorder()

	updateTaskHandler(rr, req, "1")

	if rr.Code != http.StatusOK {
		t.Errorf("expected status %d, got %d", http.StatusOK, rr.Code)
	}

	if store["1"].Title != "Updated Title" {
		t.Errorf("expected title 'Updated Title', got '%s'", store["1"].Title)
	}
	if store["1"].Status != InProgressStatus {
		t.Errorf("expected status 'Em Progresso', got '%s'", store["1"].Status)
	}
}

func TestUpdateTaskHandler_InvalidStatus(t *testing.T) {
	setup()

	store["1"] = Task{ID: "1", Title: "Original Title", Status: ToDoStatus}

	updatePayload := `{"title": "Updated Title", "status": "Status Inválido"}`
	bodyReader := bytes.NewReader([]byte(updatePayload))

	req := httptest.NewRequest(http.MethodPut, "/tasks/1", bodyReader)
	rr := httptest.NewRecorder()

	updateTaskHandler(rr, req, "1")

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, rr.Code)
	}
}

func TestUpdateTaskHandler_NotFound(t *testing.T) {
	setup()

	updatePayload := `{"title": "Updated Title", "status": "Em Progresso"}`
	bodyReader := bytes.NewReader([]byte(updatePayload))

	req := httptest.NewRequest(http.MethodPut, "/tasks/999", bodyReader)
	rr := httptest.NewRecorder()

	updateTaskHandler(rr, req, "999")

	if rr.Code != http.StatusNotFound {
		t.Errorf("expected status %d, got %d", http.StatusNotFound, rr.Code)
	}
}
