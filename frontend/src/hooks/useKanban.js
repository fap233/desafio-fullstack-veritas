import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	getTasks,
	createTask,
	updateTask as apiUpdateTask,
	deleteTask as apiDeleteTask,
} from "../services/api";

// functionalidade do Kanban encapsulada em um hook
export function useKanban() {
	const [tasks, setTasks] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchTasks();
	}, []);

	// CRUD - Read
	const fetchTasks = async () => {
		try {
			const data = await getTasks();
			// Ordenação garantida por created_at
			const sortedTasks = data.sort((a, b) =>
				(a.created_at || "").localeCompare(b.created_at || ""),
			);
			setTasks(sortedTasks);
		} catch (error) {
			console.error("Error fetching tasks", error);
			toast.error("Erro ao buscar tarefas.");
		} finally {
			setIsLoading(false);
		}
	};

	// CRUD - Create
	const addTask = async (title, description) => {
		try {
			const newTask = await createTask(title, description);
			setTasks((prev) =>
				[...prev, newTask].sort((a, b) =>
					(a.created_at || "").localeCompare(b.created_at || ""),
				),
			);
			toast.success("Tarefa criada com sucesso!");
			return true;
		} catch (error) {
			console.error("Error adding task", error);
			toast.error("Erro ao criar tarefa.");
			return false;
		}
	};

	// CRUD - Update

	const updateTaskDetails = async (id, title, description, status) => {
		const originalTasks = [...tasks];

		setTasks((prev) =>
			prev
				.map((t) => (t.id === id ? { ...t, title, description, status } : t))
				.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "")),
		);

		try {
			await apiUpdateTask(id, title, description, status);
			toast.success("Tarefa atualizada!");
			return true;
		} catch (error) {
			console.error("Error updating task", error);
			toast.error("Erro ao atualizar tarefa.");
			setTasks(originalTasks); // Reverte em caso de erro
			return false;
		}
	};

	// CRUD - Delete

	const removeTask = async (id) => {
		const originalTasks = [...tasks];
		setTasks((prev) => prev.filter((t) => t.id !== id));

		try {
			await apiDeleteTask(id);
			toast.success("Tarefa removida!");
		} catch (error) {
			console.error("Error deleting task", error);
			toast.error("Erro ao deletar tarefa.");
			setTasks(originalTasks);
		}
	};

	// DND - Move

	const moveTask = async (task, newStatus) => {
		if (task.status === newStatus) return;

		const originalTasks = [...tasks];

		setTasks((prev) =>
			prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
		);

		try {
			await apiUpdateTask(task.id, task.title, task.description, newStatus);
			toast.success("Tarefa movida!");
		} catch (error) {
			console.error("Error moving task", error);
			toast.error("Erro ao mover tarefa.");
			setTasks(originalTasks);
		}
	};

	return {
		tasks,
		isLoading,
		addTask,
		updateTaskDetails,
		removeTask,
		moveTask,
	};
}
