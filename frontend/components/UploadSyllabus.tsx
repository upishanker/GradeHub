"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UploadSyllabus() {
    const [file, setFile] = useState<File | null>(null);
    const [jsonResult, setJsonResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleUpload = async () => {
        if (!file) return alert("Select a file first!");
        setLoading(true);
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("http://localhost:8080/api/ocr", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (!res.ok) {
            alert("Failed to process file");
            setLoading(false);
            return;
        }

        const data = await res.json();
        setJsonResult(data);
        setLoading(false);
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

                {jsonResult && (
                    <pre className=" p-2 rounded-md text-sm mt-4 w-full overflow-auto">
            {JSON.stringify(jsonResult, null, 2)}
          </pre>
                )}
            </CardContent>
        </Card>
    );
}
