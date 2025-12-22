"use client";

import { useState, useCallback } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { AnalysisResult } from "../types";

interface UploadZoneProps {
    onAnalysisComplete: (data: AnalysisResult) => void;
}

import { useAuth } from "@clerk/nextjs";

export default function UploadZone({ onAnalysisComplete }: UploadZoneProps) {
    const { getToken, userId } = useAuth();
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

            console.log("Uploading file...", { hasToken: !!token });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const res = await fetch("http://localhost:8000/upload", {
                method: "POST",
                body: formData,
                headers: headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log("Response received:", res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Backend Error:", res.status, errorText);
                throw new Error(`Failed to analyze library: ${res.status} ${res.statusText}`);
            }

            const data: AnalysisResult = await res.json();
            onAnalysisComplete(data);
        } catch (err: any) {
            if (err.name === 'AbortError') {
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
        <div
            className={`relative w-full max-w-2xl mx-auto min-h-[400px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-300 ${isDragging
                ? "border-blue-500 bg-blue-50/10 scale-[1.02]"
                : "border-gray-700 hover:border-gray-500 bg-gray-900/50"
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

            <div className="flex flex-col items-center gap-6 p-10 text-center">
                <div className="p-6 bg-gray-800 rounded-full shadow-2xl shadow-blue-500/10">
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                    ) : (
                        <Upload className="w-12 h-12 text-blue-400" />
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                        {isUploading ? "Analyzing Library..." : "Upload collection.xml"}
                    </h2>
                    <p className="text-gray-400 max-w-sm">
                        Drag and drop your Rekordbox collection file here, or click to browse.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                <label
                    htmlFor="file-upload"
                    className={`cursor-pointer px-8 py-3 rounded-full text-sm font-medium transition-all ${isUploading
                        ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30"
                        }`}
                >
                    {isUploading ? "Processing..." : "Select File"}
                </label>
            </div>
        </div>
    );
}
