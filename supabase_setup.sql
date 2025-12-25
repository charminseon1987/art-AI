-- Supabase 데이터베이스 스키마 설정
-- Supabase 대시보드의 SQL Editor에서 실행하세요

-- 1. profiles 테이블 생성 (사용자 프로필)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'supervisor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. RLS (Row Level Security) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS 정책 생성
-- 모든 사용자는 자신의 프로필을 볼 수 있음
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 관리자와 슈퍼바이저는 모든 프로필을 볼 수 있음
CREATE POLICY "Admins and supervisors can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- 사용자는 자신의 프로필을 업데이트할 수 있음
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 관리자는 모든 프로필을 업데이트할 수 있음
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. 사용자 생성 시 프로필 자동 생성 트리거 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. updated_at 트리거 생성
DROP TRIGGER IF EXISTS set_updated_at ON profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- 9. user_usage_limits 테이블 생성 (사용 횟수 제한)
CREATE TABLE IF NOT EXISTS user_usage_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kakao_id TEXT UNIQUE,
  image_analysis_count INTEGER NOT NULL DEFAULT 0,
  fingerprint_analysis_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- 10. user_usage_limits RLS 활성화
ALTER TABLE user_usage_limits ENABLE ROW LEVEL SECURITY;

-- 11. user_usage_limits RLS 정책 생성
-- 사용자는 자신의 사용 횟수만 조회 가능
CREATE POLICY "Users can view own usage limits"
  ON user_usage_limits FOR SELECT
  USING (auth.uid() = user_id);

-- 사용자는 자신의 사용 횟수를 업데이트할 수 있음 (증가만 가능)
CREATE POLICY "Users can update own usage limits"
  ON user_usage_limits FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 사용 횟수 레코드를 삽입할 수 있음
CREATE POLICY "Users can insert own usage limits"
  ON user_usage_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 관리자와 슈퍼바이저는 모든 사용 횟수를 볼 수 있음
CREATE POLICY "Admins and supervisors can view all usage limits"
  ON user_usage_limits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
    )
  );

-- 12. user_usage_limits updated_at 트리거 생성
DROP TRIGGER IF EXISTS set_usage_limits_updated_at ON user_usage_limits;
CREATE TRIGGER set_usage_limits_updated_at
  BEFORE UPDATE ON user_usage_limits
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 13. user_usage_limits 인덱스 생성
CREATE INDEX IF NOT EXISTS user_usage_limits_user_id_idx ON user_usage_limits(user_id);
CREATE INDEX IF NOT EXISTS user_usage_limits_kakao_id_idx ON user_usage_limits(kakao_id);
