import React, { useState } from "react";

type Props = {
    onClose: () => void;
    onCreate: (comment: string) => void;
};

export default function Modal({ onClose, onCreate }: Props) {
    const [comment, setComment] = useState("");

    return (
        <div className="fixed inset-0  bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
                <h2 className="text-lg font-bold mb-4 text-black">코멘트 작성</h2>
                <textarea
                    className="w-full h-24 p-2 border rounded text-gray-500"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="코멘트를 입력하세요"
                />
                <div className="flex justify-end mt-6 gap-2">
                    <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded text-black">취소</button>
                    <button
                        onClick={() => onCreate(comment)}
                        className={`px-3 py-1 rounded ${comment ? "bg-blue-500 text-black" : "bg-gray-300 text-black"}`}
                        disabled={!comment}
                    >
                        등록
                    </button>
                </div>
            </div>
        </div>
    );
}