import { describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.js';
import { FeedbackStore } from '../src/store.js';

const setup = () => {
  const store = new FeedbackStore();
  const item = store.create('Dark mode', 'ana');
  return { app: buildApp(store), store, item };
};

const as = (userId: string) => ({ 'x-user-id': userId });

describe('voting over HTTP', () => {
  test('a visitor cannot vote or unvote, and nothing changes', async () => {
    const { app, store, item } = setup();
    store.vote(item.id, 'bob');

    const put = await app.inject({ method: 'PUT', url: `/feedback/${item.id}/vote` });
    const del = await app.inject({ method: 'DELETE', url: `/feedback/${item.id}/vote` });

    expect(put.statusCode).toBe(401);
    expect(del.statusCode).toBe(401);
    expect(put.json()).toEqual({ error: 'sign in required' });
    expect(del.json()).toEqual({ error: 'sign in required' });
    // Read the count without changing it: an idempotent vote() here would
    // restore a vote the visitor's DELETE removed and hide the bug.
    expect(store.list()[0]?.votes).toBe(1);
  });

  test('PUT votes once and is idempotent', async () => {
    const { app, item } = setup();
    const vote = () => app.inject({ method: 'PUT', url: `/feedback/${item.id}/vote`, headers: as('bob') });

    const first = await vote();
    const second = await vote();

    expect(first.statusCode).toBe(200);
    expect(first.json()).toEqual({ voted: true, count: 1 });
    expect(second.json()).toEqual({ voted: true, count: 1 });
  });

  test('DELETE removes the vote and returns the new count', async () => {
    const { app, store, item } = setup();
    store.vote(item.id, 'bob');
    store.vote(item.id, 'carla');

    const res = await app.inject({ method: 'DELETE', url: `/feedback/${item.id}/vote`, headers: as('bob') });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ voted: false, count: 1 });

    // The vote left is carla's: removing it brings the count to zero.
    const carla = await app.inject({ method: 'DELETE', url: `/feedback/${item.id}/vote`, headers: as('carla') });
    expect(carla.json()).toEqual({ voted: false, count: 0 });
  });

  test('an unknown item returns 404 for both verbs', async () => {
    const { app } = setup();
    for (const method of ['PUT', 'DELETE'] as const) {
      const res = await app.inject({ method, url: '/feedback/404/vote', headers: as('bob') });
      expect(res.statusCode).toBe(404);
      expect(res.json()).toEqual({ error: 'feedback item not found' });
    }
  });

  test('GET /feedback shows the vote count of every item', async () => {
    const { app, store, item } = setup();
    const other = store.create('Export to CSV', 'bob');
    store.vote(item.id, 'bob');
    store.vote(item.id, 'carla');

    const res = await app.inject({ url: '/feedback' });

    expect(res.json()).toEqual([
      expect.objectContaining({ id: item.id, votes: 2 }),
      expect.objectContaining({ id: other.id, votes: 0 }),
    ]);
  });
});
