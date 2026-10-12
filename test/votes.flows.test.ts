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

    const missing = await app.inject({ method: 'PUT', url: '/feedback/999/vote', headers: as('bob') });
    expect(missing.statusCode).toBe(404);
    expect((await app.inject({ url: '/feedback' })).json()).toHaveLength(1);
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

    const res = await app.inject({ method: 'PUT', url: `/feedback/${id}/vote` });
    expect(res.statusCode).toBe(401);
    expect(await votesOf(app, id)).toBe(1);
  });

  // spec.md §6 Performance.
  test('1,000 sequential votes finish in under 1 s', async () => {
    const app = buildApp();
    const id = await createItem(app);

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      await app.inject({ method: 'PUT', url: `/feedback/${id}/vote`, headers: as(`user-${i}`) });
    }
    const elapsed = performance.now() - start;

    expect(await votesOf(app, id)).toBe(1000);
    expect(elapsed).toBeLessThan(1000);
  });
});
