/* eslint-disable @typescript-eslint/no-unused-vars */
export class EmailServiceMock {
  sendPasswordRecoveryEmail(email: string, code: string): Promise<void> {
    console.log('password recovery email was sent');

    return new Promise((res) => res());
  }

  sendRegistrationEmail(email: string, code: string): Promise<void> {
    console.log('registration email was sent');

    return new Promise((res) => res());
  }
}
