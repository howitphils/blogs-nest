import { Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { errorMessages } from '../constants/error-messages.constants';
import { DomainValidationException } from '../exception-filters/exceptions/domain-validation.exception';

@Injectable()
export class MongoIdValidationPipe implements PipeTransform {
  transform(value: string) {
    if (!isValidObjectId(value)) {
      throw new DomainValidationException([
        { field: 'id', message: errorMessages.INCORRECT_ID_TYPE },
      ]);
    }
    return value;
  }
}
