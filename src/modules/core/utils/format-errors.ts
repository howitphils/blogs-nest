import { ValidationError } from '@nestjs/common';

export const formatErrors = (errors: ValidationError[]) => {
  return errors.map((error) => {
    const messagesObj = error.constraints;
    const message = messagesObj
      ? Object.values(messagesObj)[0]
      : 'Unexpected error';

    return {
      field: error.property,
      message: message,
    };
  });
};
