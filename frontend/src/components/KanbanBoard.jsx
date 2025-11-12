import { useState } from "react";
import Column from "./Column";
import {
	DndContext,
	DragOverlay,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import { createPortal } from "react-dom";
import { useKanban } from "../hooks/useKanban";

// colunas fixas do Kanban Board

const FIXED_COLUMNS = [
	{ id: "todo", title: "A Fazer" },
	{ id: "in_progress", title: "Em Progresso" },
	{ id: "done", title: "Concluídas" },
];

// funcionalidade do Kanban Board

function KanbanBoard() {
	const { tasks, isLoading, addTask, updateTaskDetails, removeTask, moveTask } =
		useKanban();

	const [activeTask, setActiveTask] = useState(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 3 },
		}),
	);

	const handleDragStart = (event) => {
		setActiveTask(event.active.data.current.task);
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

		moveTask(task, newStatus);
	};

	if (isLoading) {
		return (
			<div className="m-auto text-center font-bold text-white">
				Carregando tarefas...
			</div>
		);
	}

	return (
		<DndContext
			sensors={sensors}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
		>
			<div className="flex flex-col md:flex-row gap-4 m-auto w-full md:w-auto">
				{FIXED_COLUMNS.map((col) => (
					<Column
						key={col.id}
						title={col.title}
						tasks={tasks.filter((task) => task.status === col.title)}
						onTaskAdd={addTask}
						onTaskDelete={removeTask}
						onTaskUpdate={(id, title, desc) =>
							updateTaskDetails(id, title, desc, col.title)
						}
						canAddTask={col.id === "todo"}
					/>
				))}
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
