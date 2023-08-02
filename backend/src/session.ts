import { Request } from 'express';
import { Session } from 'express-session';

export interface SessionData extends Session {
  req: Request;
  userId: number;
  bandId: number;
  role: string;
}
