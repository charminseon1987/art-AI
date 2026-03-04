export const runtime = 'edge';
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: error.message || "로그아웃에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "로그아웃되었습니다.",
    });
  } catch (error: any) {
    console.error("로그아웃 오류:", error);
    return NextResponse.json(
      { error: error.message || "로그아웃 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
