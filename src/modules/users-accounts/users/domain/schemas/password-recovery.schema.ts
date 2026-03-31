import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PasswordRecovery {
  @Prop({
    type: String,
    required: true,
    nullable: true,
    default: null,
  })
  recoveryCode: string | null;

  @Prop({
    type: Date,
    required: true,
    default: () => new Date(),
  })
  expDate: Date;
}

export const PasswordRecoverySchema =
  SchemaFactory.createForClass(PasswordRecovery);
