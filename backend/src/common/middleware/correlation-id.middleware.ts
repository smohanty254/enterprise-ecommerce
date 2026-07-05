import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';

export class CorrelationIdMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = String(req.headers['x-correlation-id'] ?? nanoid());
    req.headers['x-correlation-id'] = id;
    res.setHeader('x-correlation-id', id);
    next();
  }
}
