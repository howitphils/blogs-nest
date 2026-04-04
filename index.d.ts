// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express from 'express';

// DON'T ACCESS req.user IN ENDPOINTS WITH NO JWTAUTH PROTECTION ADDED

declare global {
  namespace Express {
    export interface Request {
      user: {
        userId: string;
        deviceId?: string;
      };
    }
  }
}
