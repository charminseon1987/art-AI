"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { analyzeImage } from "@/lib/api";

interface ImageUploadProps {
  onUploadComplete: (data: any) => void;
}

export default function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userEmotion, setUserEmotion] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const emotion = userEmotion && userEmotion !== "선택 안함" ? userEmotion : undefined;
      const data = await analyzeImage(selectedFile, emotion);
      onUploadComplete(data);
    } catch (error: any) {
      console.error("Upload error:", error);
      const errorMessage = error.message || error.response?.data?.error || "업로드 중 오류가 발생했습니다.";
      alert(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {preview && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <img
            src={preview}
            alt="Preview"
            className="max-w-full h-auto rounded-lg mx-auto"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          그림 파일 선택
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, JPEG (최대 10MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          현재 감정 선택 (선택사항)
        </label>
        <select
          value={userEmotion}
          onChange={(e) => setUserEmotion(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option>선택 안함</option>
          <option>기쁨</option>
          <option>슬픔</option>
          <option>화남</option>
          <option>불안</option>
          <option>평온</option>
          <option>혼란</option>
          <option>기타</option>
        </select>
      </div>

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            분석 중...
          </>
        ) : (
          <>
            분석 시작
            <Upload className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  );
}

