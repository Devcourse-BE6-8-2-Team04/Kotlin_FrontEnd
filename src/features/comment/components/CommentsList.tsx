"use client";

import React from "react";
import { Search } from "lucide-react";
import { CommentItem } from "./CommentItem";
import type { components } from "@/lib/backend/apiV1/schema";

type CommentDto = components["schemas"]["CommentDto"];

interface CommentsListProps {
  comments: CommentDto[];
  totalElements: number;
  page: number;
}

export function CommentsList({ comments, totalElements, page }: CommentsListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 mb-4">
          <Search size={48} className="mx-auto" />
        </div>
        <p className="text-gray-500 text-lg">글이 없습니다</p>
        <p className="text-gray-400 text-sm mt-2">새로운 코멘트를 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-8">
      {comments.map((comment, index) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          index={index}
          totalElements={totalElements}
          page={page}
        />
      ))}
    </div>
  );
}