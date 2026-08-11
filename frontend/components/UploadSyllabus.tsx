"use client";
import { useState } from "react";
import { mutate } from "swr";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiPost, apiPostFormData } from "@/utils/api";
import { Category } from "@/utils/types";
import toast from "react-hot-toast";

/**
 * A single reviewable row parsed out of the OCR response. `weight` is held as a
 * string so the number input can be cleared while typing without collapsing to
 * NaN; it is coerced once, at apply time.
 */
type ParsedRow = {
    /** Stable key — index keys would reshuffle inputs when a row is removed. */
    key: number;
    name: string;
    weight: string;
};

let rowKeySeq = 0;
const nextRowKey = () => ++rowKeySeq;

/**
 * The backend returns `Map<String, Object>` of category-name -> weight
 * (see OCRController / ParseService, which asks Gemini for lowercase category
 * keys and numeric percentage values). The model occasionally nests the map one
 * level deep, so unwrap a single level of plain objects before giving up.
 */
function parseOcrResult(data: unknown): ParsedRow[] {
    if (!data || typeof data !== "object" || Array.isArray(data)) return [];

    const rows: ParsedRow[] = [];

    const collect = (obj: Record<string, unknown>, depth: number) => {
        for (const [name, value] of Object.entries(obj)) {
            if (
                value !== null &&
                typeof value === "object" &&
                !Array.isArray(value) &&
                depth < 1
            ) {
                collect(value as Record<string, unknown>, depth + 1);
                continue;
            }

            // Values arrive as numbers, but tolerate "20" / "20%" strings too.
            const numeric =
                typeof value === "number"
                    ? value
                    : Number(String(value ?? "").replace(/[^0-9.\-]/g, ""));

            rows.push({
                key: nextRowKey(),
                name,
                weight: Number.isFinite(numeric) ? String(numeric) : "",
            });
        }
    };

    collect(data as Record<string, unknown>, 0);
    return rows;
}

/** Title-cases the lowercase category names the parser returns. */
function prettifyName(name: string): string {
    return name
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function UploadSyllabus({ courseId }: { courseId: number }) {
    const [file, setFile] = useState<File | null>(null);
    const [jsonResult, setJsonResult] = useState<unknown>(null);
    const [rows, setRows] = useState<ParsedRow[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const hasCourse = Number.isFinite(courseId) && courseId > 0;

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

            const parsed = parseOcrResult(data).map((r) => ({
                ...r,
                name: prettifyName(r.name),
            }));
            setRows(parsed);

            if (parsed.length === 0) {
                toast.error("No grading categories found in that syllabus.");
            } else {
                toast.success(
                    `Found ${parsed.length} categor${parsed.length === 1 ? "y" : "ies"}. Review below.`
                );
            }
        } catch (err) {
            console.error(err);
            toast.error(
                err instanceof ApiError ? "Failed to process file" : "An error occurred"
            );
        } finally {
            setLoading(false);
        }
    };

    const updateRow = (key: number, field: "name" | "weight", value: string) => {
        setRows((prev) =>
            (prev ?? []).map((r) => (r.key === key ? { ...r, [field]: value } : r))
        );
    };

    const removeRow = (key: number) => {
        setRows((prev) => (prev ?? []).filter((r) => r.key !== key));
    };

    const addRow = () => {
        setRows((prev) => [...(prev ?? []), { key: nextRowKey(), name: "", weight: "" }]);
    };

    const handleApply = async () => {
        const candidates = rows ?? [];
        if (candidates.length === 0) {
            toast.error("Nothing to apply.");
            return;
        }
        if (!hasCourse) {
            toast.error("No course selected.");
            return;
        }

        // Validate up front so a bad row doesn't leave a half-applied course.
        const prepared: { name: string; weight: number }[] = [];
        for (const row of candidates) {
            const name = row.name.trim();
            const weight = Number(row.weight);
            if (!name) {
                toast.error("Every category needs a name.");
                return;
            }
            if (!Number.isFinite(weight) || weight < 0 || weight > 100) {
                toast.error(`"${name}" needs a weight between 0 and 100.`);
                return;
            }
            prepared.push({ name, weight });
        }

        setApplying(true);
        let created = 0;
        const failed: string[] = [];

        for (const { name, weight } of prepared) {
            try {
                await apiPost<Category>("/api/categories", { courseId, name, weight });
                created += 1;
            } catch (err) {
                console.error(err);
                failed.push(name);
            }
        }

        // Refresh the course page's lists — same SWR keys it fetches with.
        await mutate(`/api/categories?courseId=${courseId}`);
        await mutate(`/api/courses/${courseId}`);

        setApplying(false);

        if (created > 0) {
            toast.success(
                `Added ${created} categor${created === 1 ? "y" : "ies"} to this course.`
            );
        }
        if (failed.length > 0) {
            toast.error(`Failed to add: ${failed.join(", ")}`);
        } else {
            // Everything landed — clear the review table.
            setRows(null);
            setJsonResult(null);
            setFile(null);
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

                {rows !== null ? (
                    <div className="w-full space-y-3">
                        <p className="text-sm text-muted-foreground text-center">
                            Review the detected categories, then apply them to this course.
                        </p>

                        <div className="space-y-2">
                            {rows.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center">
                                    No categories detected. Add one manually below.
                                </p>
                            ) : (
                                rows.map((row) => (
                                    <div key={row.key} className="flex gap-2 items-center">
                                        <Label className="sr-only" htmlFor={`cat-name-${row.key}`}>
                                            Category name
                                        </Label>
                                        <Input
                                            id={`cat-name-${row.key}`}
                                            className="flex-1"
                                            placeholder="Category"
                                            value={row.name}
                                            onChange={(e) => updateRow(row.key, "name", e.target.value)}
                                        />
                                        <Label className="sr-only" htmlFor={`cat-weight-${row.key}`}>
                                            Weight
                                        </Label>
                                        <Input
                                            id={`cat-weight-${row.key}`}
                                            type="number"
                                            min={0}
                                            max={100}
                                            className="w-24"
                                            placeholder="%"
                                            value={row.weight}
                                            onChange={(e) => updateRow(row.key, "weight", e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Remove ${row.name || "row"}`}
                                            className="text-destructive"
                                            onClick={() => removeRow(row.key)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center">
                            <Button variant="outline" onClick={addRow}>
                                Add Row <Plus className="ml-1 h-4 w-4" />
                            </Button>
                            <Button
                                onClick={handleApply}
                                disabled={applying || rows.length === 0 || !hasCourse}
                            >
                                {applying ? "Applying..." : "Apply to Course"}
                            </Button>
                            <Button variant="secondary" onClick={() => setShowRaw((v) => !v)}>
                                {showRaw ? "Hide Raw JSON" : "Show Raw JSON"}
                            </Button>
                        </div>

                        {showRaw && jsonResult ? (
                            <pre className="p-2 rounded-md text-xs w-full overflow-auto border">
                                {JSON.stringify(jsonResult, null, 2)}
                            </pre>
                        ) : null}
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
