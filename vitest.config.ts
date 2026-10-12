import { defineConfig } from 'vitest/config';

// The first cold run on Windows can take over 5 s to load Fastify; the
// default timeout then fails a passing test.
export default defineConfig({ test: { testTimeout: 15_000 } });
