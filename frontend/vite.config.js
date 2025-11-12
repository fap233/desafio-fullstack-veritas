import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
	const isTest = mode === "test";

	const babelPlugins = [];

	// só usa o compiler se NÃO for teste
	if (!isTest) {
		babelPlugins.push("babel-plugin-react-compiler");
	}

	return {
		plugins: [
			react({
				babel: {
					plugins: babelPlugins,
				},
			}),
		],
		test: {
			globals: false,
			environment: "jsdom",
			setupFiles: "./src/setupTests.js",
		},

		// força o Vitest a resolver os módulos corretos do React 19
		resolve: {
			alias: [
				{
					find: "react",
					replacement: path.resolve(__dirname, "node_modules/react"),
				},
				{
					find: "react-dom",
					replacement: path.resolve(__dirname, "node_modules/react-dom"),
				},
				{
					find: "react-dom/client",
					replacement: path.resolve(__dirname, "node_modules/react-dom/client"),
				},
				{
					find: "react/jsx-runtime",
					replacement: path.resolve(
						__dirname,
						"node_modules/react/jsx-runtime",
					),
				},
				{
					find: "react/jsx-dev-runtime",
					replacement: path.resolve(
						__dirname,
						"node_modules/react/jsx-dev-runtime",
					),
				},
			],
		},
	};
});
