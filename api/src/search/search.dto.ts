export class SearchPostDto {
  id: number;
  title: string;
  summary: string;
  tags: string[];
  author: { id: number; nickname: string };
}
