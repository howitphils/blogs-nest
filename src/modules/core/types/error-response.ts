export class FieldError {
  field: string;
  message: string;
}

export class ErrorResponse {
  errorsMessages: FieldError[];
}
