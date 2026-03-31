import { Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';

@Injectable()
export class PasswordService {
  async generateHash(password: string): Promise<string> {
    return hash(password);
  }

  async verifyHash(hash: string, password: string): Promise<boolean> {
    return verify(hash, password);
  }
}
