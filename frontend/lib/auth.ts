import { supabase, UserRole } from "./supabase";
import { UserProfile } from "./supabase";

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    // 환경 변수가 없으면 null 반환
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // 프로필 정보 가져오기
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      id: user.id,
      email: user.email || "",
      role: (profile?.role as UserRole) || "user",
      name: profile?.name || "",
      created_at: profile?.created_at || user.created_at,
      updated_at: profile?.updated_at || user.updated_at,
    };
  } catch (error) {
    console.error("사용자 정보 가져오기 오류:", error);
    return null;
  }
}

/**
 * 사용자 역할 확인
 */
export function hasRole(
  userRole: UserRole | null,
  requiredRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

/**
 * 관리자 권한 확인
 */
export function isAdmin(userRole: UserRole | null): boolean {
  return userRole === "admin";
}

/**
 * 슈퍼바이저 권한 확인
 */
export function isSupervisor(userRole: UserRole | null): boolean {
  return userRole === "supervisor" || userRole === "admin";
}

/**
 * 관리자 또는 슈퍼바이저 권한 확인
 */
export function isAdminOrSupervisor(userRole: UserRole | null): boolean {
  return userRole === "admin" || userRole === "supervisor";
}

/**
 * 세션 토큰 가져오기
 */
export async function getSessionToken(): Promise<string | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error("세션 토큰 가져오기 오류:", error);
    return null;
  }
}
