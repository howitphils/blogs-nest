import { CreateUserDomainDto } from './dto/create-user-domain.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AccountData, AccountDataSchema } from './schemas/account-data.schema';
import {
  EmailConfirmation,
  EmailConfirmationSchema,
} from './schemas/email-confirmation.schema';
import {
  PasswordRecovery,
  PasswordRecoverySchema,
} from './schemas/password-recovery.schema';
import { HydratedDocument, Model } from 'mongoose';
import { DomainException } from '../../../core/exception-filters/exceptions/domain.exception';
import { DomainExceptionCode } from '../../../core/exception-filters/exceptions/domain.exception-code';
import { errorMessages } from '../../../core/constants/error-messages.constants';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: AccountDataSchema, required: true })
  accountData: AccountData;

  @Prop({ type: EmailConfirmationSchema, required: true })
  emailConfirmation: EmailConfirmation;

  @Prop({ type: PasswordRecoverySchema, required: true })
  passwordRecovery: PasswordRecovery;

  static createInstance(dto: CreateUserDomainDto): UserDocument {
    const {
      confirmationCode,
      email,
      expDate,
      isConfirmed,
      login,
      passwordHash,
    } = dto;

    const user = new this();

    user.accountData = AccountData.createInstance(login, email, passwordHash);
    user.emailConfirmation = EmailConfirmation.createInstance(
      confirmationCode,
      expDate,
      isConfirmed,
    );
    user.passwordRecovery = PasswordRecovery.createInstance();

    return user as UserDocument;
  }

  delete() {
    if (this.accountData.deletedAt !== null) {
      throw new DomainException(
        errorMessages.USER_DELETED,
        DomainExceptionCode.BAD_REQUEST,
      );
    }

    this.accountData.deletedAt = new Date();
  }

  confirmEmail() {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException(
        errorMessages.EMAIL_CONFIRMED,
        DomainExceptionCode.BAD_REQUEST,
      );
    }

    if (this.emailConfirmation.expDate < new Date()) {
      throw new DomainException(
        errorMessages.CONFIRMATION_CODE_EXPIRED,
        DomainExceptionCode.BAD_REQUEST,
      );
    }

    this.emailConfirmation.isConfirmed = true;
    this.emailConfirmation.expDate = new Date();
  }

  updateConfirmationInfo(newCode: string, newExp: Date) {
    if (this.emailConfirmation.isConfirmed) {
      throw new DomainException(
        errorMessages.EMAIL_CONFIRMED,
        DomainExceptionCode.BAD_REQUEST,
      );
    }

    this.emailConfirmation.confirmationCode = newCode;
    this.emailConfirmation.expDate = newExp;
  }

  updatePasswordRecoveryInfo(newCode: string, newExp: Date) {
    if (!this.emailConfirmation.isConfirmed) {
      throw new DomainException(
        errorMessages.EMAIL_NOT_CONFIRMED,
        DomainExceptionCode.BAD_REQUEST,
      );
    }

    this.passwordRecovery.recoveryCode = newCode;
    this.passwordRecovery.expDate = newExp;
  }

  updatePasswordHash(newHash: string) {
    if (this.passwordRecovery.expDate < new Date()) {
      throw new DomainException(
        errorMessages.RECOVERY_CODE_EXPIRED,
        DomainExceptionCode.BAD_REQUEST,
      );
    }

    this.accountData.passwordHash = newHash;
    this.passwordRecovery.recoveryCode = null;
    this.passwordRecovery.expDate = new Date();
  }
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserModelType = Model<UserDocument> & typeof User;
