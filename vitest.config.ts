import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			include: ["src/**/*.{ts,tsx,js,jsx}"],
			provider: "v8",
		},
		environment: "node",
		globals: true,
	},
});
