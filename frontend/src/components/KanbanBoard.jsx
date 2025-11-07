import Column from "./Column";

const FIXED_COLUMNS = [
	{ id: "todo", title: "A fazer" },
	{ id: "in-progress", title: "Em progresso" },
	{ id: "done", title: "Concluídas" },
];

function KanbanBoard() {
	return (
		<div className="flex gap-4 m-auto">
			{FIXED_COLUMNS.map((col) => (
				<Column key={col.id} title={col.title} />
			))}
		</div>
	);
}

export default KanbanBoard;
