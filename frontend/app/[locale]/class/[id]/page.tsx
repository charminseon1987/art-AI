"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

interface ClassWork {
  id: string;
  thumbnail_url: string;
  age_range: string;
  title: string;
  images: string[];
  description?: string;
  created_at: string;
}

export default function ClassWorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [work, setWork] = useState<ClassWork | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadWork(params.id as string);
    }
  }, [params.id]);

  const loadWork = async (workId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/class-works/${workId}`);
      const data = await response.json();
      if (data.success) {
        setWork(data.class_work);
      }
    } catch (error) {
      console.error("작품 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="min-h-screen py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600">작품을 찾을 수 없습니다.</p>
          <Link
            href="/class"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            갤러리로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const displayImages =
    work.images.length > 0 ? work.images : [work.thumbnail_url];

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/class"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          갤러리로 돌아가기
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* 메인 이미지 */}
          <div className="relative w-full h-96 bg-gray-200">
            {displayImages[selectedImageIndex] ? (
              <img
                src={`http://localhost:8000${displayImages[selectedImageIndex]}`}
                alt={work.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* 썸네일 갤러리 */}
          {displayImages.length > 1 && (
            <div className="p-4 bg-gray-50 border-t">
              <div className="flex gap-2 overflow-x-auto">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      selectedImageIndex === idx
                        ? "border-blue-600"
                        : "border-gray-300"
                    }`}
                  >
                    <img
                      src={`http://localhost:8000${img}`}
                      alt={`${work.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 작품 정보 */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-5 h-5 text-blue-600" />
                <span className="font-medium">{work.age_range}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>
                  {new Date(work.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              {work.title}
            </h1>

            {work.description && (
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {work.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
