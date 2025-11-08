import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function TaskCard({ task, onDelete }) {
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
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0 : 1,
	};

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
			<button
				onClick={(e) => {
					e.stopPropagation();
					onDelete(task.id);
				}}
				className="absolute right-2 top-2 rounded-full p-1 text-gray-400 opacity-0 hover:cursor-pointer hover:bg-gray-600 hover:text-white group-hover:opacity-100"
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
	);
}

export default TaskCard;
