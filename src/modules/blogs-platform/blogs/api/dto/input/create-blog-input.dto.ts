import { IsUrl, Length, MaxLength } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';
import { createBlogInputRestrictions } from './restrictions/create-blog-input.restrictions';

export class BlogInputDto {
  @IsStringWithTrim()
  @Length(
    createBlogInputRestrictions.name.minLength,
    createBlogInputRestrictions.name.maxLength,
  )
  name: string;

  @IsStringWithTrim()
  @MaxLength(createBlogInputRestrictions.description.maxLength)
  description: string;

  @IsStringWithTrim()
  @MaxLength(createBlogInputRestrictions.websiteUrl.maxLength)
  @IsUrl()
  websiteUrl: string;
}
