import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PasswordRecovery {
  @Prop({
    type: String,
    default: null,
  })
  recoveryCode: string | null;

  @Prop({
    type: Date,
    required: true,
    default: () => new Date(),
  })
  expDate: Date;

  static createInstance() {
    return new this();
  }
}

export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);
