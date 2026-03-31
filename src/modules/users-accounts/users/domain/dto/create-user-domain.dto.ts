export class CreateUserDomainDto {
  login: string;
  email: string;
  passwordHash: string;
  confirmationCode: string;
  expDate: Date;
  isConfirmed: boolean;
}
