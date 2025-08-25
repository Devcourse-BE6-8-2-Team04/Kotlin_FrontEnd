"use client";

import React, { use } from "react";
import { useComment } from "@/features/comment/hooks/useComment";
import { CommentInfo } from "@/features/comment/components/CommentInfo";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = use(params);
  const id = parseInt(idStr);

  const commentState = useComment(id);

  return <CommentInfo commentState={commentState} />;
}