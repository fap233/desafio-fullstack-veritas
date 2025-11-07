import { useEffect, useState } from "react";
import Column from "./Column";
import axios from "axios";

const FIXED_COLUMNS = [
	{ id: "todo", title: "A Fazer" },
	{ id: "in_progress", title: "Em Progresso" },
	{ id: "done", title: "Concluídas" },
];

const API_URL = "http://localhost:8080";

function KanbanBoard() {
	const [tasks, setTasks] = useState([]);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const response = await axios.get(`${API_URL}/tasks`);

				setTasks(response.data || []);
			} catch (err) {
				console.error("Error fetching tasks", err);
			}
		};

		fetchTasks();
	}, []);

	const handleAddTask = async (title) => {
		try {
			const response = await axios.post(`${API_URL}/tasks`, {
				title: title,
			});

			const newTask = response.data;
			setTasks([...tasks, newTask]);
		} catch (err) {
			console.error("Error adding task", err);
		}
	};
	return (
		<div className="flex gap-4 m-auto">
			{FIXED_COLUMNS.map((col) => {
				const columnTasks = tasks.filter((task) => task.status === col.title);
				return (
					<Column
						key={col.id}
						title={col.title}
						tasks={columnTasks}
						onTaskAdd={handleAddTask}
					/>
				);
			})}
		</div>
	);
}

export default KanbanBoard;
