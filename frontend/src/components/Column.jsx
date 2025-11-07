function Column({ title }) {
	return (
		<div className="flex min-h-[500px] w-[350px] flex-col rounded-lg bg-gray-800">
			{/* Column title */}
			<h2 className="rounded-t-lg bg-gray-900 p-4 font-bold text-white">
				{title}
			</h2>

			<div className="flex flex-grow flex-col gap-4 overflow-y-auto p-4">
				{/* Tasks */}
			</div>
		</div>
	);
}

export default Column;
