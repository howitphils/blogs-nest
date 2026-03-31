import { Injectable } from '@nestjs/common';
import { addHours } from 'date-fns/addHours';
import { addSeconds } from 'date-fns/addSeconds';

@Injectable()
export class DateService {
  addHours(hours: number) {
    return addHours(new Date(), hours);
  }
  addSeconds(seconds: number) {
    return addSeconds(new Date(), seconds);
  }
}
