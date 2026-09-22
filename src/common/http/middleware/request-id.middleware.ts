import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

@Injectable()
class RequestIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'] & { headers: Record<string, any>; id?: string }, res: FastifyReply['raw'], next: () => void): void {
    
    const existingId = req.headers['x-request-id'];
    const requestId = typeof existingId === 'string' ? existingId : randomUUID();

    req.headers['x-request-id'] = requestId;
    
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('x-request-id', requestId);
    }

    next();
  }
}

export { RequestIdMiddleware };