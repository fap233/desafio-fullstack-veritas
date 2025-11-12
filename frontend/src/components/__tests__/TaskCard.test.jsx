import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TaskCard from "../TaskCard";

// mock do dnd-kit para isolar o componente visual
vi.mock("@dnd-kit/sortable", () => ({
	useSortable: () => ({
		attributes: {},
		listeners: {},
		setNodeRef: vi.fn(),
		transform: null,
		transition: null,
		isDragging: false,
	}),
}));

// mock do CSS utilities
vi.mock("@dnd-kit/utilities", () => ({
	CSS: {
		Transform: {
			toString: vi.fn(),
		},
	},
}));

describe("TaskCard Component", () => {
	const mockTask = {
		id: "1",
		title: "Test Task",
		description: "Test Description",
		status: "todo",
	};

	const mockOnDelete = vi.fn();
	const mockOnUpdate = vi.fn();

	it("deve renderizar o título e a descrição da tarefa", () => {
		render(
			<TaskCard
				task={mockTask}
				onDelete={mockOnDelete}
				onUpdate={mockOnUpdate}
			/>,
		);

		expect(screen.getByText("Test Task")).toBeInTheDocument();
		expect(screen.getByText("Test Description")).toBeInTheDocument();
	});

	it("deve entrar em modo de edição ao clicar no botão de editar", () => {
		render(
			<TaskCard
				task={mockTask}
				onDelete={mockOnDelete}
				onUpdate={mockOnUpdate}
			/>,
		);

		const editButton = screen.getByRole("button", { name: /editar tarefa/i });
		fireEvent.click(editButton);

		const input = screen.getByDisplayValue("Test Task");
		expect(input).toBeInTheDocument();
	});

	it("deve chamar onDelete quando o botão de excluir for clicado", () => {
		render(
			<TaskCard
				task={mockTask}
				onDelete={mockOnDelete}
				onUpdate={mockOnUpdate}
			/>,
		);

		const deleteButton = screen.getByRole("button", {
			name: /excluir tarefa/i,
		});
		fireEvent.click(deleteButton);

		expect(mockOnDelete).toHaveBeenCalledWith("1");
	});
});
