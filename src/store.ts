export interface FeedbackItem {
  id: string;
  title: string;
  authorId: string;
  createdAt: string;
}

export class FeedbackStore {
  private items = new Map<string, FeedbackItem>();
  // One Set per item: a user votes at most once, and the count is its size.
  private votes = new Map<string, Set<string>>();
  private nextId = 1;

  create(title: string, authorId: string): FeedbackItem {
    const item: FeedbackItem = {
      id: String(this.nextId++),
      title,
      authorId,
      createdAt: new Date().toISOString(),
    };
    this.items.set(item.id, item);
    return item;
  }

  vote(itemId: string, userId: string): number | undefined {
    if (!this.items.has(itemId)) return undefined;
    const voters = this.votes.get(itemId) ?? new Set<string>();
    voters.add(userId);
    this.votes.set(itemId, voters);
    return voters.size;
  }

  unvote(itemId: string, userId: string): number | undefined {
    if (!this.items.has(itemId)) return undefined;
    const voters = this.votes.get(itemId);
    voters?.delete(userId);
    return voters?.size ?? 0;
  }

  get(id: string): FeedbackItem | undefined {
    return this.items.get(id);
  }

  list(): FeedbackItem[] {
    return [...this.items.values()];
  }
}
