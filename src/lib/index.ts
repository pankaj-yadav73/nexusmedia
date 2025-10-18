export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl: string | null;
  videoUrl: string | null;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
