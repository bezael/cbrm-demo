import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import { FeedbackStore } from './store.js';

// Demo stand-in for authentication: the caller's id arrives in a header.
// A real app would read it from a verified session or token.
export const userIdOf = (request: FastifyRequest): string | undefined => {
  const header = request.headers['x-user-id'];
  return typeof header === 'string' && header.trim() !== '' ? header.trim() : undefined;
};

export function buildApp(store = new FeedbackStore()) {
  const app = Fastify();

  app.get('/feedback', async () => store.list());

  app.post<{ Body: { title?: unknown } }>('/feedback', async (request, reply) => {
    const userId = userIdOf(request);
    if (!userId) return reply.code(401).send({ error: 'sign in required' });

    const title = typeof request.body?.title === 'string' ? request.body.title.trim() : '';
    if (!title) return reply.code(400).send({ error: 'title is required' });

    return reply.code(201).send(store.create(title, userId));
  });

  const changeVote = (voted: boolean) =>
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const userId = userIdOf(request);
      if (!userId) return reply.code(401).send({ error: 'sign in required' });

      const { id } = request.params;
      const count = voted ? store.vote(id, userId) : store.unvote(id, userId);
      if (count === undefined) return reply.code(404).send({ error: 'feedback item not found' });

      return { voted, count };
    };

  app.put('/feedback/:id/vote', changeVote(true));
  app.delete('/feedback/:id/vote', changeVote(false));

  return app;
}
