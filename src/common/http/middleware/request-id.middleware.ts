import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = req.get('x-request-id') || randomUUID();
    req.id = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
