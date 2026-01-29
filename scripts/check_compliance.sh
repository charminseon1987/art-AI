#!/bin/bash
# Polar.sh 규정 준수 검사 스크립트

echo "=== Polar.sh 규정 준수 검사 ==="
echo ""

# 작업 디렉토리 설정
cd /Users/kimhyeseon/Dev/studyAI/art-AI

echo "📋 검사 대상:"
echo "  - Python 파일 (backend)"
echo "  - TypeScript/TSX 파일 (frontend)"
echo ""

# 1. "상담" 용어 검사
echo "1️⃣ '상담' 용어 검사:"
COUNSELING_COUNT=$(grep -r "상담" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=__pycache__ . 2>/dev/null | grep -v "# " | grep -v "//" | wc -l | tr -d ' ')
echo "   발견된 인스턴스: $COUNSELING_COUNT"
if [ "$COUNSELING_COUNT" -gt 0 ]; then
    echo "   ⚠️  일부 '상담' 용어가 남아있습니다."
    echo "   주요 위치:"
    grep -rn "상담" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=__pycache__ . 2>/dev/null | grep -v "# " | grep -v "//" | head -5
fi
echo ""

# 2. "치료" 용어 검사
echo "2️⃣ '치료' 용어 검사:"
THERAPY_COUNT=$(grep -r "치료" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=__pycache__ . 2>/dev/null | grep -v "# " | grep -v "//" | wc -l | tr -d ' ')
echo "   발견된 인스턴스: $THERAPY_COUNT"
if [ "$THERAPY_COUNT" -gt 0 ]; then
    echo "   ⚠️  일부 '치료' 용어가 남아있습니다."
fi
echo ""

# 3. "전문가" 자기 주장 검사 (AI/시스템 관련 제외)
echo "3️⃣ '전문가' 자기 주장 검사:"
EXPERT_COUNT=$(grep -r "전문가" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=__pycache__ . 2>/dev/null | grep -v "AI" | grep -v "시스템" | grep -v "자격을 갖춘 전문가" | grep -v "# " | grep -v "//" | wc -l | tr -d ' ')
echo "   발견된 인스턴스: $EXPERT_COUNT"
echo ""

# 4. "내담자" 용어 검사
echo "4️⃣ '내담자' 용어 검사:"
CLIENT_COUNT=$(grep -r "내담자" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=__pycache__ . 2>/dev/null | wc -l | tr -d ' ')
echo "   발견된 인스턴스: $CLIENT_COUNT"
echo ""

# 5. 핵심 용어 변경 확인
echo "5️⃣ 핵심 용어 변경 확인:"
echo "   ✓ '분석' 용어 사용:"
ANALYSIS_COUNT=$(grep -r "분석" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=__pycache__ . 2>/dev/null | wc -l | tr -d ' ')
echo "     발견: $ANALYSIS_COUNT 인스턴스"

echo "   ✓ '교육' 관련 용어 사용:"
EDUCATION_COUNT=$(grep -r "교육" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=__pycache__ . 2>/dev/null | wc -l | tr -d ' ')
echo "     발견: $EDUCATION_COUNT 인스턴스"
echo ""

# 6. API 엔드포인트 확인
echo "6️⃣ API 엔드포인트 확인:"
echo "   새 엔드포인트 (/analyze):"
grep -r "/analyze\|/analysis" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv api_server.py frontend/lib/api.ts 2>/dev/null | wc -l
echo "   구 엔드포인트 (/counseling):"
grep -r "/counseling" --include="*.py" --include="*.tsx" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.venv api_server.py frontend/lib/api.ts 2>/dev/null | wc -l
echo ""

# 최종 결과
echo "=== 검사 완료 ==="
echo ""
TOTAL_VIOLATIONS=$((COUNSELING_COUNT + THERAPY_COUNT + EXPERT_COUNT + CLIENT_COUNT))

if [ "$TOTAL_VIOLATIONS" -eq 0 ]; then
    echo "✅ 규정 준수 완료! 주요 위반 용어가 발견되지 않았습니다."
else
    echo "⚠️  총 $TOTAL_VIOLATIONS 개의 잠재적 위반 인스턴스가 발견되었습니다."
    echo ""
    echo "권장 사항:"
    echo "  - 남은 인스턴스를 검토하고 필요시 수정하세요."
    echo "  - 면책 조항이 모든 리포트에 포함되었는지 확인하세요."
    echo "  - 사용자 대면 텍스트를 우선적으로 검토하세요."
fi
echo ""
