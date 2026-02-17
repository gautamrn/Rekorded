"use client";

import { useState, useCallback } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { AnalysisResult } from "../types";
import { useAuth } from "@clerk/nextjs";

interface UploadZoneProps {
    onAnalysisComplete: (data: AnalysisResult) => void;
}

export default function UploadZone({ onAnalysisComplete }: UploadZoneProps) {
    const { getToken } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrop = useCallback(
        async (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);
            setError(null);

            const file = e.dataTransfer.files[0];
            if (!file) return;

            if (!file.name.endsWith(".xml")) {
                setError("Please upload a valid collection.xml file.");
                return;
            }

            await uploadFile(file);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setError(null);
            await uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = await getToken();
            const headers: HeadersInit = {};
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')}/upload`, {
                method: "POST",
                body: formData,
                headers: headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Backend Error:", res.status, errorText);
                throw new Error(`Failed to analyze library: ${res.status} ${res.statusText}`);
            }

            const data: AnalysisResult = await res.json();
            onAnalysisComplete(data);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                setError("Upload timed out. Please check if the backend is running.");
            } else {
                setError("An error occurred while uploading. Is the backend running?");
            }
            console.error("Upload error:", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <div
                className={`relative rounded-xl border border-dashed p-10 flex flex-col items-center justify-center transition-colors ${
                    isDragging
                        ? "border-blue-500/60 bg-blue-500/[0.04]"
                        : "border-zinc-700/60 hover:border-zinc-600"
                }`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    accept=".xml"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                />

                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="p-3 rounded-lg bg-[var(--surface-2)]">
                        {isUploading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-zinc-600 border-t-blue-500" />
                        ) : (
                            <Upload className="w-6 h-6 text-zinc-500" />
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-sm font-medium text-zinc-300">
                            {isUploading ? "Analyzing..." : "Drop collection.xml here"}
                        </p>
                        <p className="text-xs text-zinc-600">
                            or click below to browse
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/[0.06] px-3 py-1.5 rounded-md">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <label
                            htmlFor="file-upload"
                            className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                isUploading
                                    ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-500 text-white"
                            }`}
                        >
                            {isUploading ? "Processing..." : "Select file"}
                        </label>

                        <button
                            onClick={async (e) => {
                                e.preventDefault();
                                try {
                                    const response = await fetch("/demo_collection.xml");
                                    if (!response.ok) throw new Error("Failed to fetch demo file");
                                    const blob = await response.blob();
                                    const file = new File([blob], "demo_collection.xml", { type: "text/xml" });
                                    await uploadFile(file);
                                } catch (err) {
                                    console.error("Demo upload failed:", err);
                                    setError(err instanceof Error ? err.message : "Failed to load demo collection");
                                }
                            }}
                            disabled={isUploading}
                            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            Try demo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}