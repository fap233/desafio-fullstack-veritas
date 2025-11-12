import { Toaster } from "sonner";
import KanbanBoard from "./components/KanbanBoard";

function App() {
	return (
		<main className="flex min-h-screen w-full overflow-y-auto md:overflow-x-auto md:overflow-y-hidden bg-gray-900 p-4">
			<KanbanBoard />

			<Toaster position="top-right" richColors theme="dark" />
		</main>
	);
}
export default App;
