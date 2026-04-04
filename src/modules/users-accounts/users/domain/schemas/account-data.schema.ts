import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false, timestamps: true })
export class AccountData {
  @Prop({
    type: String,
    required: true,
    unique: true,
    minLength: 1,
    maxLength: 50,
  })
  login: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    minLength: 1,
    maxLength: 100,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  })
  passwordHash: string;

  @Prop({
    type: Date,
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  static createInstance(login: string, email: string, passwordHash: string) {
    const accountData = new this();

    accountData.login = login;
    accountData.email = email;
    accountData.passwordHash = passwordHash;

    return accountData;
  }
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
