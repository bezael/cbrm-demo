import { describe, expect, test } from 'vitest';
import { buildApp } from '../src/app.js';

describe('feedback items', () => {
  test('a signed-in user creates an item and everyone can list it', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/feedback',
      headers: { 'x-user-id': 'ana' },
      payload: { title: 'Dark mode' },
    });
    expect(created.statusCode).toBe(201);
    expect(created.json()).toMatchObject({ id: '1', title: 'Dark mode', authorId: 'ana' });

    const list = await app.inject({ url: '/feedback' });
    expect(list.json()).toHaveLength(1);
  });

  test('a visitor cannot create an item', async () => {
    const res = await buildApp().inject({ method: 'POST', url: '/feedback', payload: { title: 'x' } });
    expect(res.statusCode).toBe(401);
  });

  test('an empty title is rejected', async () => {
    const res = await buildApp().inject({
      method: 'POST',
      url: '/feedback',
      headers: { 'x-user-id': 'ana' },
      payload: { title: '   ' },
    });
    expect(res.statusCode).toBe(400);
  });
});
