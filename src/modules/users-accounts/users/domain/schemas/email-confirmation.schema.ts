import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({
    type: String,
    required: true,
  })
  confirmationCode: string;

  @Prop({
    type: Date,
    required: true,
  })
  expDate: Date;

  @Prop({
    type: Boolean,
    required: true,
  })
  isConfirmed: boolean;

  static createInstance(
    confirmationCode: string,
    expDate: Date,
    isConfirmed: boolean,
  ) {
    const emailConfirmation = new this();

    emailConfirmation.confirmationCode = confirmationCode;
    emailConfirmation.expDate = expDate;
    emailConfirmation.isConfirmed = isConfirmed;

    return emailConfirmation;
  }
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
