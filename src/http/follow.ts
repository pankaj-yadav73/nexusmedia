import { api } from "./client";

export const followUser = async (targetUserId: number | string) => {
  const response = await api.post("/actions/follow", {
    targetUserId,
    action: "follow",
  });
  return response.data;
};

export const unfollowUser = async (targetUserId: number | string) => {
  const response = await api.post("/actions/follow", {
    targetUserId,
    action: "unfollow",
  });
  return response.data;
};

export const getFollowSuggestions = async () => {
  const response = await api.get("/actions/follow");
  return response.data;
};
