export class CommentLikeCardDto {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  createdAt: Date;
  likeCount: number;
}
