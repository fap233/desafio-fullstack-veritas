import { useEffect, useState } from "react";
import Column from "./Column";
import { getTasks, createTask, updateTask, deleteTask } from "../services/api";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const FIXED_COLUMNS = [
	{ id: "todo", title: "A Fazer" },
	{ id: "in_progress", title: "Em Progresso" },
	{ id: "done", title: "Concluídas" },
];

function KanbanBoard() {
	const [tasks, setTasks] = useState([]);
	const [activeTask, setActiveTask] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const fetchedTasks = await getTasks();

				fetchedTasks.sort((a, b) =>
					(a.created_at || "").localeCompare(b.created_at || ""),
				);

				setTasks(fetchedTasks);
			} catch (err) {
				console.error("Error fetching tasks", err);
				toast.error("Erro ao buscar tarefas. Tente recarregar a página.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchTasks();
	}, []);

	const handleAddTask = async (title, description) => {
		try {
			const newTask = await createTask(title, description);

			setTasks((prevTasks) =>
				[...prevTasks, newTask].sort((a, b) =>
					(a.created_at || "").localeCompare(b.created_at || ""),
				),
			);

			return true;
		} catch (err) {
			console.error("Error adding task", err);
			toast.error("Falha ao adicionar tarefa. Tente novamente.");
			return false;
		}
	};

	const handleUpdateTask = async (taskId, newTitle, newDescription) => {
		let originalTask;
		try {
			originalTask = tasks.find((task) => task.id === taskId);
			if (!originalTask) return false;

			setTasks((prevTasks) =>
				prevTasks
					.map((t) =>
						t.id === taskId
							? { ...t, title: newTitle, description: newDescription }
							: t,
					)
					.sort((a, b) =>
						(a.created_at || "").localeCompare(b.created_at || ""),
					),
			);

			await updateTask(taskId, newTitle, newDescription, originalTask.status);

			toast.success("Tarefa atualizada com sucesso!");

			return true;
		} catch (err) {
			console.error("Error updating task", err);
			toast.error("Falha ao atualizar tarefa. Tente novamente.");

			if (originalTask) {
				setTasks((prevTasks) =>
					prevTasks.map((t) => (t.id === taskId ? originalTask : t)),
				);
			}
			return false;
		}
	};

	const handleDeleteTask = async (taskId) => {
		try {
			await deleteTask(taskId);
			setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
			toast.success("Tarefa deletada com sucesso!");
		} catch (err) {
			console.error("Error deleting task", err);
			toast.error("Falha ao deletar tarefa. Tente novamente.");
		}
	};

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 3,
			},
		}),
	);

	const handleDragStart = (event) => {
		const task = event.active.data.current.task;
		setActiveTask(task);
	};

	const handleDragEnd = (event) => {
		setActiveTask(null);

		const { active, over } = event;

		if (!over) return;

		const task = active.data.current.task;

		const overId = over.id;

		const overTask = tasks.find((t) => t.id === overId);

		const overColumnTitle = FIXED_COLUMNS.find(
			(c) => c.title === overId,
		)?.title;

		let newStatus = "";

		if (overTask) {
			newStatus = overTask.status;
		} else if (overColumnTitle) {
			newStatus = overColumnTitle;
		} else {
			return;
		}

		if (task.status === newStatus) {
			return;
		}

		setTasks((prevTasks) => {
			return prevTasks.map((t) =>
				t.id === task.id ? { ...t, status: newStatus } : t,
			);
		});

		updateTask(task.id, task.title, task.description || "", newStatus)
			.then(() => {
				toast.success("Tarefa movida com sucesso!");
			})

			.catch((err) => {
				console.error("Error updating task:", err);
				toast.error(
					"Falha ao mover tarefa. A tarefa voltará à coluna original.",
				);
				setTasks((prevTasks) => {
					return prevTasks.map((t) =>
						t.id === task.id ? { ...t, status: task.status } : t,
					);
				});
			});
	};

	// loading return
	if (isLoading) {
		return (
			<div className="m-auto text-center font-bold text-white">
				Carregando tarefas...
			</div>
		);
	}

	// main raturn
	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex flex-col md:flex-row gap-4 m-auto w-full md:w-auto">
				{FIXED_COLUMNS.map((col) => {
					const columnTasks = tasks.filter((task) => task.status === col.title);
					return (
						<Column
							key={col.id}
							title={col.title}
							tasks={columnTasks}
							onTaskAdd={handleAddTask}
							onTaskDelete={handleDeleteTask}
							onTaskUpdate={handleUpdateTask}
							canAddTask={col.id === "todo"}
						/>
					);
				})}
			</div>

			{createPortal(
				<DragOverlay>
					{activeTask && <TaskCard task={activeTask} />}
				</DragOverlay>,
				document.body,
			)}
		</DndContext>
	);
}

export default KanbanBoard;
