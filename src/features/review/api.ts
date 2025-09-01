// src/features/comment/api.ts
import api from "@/lib/api";

export const getComments = (page = 0, size = 10) =>
  api.get(`/api/v1/comments?page=${page}&size=${size}`);