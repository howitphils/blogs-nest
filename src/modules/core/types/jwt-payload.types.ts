import { JwtPayload } from 'jsonwebtoken';

export interface JwtPayloadAccess extends JwtPayload {
  userId: string;
}

export interface JwtPayloadRefresh extends JwtPayload {
  userId: string;
  deviceId: string;
}
