import type { components } from "@/lib/backend/apiV1/schema";
import { apiFetch } from "@/lib/backend/client";
import { useEffect, useState } from "react";

type ReviewDto = components["schemas"]["ReviewDetailDto"];

export function useReview(id: number) {
  const [review, setReview] = useState<ReviewDto | null>(null);

  useEffect(() => {
    let isCancelled = false;

    apiFetch(`/api/v1/reviews/${id}`)
      .then((data) => {
        if (!isCancelled) {
          setReview(data);
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          console.error(`${error.resultCode} : ${error.msg}`);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  const deleteReview = (onSuccess: () => void) => {
    apiFetch(`/api/v1/reviews/${id}`, {
      method: "DELETE",
    })
      .then(onSuccess)
      .catch((error) => {
        console.error(`${error.resultCode} : ${error.msg}`);
      });
  };

  const verifyPassword = async (password: string) => {
    return apiFetch(`/api/v1/reviews/${id}/verify-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",  // ✅ JSON 명시
      },
      body: JSON.stringify({ password }),
    })
      .then((res) => {
        // RsData<Boolean> 구조라면
        return res.data === true;
      })
      .catch((error) => {
        console.error(`${error.resultCode} : ${error.msg}`);
        throw new Error(error.msg);
      });
  };
  

  return { id, review, deleteReview, verifyPassword };
}