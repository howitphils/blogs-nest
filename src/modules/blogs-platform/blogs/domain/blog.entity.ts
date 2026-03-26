import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog-domain.dto';
import { UpdateBlogDomainDto } from './dto/update-blog-domain.dto';
import { BadRequestException } from '@nestjs/common';

@Schema({ timestamps: true })
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

  @Prop({ type: Date, required: true, nullable: true, default: null })
  deletedAt: Date | null;

  updatedAt: Date;
  createdAt: Date;

  @Prop({ type: Boolean, required: true, default: false })
  isMemberShip: boolean;

  static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.createdAt = new Date();

    return blog as BlogDocument;
  }

  update(dto: UpdateBlogDomainDto) {
    const { description, name, websiteUrl } = dto;
    this.websiteUrl = websiteUrl;
    this.description = description;
    this.name = name;
  }

  delete() {
    if (this.deletedAt !== null) {
      throw new BadRequestException('Blog is already deleted');
    }

    this.deletedAt = new Date();
  }
}

export type BlogDocument = HydratedDocument<Blog>;

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.loadClass(Blog);

export type BlogModelType = Model<BlogDocument> & typeof Blog;
