import { useMemo, useState } from "react";
import TaskCard from "./TaskCard";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

function Column({
	title,
	tasks,
	onTaskAdd,
	onTaskDelete,
	onTaskUpdate,
	canAddTask,
}) {
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [newTaskTitle, setNewTaskTitle] = useState("");
	const [newTaskDescription, setNewTaskDescription] = useState("");

	const taskIds = useMemo(() => {
		return tasks.map((task) => task.id);
	}, [tasks]);

	const { setNodeRef } = useDroppable({
		id: title,
	});

	const handleSubmit = (e) => {
		e.preventDefault();

		if (newTaskTitle.trim() === "") return;

		onTaskAdd(newTaskTitle, newTaskDescription);

		setNewTaskTitle("");
		setNewTaskDescription("");
		setIsAddingTask(false);
	};

	const handleCancel = () => {
		setNewTaskTitle("");
		setNewTaskDescription("");
		setIsAddingTask(false);
	};

	return (
		<div
			ref={setNodeRef}
			className="flex min-h-[500px] w-[350px] flex-col rounded-lg bg-gray-800"
		>
			{/* Column title */}
			<h2 className="rounded-t-lg bg-gray-900 p-4 font-bold text-white">
				{title}
			</h2>

			{/* Tasks container */}
			<SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
				<div className="flex flex-grow flex-col gap-4 overflow-y-auto p-4">
					{tasks.map((task) => (
						<TaskCard
							key={task.id}
							task={task}
							onDelete={onTaskDelete}
							onUpdate={onTaskUpdate}
						/>
					))}
				</div>
			</SortableContext>

			{canAddTask && (
				<footer className="p-4">
					{!isAddingTask ? (
						<button
							onClick={() => setIsAddingTask(true)}
							className="w-full rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
						>
							+ Adicionar tarefa
						</button>
					) : (
						<form onSubmit={handleSubmit}>
							{/* Title  */}

							<textarea
								autoFocus
								value={newTaskTitle}
								onChange={(e) => setNewTaskTitle(e.target.value)}
								placeholder="Título da tarefa"
								className="w-full resize-none rounded-lg border-gray-600 bg-gray-700 p-2 text-white"
							/>

							{/* Description */}

							<textarea
								value={newTaskDescription}
								onChange={(e) => setNewTaskDescription(e.target.value)}
								placeholder="Descrição da tarefa (opcional)"
								className="w-full resize-none rounded-lg border-gray-600 bg-gray-700 p-2 text-white"
							/>

							{/* Buttons  */}

							<div className="mt-2 flex gap-2">
								{/* save button */}
								<button
									type="submit"
									className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 hover:cursor-pointer"
								>
									Salvar
								</button>

								{/* cancel button */}
								<button
									type="button"
									onClick={handleCancel}
									className="rounded-lg bg-transparent px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:cursor-pointer"
								>
									Cancelar
								</button>
							</div>
						</form>
					)}
				</footer>
			)}
		</div>
	);
}

export default Column;
