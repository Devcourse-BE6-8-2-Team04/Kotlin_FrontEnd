import { CommentCreateForm } from "@/features/comment/components/CommentCreateForm";

export default function CreatePage() {
    return (
        <main className="min-h-screen bg-gray-50 pb-[73px]">
            <div className="px-4 py-6 max-w-4xl mx-auto">
                <CommentCreateForm />
            </div>
        </main>
    );
}