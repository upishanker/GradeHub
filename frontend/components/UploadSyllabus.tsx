"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ApiError, apiPostFormData } from "@/utils/api";
import toast from "react-hot-toast";

export default function UploadSyllabus() {
    const [file, setFile] = useState<File | null>(null);
    const [jsonResult, setJsonResult] = useState<unknown>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) {
            toast.error("Select a file first!");
            return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const data = await apiPostFormData("/api/ocr", formData);
            setJsonResult(data);
        } catch (err) {
            console.error(err);
            toast.error(
                err instanceof ApiError ? "Failed to process file" : "An error occurred"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="max-w-xl mx-auto mt-10 p-4">
            <CardHeader className="text-2xl font-bold text-center">
                Upload Syllabus
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                />
                <Button onClick={handleUpload} disabled={loading}>
                    {loading ? "Processing..." : "Upload & Parse"}
                </Button>

                {jsonResult ? (
                    <pre className=" p-2 rounded-md text-sm mt-4 w-full overflow-auto">
            {JSON.stringify(jsonResult, null, 2)}
          </pre>
                ) : null}
            </CardContent>
        </Card>
    );
}
