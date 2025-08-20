import { IsString, MaxLength } from 'class-validator';

export class ReportDto {
  @IsString()
  @MaxLength(200)
  content: string;
}
