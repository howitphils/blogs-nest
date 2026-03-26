import { Controller, Delete, Injectable } from '@nestjs/common';
import { ROUTES } from '../core/constants/routes.constants';
import mongoose from 'mongoose';

@Injectable()
@Controller(ROUTES.MAIN.testing)
export class TestingController {
  constructor() {}

  @Delete('all-data')
  async clearDb() {
    const db = mongoose.connection;
    const collections = Object.keys(db.collections);

    for (const collName of collections) {
      await db.collection(collName).deleteMany({});
    }
  }
}
