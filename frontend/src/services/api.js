import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"; // production fallback

const api = axios.create({
	baseURL: API_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

export const getTasks = async () => {
	const response = await api.get("/tasks");
	return response.data || [];
};

export const createTask = async (title, description) => {
	const response = await api.post("/tasks", { title, description });
	return response.data;
};

export const updateTask = async (id, title, description, status) => {
	const payload = {
		title,
		description,
		status,
	};

	const response = await api.put(`/tasks/${id}`, payload);
	return response.data;
};

export const deleteTask = async (id) => {
	await api.delete(`/tasks/${id}`);
};
