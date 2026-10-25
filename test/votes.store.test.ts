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

  test("unvote removes only the caller's vote", () => {
    const store = new FeedbackStore();
    const item = store.create('Dark mode', 'ana');
    store.vote(item.id, 'bob');
    store.vote(item.id, 'carla');

    expect(store.unvote(item.id, 'bob')).toBe(1);
    expect(store.vote(item.id, 'carla')).toBe(1);
  });

  test('unvote without a vote never goes below zero', () => {
    const store = new FeedbackStore();
    const item = store.create('Dark mode', 'ana');

    expect(store.unvote(item.id, 'bob')).toBe(0);
    expect(store.unvote(item.id, 'bob')).toBe(0);
    expect(store.unvote('404', 'bob')).toBeUndefined();
  });
});
