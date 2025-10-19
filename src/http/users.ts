import { api } from "./client";

export const getUserProfile = async (id: number | string) => {
  const response = await api.get(`/actions/users/${id}`);
  return response.data;
};
