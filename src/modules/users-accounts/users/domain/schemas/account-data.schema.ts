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
    required: true,
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
