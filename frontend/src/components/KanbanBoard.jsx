import { useEffect, useState } from "react";
import Column from "./Column";
import axios from "axios";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import * as ReactDOM from "react-dom";

const FIXED_COLUMNS = [
	{ id: "todo", title: "A Fazer" },
	{ id: "in_progress", title: "Em Progresso" },
	{ id: "done", title: "Concluídas" },
];

const API_URL = "http://localhost:8080";

function KanbanBoard() {
	const [tasks, setTasks] = useState([]);

	const [activeTask, setActiveTask] = useState(null);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const response = await axios.get(`${API_URL}/tasks`);

				const fetchedTasks = response.data || [];

				fetchedTasks.sort((a, b) => parseInt(a.id) - parseInt(b.id));

				setTasks(fetchedTasks);
			} catch (err) {
				console.error("Error fetching tasks", err);
			}
		};

		fetchTasks();
	}, []);

	const handleAddTask = async (title, description) => {
		try {
			const response = await axios.post(`${API_URL}/tasks`, {
				title: title,
				description: description,
			});

			const newTask = response.data;
			setTasks((prevTasks) =>
				[...prevTasks, newTask].sort((a, b) => parseInt(a.id) - parseInt(b.id)),
			);
		} catch (err) {
			console.error("Error adding task", err);
		}
	};

	const handleUpdateTask = async (taskId, newTitle, newDescription) => {
		let originalTask;
		try {
			originalTask = tasks.find((task) => task.id === taskId);
			if (!originalTask) return;

			const updatedTaskPayload = {
				title: newTitle,
				description: newDescription,
				status: originalTask.status,
			};

			setTasks((prevTasks) =>
				prevTasks
					.map((t) =>
						t.id === taskId
							? { ...t, title: newTitle, description: newDescription }
							: t,
					)
					.sort((a, b) => parseInt(a.id) - parseInt(b.id)),
			);

			await axios.put(`${API_URL}/tasks/${taskId}`, updatedTaskPayload);
		} catch (err) {
			console.error("Error updating task", err);

			if (originalTask) {
				setTasks((prevTasks) =>
					prevTasks.map((t) => (t.id === taskId ? originalTask : t)),
				);
			}
		}
	};

	const handleDeleteTask = async (taskId) => {
		try {
			await axios.delete(`${API_URL}/tasks/${taskId}`);
			setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
		} catch (err) {
			console.error("Error deleting task", err);
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

		const updatedTaskPayload = {
			title: task.title,
			description: task.description || "",
			status: newStatus,
		};

		axios
			.put(`${API_URL}/tasks/${task.id}`, updatedTaskPayload)
			.then(() => {})

			.catch((err) => {
				console.error("Error updating task:", err);
				setTasks((prevTasks) => {
					return prevTasks.map((t) =>
						t.id === task.id ? { ...t, status: task.status } : t,
					);
				});
			});
	};

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex gap-4 m-auto">
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

			{ReactDOM.createPortal(
				<DragOverlay>
					{activeTask && <TaskCard task={activeTask} />}
				</DragOverlay>,
				document.body,
			)}
		</DndContext>
	);
}

export default KanbanBoard;
