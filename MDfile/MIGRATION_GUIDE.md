# 데이터베이스 마이그레이션 가이드

## 마이그레이션 실행 순서

Supabase 대시보드의 SQL Editor에서 다음 순서로 실행하세요:

### 1단계: 초기 설정 (최초 1회만)
```sql
-- supabase_setup.sql 실행
-- profiles 테이블 및 기본 설정
```

### 2단계: 결제 및 예약 시스템 (필수)
```sql
-- migrations/001_add_payment_and_reservation_tables.sql 실행
-- services, payments, reservations 테이블 생성
-- 가격: 그림 상담 AI 분석 = 14,900원 (이미 업데이트됨)
```

### 3단계: 기존 테이블 수정 (필요시)
```sql
-- migrations/002_alter_existing_tables.sql 실행
-- 기존 테이블에 컬럼 추가
```

### 4단계: Stripe 필드 추가 (필수)
```sql
-- migrations/003_add_stripe_fields.sql 실행
-- payments 테이블에 Stripe 관련 필드 추가
```

### 5단계: 가격 업데이트 (기존 DB만 해당)
```sql
-- migrations/004_update_drawing_consultation_price.sql 실행
-- 이미 001에서 14900으로 설정되어 있으므로, 
-- 기존 데이터베이스에 990원으로 되어 있을 때만 실행
```

## 빠른 시작 (새 데이터베이스)

새로운 데이터베이스를 설정하는 경우:

1. `supabase_setup.sql` 실행
2. `migrations/001_add_payment_and_reservation_tables.sql` 실행
3. `migrations/003_add_stripe_fields.sql` 실행

가격은 이미 14,900원으로 설정되어 있습니다.

## 기존 데이터베이스 업데이트

이미 데이터베이스가 있고 가격을 업데이트해야 하는 경우:

1. `migrations/004_update_drawing_consultation_price.sql` 실행
   - 이 마이그레이션은 테이블 존재 여부를 확인하고 안전하게 업데이트합니다.

## 오류 해결

### "relation 'services' does not exist" 오류

이 오류는 `services` 테이블이 아직 생성되지 않았을 때 발생합니다.

**해결 방법:**
1. `migrations/001_add_payment_and_reservation_tables.sql`을 먼저 실행하세요.
2. 그 다음 다른 마이그레이션을 실행하세요.

### 가격이 여전히 990원으로 표시되는 경우

1. `migrations/004_update_drawing_consultation_price.sql` 실행
2. 또는 직접 업데이트:
```sql
UPDATE services 
SET price_krw = 14900, updated_at = NOW()
WHERE service_type = 'drawing_consultation';
```

## 확인 쿼리

마이그레이션 후 확인:

```sql
-- 서비스 목록 확인
SELECT service_type, name, price_krw, is_active 
FROM services;

-- 예상 결과:
-- drawing_consultation | 그림 상담 AI 분석 | 14900 | true
-- teacher_consultation  | 선생님 상담 예약 | 50000 | true
```
