import { InjectConnection } from '@nestjs/mongoose';
import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ROUTES } from '../core/constants/routes.constants';
import { Connection } from 'mongoose';

@Injectable()
@Controller(ROUTES.MAIN.testing)
export class TestingController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Delete(ROUTES.SUB.allData)
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearDb() {
    const collections = this.connection.collections;
    const collectionNames = Object.keys(collections);

    for (const collectionName of collectionNames) {
      await collections[collectionName].deleteMany({});
    }
  }
}
