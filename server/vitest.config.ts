import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/vitest.setup.ts"],
    testTimeout: 30000,    // MongoDB ops can be slow
    hookTimeout: 30000,
    // Run tests serially within each file to avoid DB race conditions
    sequence: { concurrent: false },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/modules/**/*.service.ts"],
    },
  },
});
