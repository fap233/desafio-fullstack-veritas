function TaskCard({ task }) {
	return (
		<div className="cursor-grab rounded-lg bg-gray-700 p-3 shadow-md active:cursor-grabbing">
			<h3 className="font-bold text-white">{task.title}</h3>
			{task.description && (
				<p className="mt-2 text-sm text-gray-300">{task.description}</p>
			)}
		</div>
	);
}

export default TaskCard;
