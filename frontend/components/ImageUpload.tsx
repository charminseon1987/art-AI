"use client";

import { useState, useEffect } from "react";
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

interface ImageUploadProps {
  onUploadComplete: (data: any) => void;
}

export default function ImageUpload({ onUploadComplete }: ImageUploadProps) {
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
          alert(
            "분석회수를 초과했습니다. 더 자세한 상담은 선생님과의 상담예약이 필요합니다.",
          );
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
        emotion: emotionValue || "없음",
      });

      const data = await analyzeImage(file, emotionValue);

      // 응답에서 success가 false이고 error가 있으면 사용 횟수 초과 메시지
      if (data.success === false && data.error) {
        console.error("[ImageUpload] 분석 실패:", data.error);
        alert(data.error);
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
      setCurrentStep("완료!");

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
      console.error("[ImageUpload] 업로드 에러:", {
        message: error.message,
        error: error,
        stack: error.stack,
        response: error.response,
      });

      // 에러 메시지 추출
      let errorMessage = "분석 중 오류가 발생했습니다.";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === "object") {
          errorMessage = errorData.error || errorData.message || errorMessage;
          if (errorData.error_type) {
            errorMessage += ` (${errorData.error_type})`;
          }
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // 사용자에게 명확한 메시지 표시
      alert(
        `분석 중 오류가 발생했습니다.\n\n${errorMessage}\n\n문제가 계속되면 관리자에게 문의해주세요.`,
      );
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
      setCurrentStep("이미지 업로드 중...");

      const steps = [
        { time: 500, progress: 20, step: "이미지 업로드 중..." },
        { time: 1500, progress: 40, step: "이미지 분석 중..." },
        { time: 3000, progress: 60, step: "색상과 형태 분석 중..." },
        { time: 4500, progress: 80, step: "감정 언어 분석 중..." },
        { time: 6000, progress: 95, step: "리포트 생성 중..." },
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
  }, [uploading]);

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
      alert(
        "분석회수를 초과했습니다. 더 자세한 상담은 선생님과의 상담예약이 필요합니다.",
      );
      return;
    }

    // 인증 없이 바로 분석 진행

    setUploading(true);
    try {
      const emotion =
        userEmotion && userEmotion !== "선택 안함" ? userEmotion : undefined;

      console.log("[ImageUpload] 분석 시작:", {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        emotion: emotion || "없음",
      });

      const data = await analyzeImage(selectedFile, emotion);

      // 응답에서 success가 false이고 error가 있으면 사용 횟수 초과 메시지
      if (data.success === false && data.error) {
        console.error("[ImageUpload] 분석 실패:", data.error);
        alert(data.error);
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
      setCurrentStep("완료!");

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
      console.error("[ImageUpload] 업로드 에러:", {
        message: error.message,
        error: error,
        stack: error.stack,
        response: error.response,
      });

      // 에러 메시지 추출
      let errorMessage = "분석 중 오류가 발생했습니다.";

      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === "object") {
          errorMessage = errorData.error || errorData.message || errorMessage;
          if (errorData.error_type) {
            errorMessage += ` (${errorData.error_type})`;
          }
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // 사용자에게 명확한 메시지 표시
      alert(
        `분석 중 오류가 발생했습니다.\n\n${errorMessage}\n\n문제가 계속되면 관리자에게 문의해주세요.`,
      );
    } finally {
      setUploading(false);
      setProgress(0);
      setCurrentStep("");
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
                <span className="font-semibold">클릭하여 업로드</span> 또는
                드래그 앤 드롭
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG (최대 10MB)
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

      {/* 사용 횟수 표시 */}
      {usageLimit !== null && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <span className="font-semibold">남은 분석 횟수:</span>
            <span className="font-bold text-blue-600">
              {usageLimit.image_analysis_remaining} /{" "}
              {usageLimit.image_analysis_limit}
            </span>
          </div>
        </div>
      )}

      {/* 사용 횟수 초과 안내 */}
      {usageLimit !== null && usageLimit.image_analysis_remaining <= 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">분석회수를 초과했습니다.</p>
              <p>더 자세한 상담은 선생님과의 상담예약이 필요합니다.</p>
            </div>
          </div>
        </div>
      )}

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
            분석 중...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            분석 시작
          </>
        )}
      </button>

      {/* 프로그레스바 모달 팝업 */}
      {uploading && (
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
                AI 분석 중
              </h3>
              <p className="text-sm text-stone-600">
                아이의 그림을 꼼꼼히 분석하고 있습니다
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
                  <p className="font-medium">잠시만 기다려주세요</p>
                  <p className="text-xs text-stone-600 mt-1">
                    AI가 그림의 색상, 형태, 감정을 분석하고 있습니다
                  </p>
                </div>
              </div>
            </div>

            {/* 진행 단계 체크리스트 */}
            <div className="mt-4 space-y-2">
              <div
                className={`flex items-center gap-2 text-xs ${
                  progress >= 20 ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    progress >= 20 ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {progress >= 20 && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span>이미지 업로드</span>
              </div>
              <div
                className={`flex items-center gap-2 text-xs ${
                  progress >= 40 ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    progress >= 40 ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {progress >= 40 && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span>이미지 분석</span>
              </div>
              <div
                className={`flex items-center gap-2 text-xs ${
                  progress >= 60 ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    progress >= 60 ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {progress >= 60 && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span>색상과 형태 분석</span>
              </div>
              <div
                className={`flex items-center gap-2 text-xs ${
                  progress >= 80 ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    progress >= 80 ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {progress >= 80 && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span>감정 언어 분석</span>
              </div>
              <div
                className={`flex items-center gap-2 text-xs ${
                  progress >= 95 ? "text-green-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    progress >= 95 ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {progress >= 95 && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                <span>리포트 생성</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
