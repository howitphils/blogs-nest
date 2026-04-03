import { IsString, IsUrl, Length, MaxLength } from 'class-validator';

export class BlogInputDto {
  @IsString()
  @Length(3, 15)
  name: string; // max length 15

  @IsString()
  @MaxLength(500)
  description: string; // max length 500

  @IsString()
  @IsUrl()
  websiteUrl: string; // max length 100, valid URL
}
