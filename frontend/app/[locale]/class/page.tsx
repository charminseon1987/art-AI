"use client";

import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Calendar,
  User,
  Plus,
  Upload,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface ClassWork {
  id: string;
  thumbnail_url: string;
  age_range: string;
  title: string;
  images: string[];
  description?: string;
  category: number;
  created_at: string;
}

const CATEGORIES = [
  { id: 0, name: "유아", label: "유아" },
  { id: 1, name: "초등", label: "초등" },
  { id: 2, name: "중등", label: "중등" },
  { id: 3, name: "애니", label: "애니" },
];

export default function ClassPage() {
  const [works, setWorks] = useState<ClassWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const authenticated =
        sessionStorage.getItem("admin_authenticated") === "true";
      setIsAdmin(authenticated);
    };
    checkAdmin();
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/class-works");
      const data = await response.json();
      if (data.success) {
        setWorks(data.works || []);
      }
    } catch (error) {
      console.error("작품 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorks = works.filter((work) => work.category === activeTab);

  const handleDeleteWork = async (workId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 관리자 인증 확인
    const authenticated =
      sessionStorage.getItem("admin_authenticated") === "true";
    if (!authenticated) {
      alert("관리자만 작품을 삭제할 수 있습니다.");
      return;
    }

    // 삭제 확인
    if (!confirm("정말 이 작품을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = sessionStorage.getItem("admin_token");
      const response = await fetch(`/api/class-works/${workId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "삭제 실패");
      }

      const data = await response.json();
      if (data.success) {
        alert("작품이 삭제되었습니다.");
        loadWorks(); // 목록 새로고침
      } else {
        throw new Error(data.error || "삭제 실패");
      }
    } catch (error: any) {
      console.error("삭제 오류:", error);
      alert(
        "삭제 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류")
      );
    }
  };

  const handleUploadClick = () => {
    // 관리자 인증 재확인
    const authenticated =
      sessionStorage.getItem("admin_authenticated") === "true";
    if (!authenticated) {
      alert("관리자만 작품을 등록할 수 있습니다.");
      return;
    }
    setShowUploadModal(true);
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            미술 수업 작품 갤러리
          </h1>
          <p className="text-lg text-gray-600">
            아이들의 창의적인 작품들을 만나보세요
          </p>
        </div>

        {/* 탭 메뉴 */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 border-b border-gray-200">
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-6 py-3 font-semibold transition-all relative ${
                  activeTab === category.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {category.label}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // 관리자 인증 재확인
                      const authenticated =
                        sessionStorage.getItem("admin_authenticated") ===
                        "true";
                      if (!authenticated) {
                        alert("관리자만 작품을 등록할 수 있습니다.");
                        return;
                      }
                      setActiveTab(category.id);
                      setShowUploadModal(true);
                    }}
                    className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    title={`${category.label} 작품 추가 (관리자 전용)`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 관리자 업로드 버튼 */}
        {isAdmin && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleUploadClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
            >
              <Upload className="w-5 h-5" />
              작품 등록하기
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : filteredWorks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {CATEGORIES[activeTab].label} 카테고리에 등록된 작품이 없습니다.
            </p>
            {isAdmin && (
              <button
                onClick={handleUploadClick}
                className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                <Plus className="w-5 h-5" />
                작품 등록하기
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorks.map((work) => (
              <div
                key={work.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group"
              >
                <Link href={`/class/${work.id}`} className="block">
                  <div className="relative w-full h-64 bg-gray-200">
                    {work.thumbnail_url ? (
                      <img
                        src={`http://localhost:8000${work.thumbnail_url}`}
                        alt={work.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {/* 관리자 삭제 버튼 */}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteWork(work.id, e)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                        title="작품 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        {work.age_range}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                      {work.title}
                    </h3>
                    {work.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {work.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(work.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* 업로드 모달 */}
        {showUploadModal && (
          <UploadModal
            category={activeTab}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              loadWorks();
            }}
          />
        )}
      </div>
    </div>
  );
}

// 업로드 모달 컴포넌트
function UploadModal({
  category,
  onClose,
  onSuccess,
}: {
  category: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [ageRange, setAgeRange] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages([...images, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 관리자 인증 확인
    const authenticated =
      sessionStorage.getItem("admin_authenticated") === "true";
    if (!authenticated) {
      alert("관리자만 작품을 등록할 수 있습니다.");
      return;
    }

    if (!thumbnail || !ageRange || !title) {
      alert("섬네일, 나이, 제목은 필수입니다.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("thumbnail", thumbnail);
      formData.append("age_range", ageRange);
      formData.append("title", title);
      formData.append("category", category.toString());
      if (description) {
        formData.append("description", description);
      }

      images.forEach((img) => {
        formData.append("images", img);
      });

      const token = sessionStorage.getItem("admin_token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/class-works", {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `서버 오류 (${response.status})`);
      }

      const data = await response.json();

      if (data.success) {
        alert("작품이 등록되었습니다!");
        onSuccess();
      } else {
        throw new Error(data.error || "알 수 없는 오류");
      }
    } catch (error: any) {
      console.error("업로드 오류:", error);
      alert(
        "업로드 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류")
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {CATEGORIES[category].label} 작품 등록
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 섬네일 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                섬네일 이미지 <span className="text-red-500">*</span>
              </label>
              {thumbnailPreview ? (
                <div className="relative w-64 h-64 border-2 border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="섬네일 미리보기"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnail(null);
                      setThumbnailPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">섬네일 업로드</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    required
                  />
                </label>
              )}
            </div>

            {/* 나이 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                나이 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                placeholder="예: 5-7세, 초등 1-2학년"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                required
              />
            </div>

            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="작품 제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
                required
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명 (선택사항)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="작품에 대한 설명을 입력하세요"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white"
              />
            </div>

            {/* 상세 이미지 업로드 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 페이지 이미지 (여러 개 가능)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, idx) => (
                  <div
                    key={idx}
                    className="relative w-full h-32 border-2 border-gray-300 rounded-lg overflow-hidden"
                  >
                    <img
                      src={preview}
                      alt={`이미지 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">이미지 추가</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    작품 등록
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
