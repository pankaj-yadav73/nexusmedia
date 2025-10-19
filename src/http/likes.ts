import { api } from "./client";

export const toggleLike = async (postId: number) => {
  const res = await api.post(`/actions/likes`, { postId });
  return res.data;
};

export const getLikes = async (postId: number) => {
  const res = await api.get(`/actions/likes`, { params: { postId } });
  return res.data;
};
