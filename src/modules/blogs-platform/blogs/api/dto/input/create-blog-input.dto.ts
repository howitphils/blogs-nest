import { IsUrl, Length, MaxLength } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';
import { blogInputRestrictions } from './blog-input.restrictions';

export class BlogInputDto {
  @IsStringWithTrim()
  @Length(
    blogInputRestrictions.name.minLength,
    blogInputRestrictions.name.maxLength,
  )
  name: string; // max length 15

  @IsStringWithTrim()
  @MaxLength(blogInputRestrictions.description.maxLength)
  description: string; // max length 500

  @IsStringWithTrim()
  @MaxLength(blogInputRestrictions.websiteUrl.maxLength)
  @IsUrl()
  websiteUrl: string; // max length 100, valid URL
}
