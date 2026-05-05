/**
 * Request ID Middleware
 * Attaches a unique request ID to each incoming request.
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.headers['x-request-id'] = (req.headers['x-request-id'] as string) || uuidv4();
    next();
  }
}
