import { describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.js';

// spec.md §4: each flow end to end through HTTP only, happy and error paths.
describe('voting flows', () => {
  const as = (userId: string) => ({ 'x-user-id': userId });

  const createItem = async (app: ReturnType<typeof buildApp>) => {
    const res = await app.inject({ method: 'POST', url: '/feedback', headers: as('ana'), payload: { title: 'Dark mode' } });
    return res.json<{ id: string }>().id;
  };
  const votesOf = async (app: ReturnType<typeof buildApp>, id: string) =>
    (await app.inject({ url: '/feedback' })).json<Array<{ id: string; votes: number }>>().find((i) => i.id === id)?.votes;

  test('Vote: a signed-in user votes once; an unknown item is 404 and creates nothing', async () => {
    const app = buildApp();
    const id = await createItem(app);

    await app.inject({ method: 'PUT', url: `/feedback/${id}/vote`, headers: as('bob') });
    await app.inject({ method: 'PUT', url: `/feedback/${id}/vote`, headers: as('bob') });
    expect(await votesOf(app, id)).toBe(1);

    // Ids are sequential, so a phantom vote on "2" would attach to the next
    // item created. Vote on it before it exists, then check it starts empty.
    const missing = await app.inject({ method: 'PUT', url: '/feedback/2/vote', headers: as('bob') });
    expect(missing.statusCode).toBe(404);
    const next = await createItem(app);
    expect(next).toBe('2');
    expect(await votesOf(app, next)).toBe(0);
  });

  test('Unvote: removes the vote; without a vote the count stays at zero', async () => {
    const app = buildApp();
    const id = await createItem(app);
    await app.inject({ method: 'PUT', url: `/feedback/${id}/vote`, headers: as('bob') });

    await app.inject({ method: 'DELETE', url: `/feedback/${id}/vote`, headers: as('bob') });
    expect(await votesOf(app, id)).toBe(0);

    const again = await app.inject({ method: 'DELETE', url: `/feedback/${id}/vote`, headers: as('bob') });
    expect(again.statusCode).toBe(200);
    expect(again.json()).toEqual({ voted: false, count: 0 });
  });

  test('Visitor: refused with 401 and the count stays visible and unchanged', async () => {
    const app = buildApp();
    const id = await createItem(app);
    await app.inject({ method: 'PUT', url: `/feedback/${id}/vote`, headers: as('bob') });

    for (const method of ['PUT', 'DELETE'] as const) {
      const res = await app.inject({ method, url: `/feedback/${id}/vote` });
      expect(res.statusCode).toBe(401);
      expect(await votesOf(app, id)).toBe(1);
    }
  });

  // spec.md §6 Performance.
  test('1,000 sequential votes finish in under 1 s', async () => {
    const app = buildApp();
    const id = await createItem(app);
    // Warm-up, deliberately untimed: the first inject pays Fastify's cold start
    // (about 1.7 s in a full run), which is not what this NFR measures.
    await app.inject({ method: 'PUT', url: `/feedback/${id}/vote`, headers: as('warm-up') });
    await app.inject({ method: 'DELETE', url: `/feedback/${id}/vote`, headers: as('warm-up') });

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      await app.inject({ method: 'PUT', url: `/feedback/${id}/vote`, headers: as(`user-${i}`) });
    }
    const elapsed = performance.now() - start;

    expect(await votesOf(app, id)).toBe(1000);
    expect(elapsed).toBeLessThan(1000);
  });
});
