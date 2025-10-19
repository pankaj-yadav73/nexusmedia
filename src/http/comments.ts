import { api } from "./client";

export const createComment = async (
  postId: number,
  content: string,
  parentCommentId?: number | null
) => {
  const res = await api.post(`/actions/comments`, {
    postId,
    content,
    parentCommentId,
  });
  return res.data;
};

export const getComments = async (postId: number) => {
  const res = await api.get(`/actions/comments`, { params: { postId } });
  return res.data;
};
