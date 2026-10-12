import { buildApp } from './app.js';

const app = buildApp();
await app.listen({ port: Number(process.env.PORT ?? 3000) });
console.log(`feedback API on http://localhost:${process.env.PORT ?? 3000}`);
