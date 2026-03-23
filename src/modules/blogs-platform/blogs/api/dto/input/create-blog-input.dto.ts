export class BlogInputDto {
  name: string; // max length 15
  description: string; // max length 500
  websiteUrl: string; // max length 100, valid URL
}
