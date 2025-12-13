"use client";

import { useState, useEffect } from "react";
import { Image as ImageIcon, Calendar, User } from "lucide-react";
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

export default function ClassPage() {
  const [works, setWorks] = useState<ClassWork[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            미술 수업 작품 갤러리
          </h1>
          <p className="text-lg text-gray-600">
            아이들의 창의적인 작품들을 만나보세요
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : works.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">아직 등록된 작품이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((work) => (
              <Link
                key={work.id}
                href={`/class/${work.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
