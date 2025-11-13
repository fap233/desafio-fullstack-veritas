import React from "react";
import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useKanban } from "../useKanban";
import * as api from "../../services/api";

// mock das chamadas de API
vi.mock("../../services/api");
// mock do sonner para não dar erro no toast
vi.mock("sonner", () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		warning: vi.fn(),
	},
}));

describe("useKanban Hook", () => {
	beforeEach(() => {
		vi.clearAllMocks();

		api.getTasks.mockReset();
		api.createTask.mockReset();
		api.deleteTask.mockReset();
	});

	it("deve buscar tarefas iniciais e ordenar por data", async () => {
		const mockTasks = [
			{ id: "2", title: "Task 2", created_at: "2025-01-02" },
			{ id: "1", title: "Task 1", created_at: "2025-01-01" },
		];

		api.getTasks.mockResolvedValue(mockTasks);

		const { result } = renderHook(() => useKanban());

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.tasks[0].id).toBe("1");
		expect(result.current.tasks[1].id).toBe("2");
	});

	it("deve adicionar uma nova tarefa corretamente", async () => {
		api.getTasks.mockResolvedValue([]); // Começa vazio
		const newTask = { id: "10", title: "New Task", created_at: "2025-01-10" };
		api.createTask.mockResolvedValue(newTask);

		const { result } = renderHook(() => useKanban());

		await waitFor(() => expect(result.current.isLoading).toBe(false));

		await act(async () => {
			await result.current.addTask("New Task", "Desc");
		});

		expect(api.createTask).toHaveBeenCalledWith("New Task", "Desc");
		expect(result.current.tasks).toHaveLength(1);
		expect(result.current.tasks[0]).toEqual(newTask);
	});

	it("deve remover uma tarefa (otimista)", async () => {
		const initialTasks = [{ id: "1", title: "Task 1" }];
		api.getTasks.mockResolvedValue(initialTasks);
		api.deleteTask.mockResolvedValue({});

		const { result } = renderHook(() => useKanban());
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		await act(async () => {
			await result.current.removeTask("1");
		});

		expect(result.current.tasks).toHaveLength(0);
		expect(api.deleteTask).toHaveBeenCalledWith("1");
	});
});
