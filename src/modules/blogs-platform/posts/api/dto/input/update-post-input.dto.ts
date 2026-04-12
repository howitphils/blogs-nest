import { Length, MaxLength } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/string-with-trim.decorator';
import { createPostInputRestrictions } from './restrictions/create-post-input.restrictions';

export class UpdatePostInputDto {
  @IsStringWithTrim()
  @Length(
    createPostInputRestrictions.title.minLength,
    createPostInputRestrictions.title.maxLength,
  )
  title: string;

  @IsStringWithTrim()
  @Length(
    createPostInputRestrictions.shortDescription.minLength,
    createPostInputRestrictions.shortDescription.maxLength,
  )
  shortDescription: string;

  @IsStringWithTrim()
  @MaxLength(createPostInputRestrictions.content.maxLength)
  content: string;

  @IsStringWithTrim()
  blogId: string;
}
