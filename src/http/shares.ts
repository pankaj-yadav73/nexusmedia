import { api } from "./client";

export const createShare = async (postId: number, caption?: string) => {
  const res = await api.post(`/actions/shares`, { postId, caption });
  return res.data;
};

export const getShares = async (postId: number) => {
  const res = await api.get(`/actions/shares`, { params: { postId } });
  return res.data;
};
