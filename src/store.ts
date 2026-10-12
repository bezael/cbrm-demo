export interface FeedbackItem {
  id: string;
  title: string;
  authorId: string;
  createdAt: string;
}

export class FeedbackStore {
  private items = new Map<string, FeedbackItem>();
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

  get(id: string): FeedbackItem | undefined {
    return this.items.get(id);
  }

  list(): FeedbackItem[] {
    return [...this.items.values()];
  }
}
