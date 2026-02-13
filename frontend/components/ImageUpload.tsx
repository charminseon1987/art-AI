"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Upload,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  FileText,
  AlertCircle,
} from "lucide-react";
import { analyzeImage } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import {
  saveToIndexedDB,
  loadFromIndexedDB,
  deleteFromIndexedDB,
} from "@/lib/indexedDB";

interface ImageUploadProps {
  onUploadComplete: (data: any) => void;
}

export default function ImageUpload({ onUploadComplete }: ImageUploadProps) {
  const t = useTranslations("analysis.upload");
  const pathname = usePathname();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [userEmotion, setUserEmotion] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [usageLimit, setUsageLimit] = useState<{
    image_analysis_remaining: number;
    image_analysis_limit: number;
  } | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

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

  // 인증 완료 후 분석 시작 함수
  const handleUploadAfterAuth = async (file: File, emotion?: string) => {
    if (!file) return;

    // 사용 횟수 확인 (직접 조회)
    const response = await fetch("/api/usage-limits");
    if (response.ok) {
      const usageData = await response.json();
      if (usageData.success) {
        const currentLimit = {
          image_analysis_remaining: usageData.usage.image_analysis_remaining,
          image_analysis_limit: usageData.usage.image_analysis_limit,
        };
        setUsageLimit(currentLimit);

        if (currentLimit.image_analysis_remaining <= 0) {
          alert(t("usage.limitReached") + "\n" + t("usage.limitDetail"));
          return;
        }
      }
    }

    setUploading(true);
    try {
      const emotionValue =
        emotion && emotion !== "선택 안함" ? emotion : undefined;

      console.log("[ImageUpload] 인증 후 분석 시작:", {
        fileName: file.name,
        fileSize: file.size,
        emotion: emotionValue || "None",
      });

      const data = await analyzeImage(file, emotionValue);

      // 응답에서 success가 false이면 에러 처리
      if (data.success === false) {
        const errorMessage = (data as any).error || t("error.analysis");
        console.error("[ImageUpload] 분석 실패:", errorMessage);
        alert(errorMessage);
        // 사용 횟수 다시 조회
        const response = await fetch("/api/usage-limits");
        if (response.ok) {
          const usageData = await response.json();
          if (usageData.success) {
            setUsageLimit({
              image_analysis_remaining:
                usageData.usage.image_analysis_remaining,
              image_analysis_limit: usageData.usage.image_analysis_limit,
            });
          }
        }
        return;
      }

      console.log("[ImageUpload] 분석 성공:", {
        reportId: data.report_id,
        chatReady: data.chat_ready,
      });

      setProgress(100);
      setCurrentStep(t("progress.steps.complete"));

      // 사용 횟수 다시 조회
      const response = await fetch("/api/usage-limits");
      if (response.ok) {
        const usageData = await response.json();
        if (usageData.success) {
          setUsageLimit({
            image_analysis_remaining: usageData.usage.image_analysis_remaining,
            image_analysis_limit: usageData.usage.image_analysis_limit,
          });
        }
      }

      setTimeout(() => {
        onUploadComplete(data);
      }, 300);
    } catch (error: any) {
      console.error("[ImageUpload] 업로드 에러 상세:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });

      let errorMessage = t("error.analysis");
      const errorData = (error as any).response?.data || error;

      if (typeof errorData === "object" && errorData !== null) {
        errorMessage = errorData.error || errorData.message || errorMessage;
        if (errorData.error_type) {
          errorMessage += ` (${errorData.error_type})`;
        }
      } else if (typeof errorData === "string") {
        errorMessage = errorData;
      } else if (error.message) {
        if (
          error.message.includes("timeout") ||
          error.message.includes("network")
        ) {
          errorMessage = t("error.server");
        } else {
          errorMessage = error.message;
        }
      }

      // 사용자에게 명확한 메시지 표시
      alert(`${t("error.analysis")}\n\n${errorMessage}`);
    } finally {
      setUploading(false);
      setProgress(0);
      setCurrentStep("");
    }
  };

  // 사용 횟수 조회
  useEffect(() => {
    const fetchUsageLimit = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          const response = await fetch("/api/usage-limits");
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setUsageLimit({
                image_analysis_remaining: data.usage.image_analysis_remaining,
                image_analysis_limit: data.usage.image_analysis_limit,
              });
            }
          }
        }
      } catch (error) {
        console.error("사용 횟수 조회 오류:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchUsageLimit();
  }, []);

  // 프로그레스바 애니메이션
  useEffect(() => {
    if (uploading) {
      setProgress(0);
      setCurrentStep(t("progress.title"));

      const steps = [
        { time: 500, progress: 20, step: t("progress.steps.uploading") },
        { time: 1500, progress: 40, step: t("progress.steps.analyzing") },
        { time: 3000, progress: 60, step: t("progress.steps.colorShape") },
        { time: 4500, progress: 80, step: t("progress.steps.emotion") },
        { time: 6000, progress: 95, step: t("progress.steps.generating") },
      ];

      steps.forEach(({ time, progress: prog, step }) => {
        setTimeout(() => {
          if (uploading) {
            setProgress(prog);
            setCurrentStep(step);
          }
        }, time);
      });
    } else {
      setProgress(0);
      setCurrentStep("");
    }
  }, [uploading, t]);

  // 이미지 압축 함수
  const compressImage = (file: File, maxSizeMB: number = 2): Promise<File> => {
    return new Promise((resolve, reject) => {
      // 이미 작은 파일이면 압축하지 않음
      if (file.size <= maxSizeMB * 1024 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // 최대 크기 조정 (1920px 기준)
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Canvas context를 가져올 수 없습니다."));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // 품질 조정 (0.7부터 시작하여 크기에 따라 조정)
          let quality = 0.7;
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("이미지 압축에 실패했습니다."));
                return;
              }

              // 목표 크기에 맞춰 품질 조정
              if (blob.size > maxSizeMB * 1024 * 1024) {
                quality = Math.max(0.3, quality - 0.1);
                canvas.toBlob(
                  (compressedBlob) => {
                    if (!compressedBlob) {
                      resolve(new File([blob], file.name, { type: file.type }));
                      return;
                    }
                    const compressedFile = new File(
                      [compressedBlob],
                      file.name,
                      { type: file.type },
                    );
                    resolve(compressedFile);
                  },
                  file.type,
                  quality,
                );
              } else {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                });
                resolve(compressedFile);
              }
            },
            file.type,
            quality,
          );
        };
        img.onerror = () => reject(new Error("이미지를 로드할 수 없습니다."));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // 사용 횟수 확인
    if (usageLimit && usageLimit.image_analysis_remaining <= 0) {
      alert(t("usage.limitReached") + "\n" + t("usage.limitDetail"));
      return;
    }

    try {
      // 1. 이미지 압축 (5MB 이상인 경우)
      let fileToUpload = selectedFile;
      const maxSizeMB = 5;

      if (selectedFile.size > maxSizeMB * 1024 * 1024) {
        console.log("[ImageUpload] 이미지 압축 시작:", {
          originalSize: selectedFile.size,
          maxSizeMB,
        });
        fileToUpload = await compressImage(selectedFile, maxSizeMB);
        console.log("[ImageUpload] 이미지 압축 완료:", {
          originalSize: selectedFile.size,
          compressedSize: fileToUpload.size,
        });
      }

      // 2. 바로 분석 시작
      const emotionValue =
        userEmotion && userEmotion !== "선택 안함" ? userEmotion : undefined;
      await handleUploadAfterAuth(fileToUpload, emotionValue);
    } catch (error: any) {
      console.error("[ImageUpload] 분석 오류:", error);
      alert(
        `${t("error.analysis")}\n\n${error.message || t("error.unknown")}\n\n${t("error.retry") || "Please try again."}`,
      );
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
          {t("selectFile")}
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">{t("clickToUpload")}</span>{" "}
                {t("dragDrop")}
              </p>
              <p className="text-xs text-gray-500">
                {t("supportedFormats")} ({t("maxSize")})
              </p>
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

      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("currentEmotion")}
      </label>
      <select
        value={userEmotion}
        onChange={(e) => setUserEmotion(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
      >
        <option value="">{t("emotions.none")}</option>
        <option value="기쁨">{t("emotions.joy")}</option>
        <option value="슬픔">{t("emotions.sadness")}</option>
        <option value="화남">{t("emotions.anger")}</option>
        <option value="불안">{t("emotions.anxiety")}</option>
        <option value="평온">{t("emotions.calm")}</option>
        <option value="혼란">{t("emotions.confusion")}</option>
        <option value="기타">{t("emotions.other")}</option>
      </select>

      {
        usageLimit !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <span className="font-semibold">{t("usage.remaining")}</span>
              <span className="font-bold text-blue-600">
                {usageLimit.image_analysis_remaining} /{" "}
                {usageLimit.image_analysis_limit}
              </span>
            </div>
          </div>
        )
      }

      {/* 사용 횟수 초과 안내 */}
      {
        usageLimit !== null && usageLimit.image_analysis_remaining <= 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">{t("usage.limitReached")}</p>
                <p>{t("usage.limitDetail")}</p>
              </div>
            </div>
          </div>
        )
      }

      <button
        onClick={handleUpload}
        disabled={
          !selectedFile ||
          uploading ||
          (usageLimit !== null && usageLimit.image_analysis_remaining <= 0)
        }
        className="w-full bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t("button.analyzing")}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {t("button.start")}
          </>
        )}
      </button>

      {/* 프로그레스바 모달 팝업 */}
      {
        uploading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full transform animate-scaleIn">
              {/* 헤더 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full mb-4">
                  {progress < 30 ? (
                    <ImageIcon className="w-8 h-8 text-rose-500 animate-pulse" />
                  ) : progress < 70 ? (
                    <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
                  ) : (
                    <FileText className="w-8 h-8 text-pink-500 animate-pulse" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  {t("progress.title")}
                </h3>
                <p className="text-sm text-stone-600">
                  {t("progress.subtitle")}
                </p>
              </div>

              {/* 프로그레스바 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-stone-700">
                    {currentStep}
                  </span>
                  <span className="text-lg font-bold text-rose-600">
                    {progress}%
                  </span>
                </div>

                {/* 프로그레스바 배경 */}
                <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
                  {/* 프로그레스바 채우기 */}
                  <div
                    className="h-4 rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 shadow-lg relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    {/* 반짝이는 애니메이션 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer"></div>
                  </div>
                </div>
              </div>

              {/* 분석 단계 표시 */}
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-4 rounded-xl border border-rose-200">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-rose-500 flex-shrink-0" />
                  <div className="text-sm text-stone-700">
                    <p className="font-medium">{t("progress.wait")}</p>
                    <p className="text-xs text-stone-600 mt-1">
                      {t("progress.waitDetail")}
                    </p>
                  </div>
                </div>
              </div>

              {/* 진행 단계 체크리스트 */}
              <div className="mt-4 space-y-2">
                <div
                  className={`flex items-center gap-2 text-xs ${progress >= 20 ? "text-green-600" : "text-gray-400"
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${progress >= 20 ? "bg-green-500" : "bg-gray-300"
                      }`}
                  >
                    {progress >= 20 && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span>{t("progress.checklist.upload")}</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${progress >= 40 ? "text-green-600" : "text-gray-400"
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${progress >= 40 ? "bg-green-500" : "bg-gray-300"
                      }`}
                  >
                    {progress >= 40 && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span>{t("progress.checklist.analysis")}</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${progress >= 60 ? "text-green-600" : "text-gray-400"
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${progress >= 60 ? "bg-green-500" : "bg-gray-300"
                      }`}
                  >
                    {progress >= 60 && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span>{t("progress.checklist.colorShape")}</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${progress >= 80 ? "text-green-600" : "text-gray-400"
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${progress >= 80 ? "bg-green-500" : "bg-gray-300"
                      }`}
                  >
                    {progress >= 80 && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span>{t("progress.checklist.emotion")}</span>
                </div>
                <div
                  className={`flex items-center gap-2 text-xs ${progress >= 95 ? "text-green-600" : "text-gray-400"
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${progress >= 95 ? "bg-green-500" : "bg-gray-300"
                      }`}
                  >
                    {progress >= 95 && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                  <span>{t("progress.checklist.report")}</span>
                </div>
              </div>
            </div>
          </div>

        )
      }
    </div >
  );
}
