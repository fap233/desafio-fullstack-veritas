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
