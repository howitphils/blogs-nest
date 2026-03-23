import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 50,
    trim: true,
  })
  name: string;

  @Prop({
    type: String,
    required: true,
    minlength: 1,
    maxlength: 1000,
    trim: true,
  })
  description: string;

  @Prop({
    type: String,
    required: true,
    match:
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  })
  websiteUrl: string;

  @Prop({ type: String, required: true })
  createdAt: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMemberShip: boolean;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
