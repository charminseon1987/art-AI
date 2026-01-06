import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
  if (typeof window !== "undefined") {
    // 브라우저 환경에서만 에러 표시
    console.error("❌ Supabase 환경 변수가 설정되지 않았습니다!");
    console.error(
      "다음 환경 변수를 설정해주세요:\n" +
        "- NEXT_PUBLIC_SUPABASE_URL\n" +
        "- NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n" +
        "frontend/.env.local 파일을 생성하고 위 변수들을 추가하세요."
    );
  }

  // 빈 문자열로 클라이언트 생성 (Supabase가 자체적으로 에러 처리)
  // 네트워크 요청을 시도하지 않도록 빈 문자열 사용
  var supabase: SupabaseClient = createClient("", "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
} else {
  var supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export { supabase };

// 사용자 역할 타입
export type UserRole = "admin" | "supervisor" | "user";

// 사용자 프로필 인터페이스
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  created_at: string;
  updated_at: string;
}
