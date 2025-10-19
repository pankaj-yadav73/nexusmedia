import { api } from "./client";

export const createPost = async (data: FormData) => {
  const response = await api.post("/userposts", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getPost = async () => {
  const response = await api.get("/userposts");
  return await response.data;
};
