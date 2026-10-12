import { describe, expect, test } from 'vitest';
import { FeedbackStore } from '../src/store.js';

describe('voting in the store', () => {
  test("a user's second vote does not change the count", () => {
    const store = new FeedbackStore();
    const item = store.create('Dark mode', 'ana');

    expect(store.vote(item.id, 'bob')).toBe(1);
    expect(store.vote(item.id, 'bob')).toBe(1);
    expect(store.vote(item.id, 'carla')).toBe(2);
  });

  test('voting for an unknown item creates nothing', () => {
    const store = new FeedbackStore();
    expect(store.vote('404', 'bob')).toBeUndefined();
  });
});
