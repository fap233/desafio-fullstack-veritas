import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { toast } from "sonner";

function TaskCard({ task, onDelete, onUpdate }) {
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState(task.title);
	const [editedDescription, setEditedDescription] = useState(
		task.description || "",
	);

	const {
		isDragging,
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
	} = useSortable({
		id: task.id,
		data: {
			task: task,
		},
		disableDragging: isEditing,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0 : 1,
	};

	const handleSave = async () => {
		if (editedTitle.trim() === "") {
			toast.warning("O título da tarefa não pode estar vazio.");
			return;
		}
		const success = await onUpdate(task.id, editedTitle, editedDescription);
		if (success) {
			setIsEditing(false);
		}
	};

	const handleCancel = () => {
		setEditedTitle(task.title);
		setEditedDescription(task.description || "");
		setIsEditing(false);
	};

	// edit mode

	if (isEditing) {
		return (
			<div
				ref={setNodeRef}
				style={style}
				className="rounded-lg bg-gray-700 p-3 shadow-md"
			>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSave();
					}}
					className="flex flex-col gap-2"
				>
					<input
						autoFocus
						type="text"
						value={editedTitle}
						onChange={(e) => setEditedTitle(e.target.value)}
						className="w-full rounded-lg border-gray-600 bg-gray-600 p-2 text-white"
					/>
					<textarea
						value={editedDescription}
						onChange={(e) => setEditedDescription(e.target.value)}
						placeholder="Descrição da tarefa (opcional)"
						className="w-full resize-none rounded-lg border-gray-600 bg-gray-600 p-2 text-white"
					/>
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
			</div>
		);
	}

	// normal mode
	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="relative group cursor-grab rounded-lg bg-gray-700 p-3 shadow-md active:cursor-grabbing"
		>
			<h3 className="font-bold text-white">{task.title}</h3>
			{task.description && (
				<p className="mt-2 text-sm text-gray-300">{task.description}</p>
			)}
			<div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100">
				{/* edit button */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						setIsEditing(true);
					}}
					className="rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-gray-600 hover:text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
						/>
					</svg>
				</button>

				{/* delete button */}

				<button
					onClick={(e) => {
						e.stopPropagation();
						onDelete(task.id);
					}}
					className=" rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-gray-600 hover:text-white"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}

export default TaskCard;
