"""Chat 기반 리포트 생성 서비스 - 명세에 따른 리포트 생성"""
from typing import List, Dict, Any, Optional
from models.report import ReportData, ImageObservation, EmotionalLanguage
from langchain_openai import ChatOpenAI
import json


class ReportGeneratorService:
    """Chat 응답을 포함한 리포트 생성 서비스"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
    
    def generate_chat_based_report(
        self,
        report_data: ReportData,
        chat_responses: List[Dict[str, str]]
    ) -> str:
        """Chat 응답을 포함한 교육 참고 리포트 생성"""
        
        # 아이의 말 정리 (의미 해석 없이 그대로 인용)
        child_words = []
        for response in chat_responses:
            child_words.append({
                "질문": response["question"],
                "답변": response["answer"]
            })
        
        # 리포트 생성 프롬프트
        prompt = f"""당신은 20년 경력의 미술 심리 전문가입니다. 아래 정보를 바탕으로 '그림 기반 상담 참고 리포트'를 작성하세요.

[입력 정보]
1. 그림 이미지 분석 결과
2. AI 관찰 데이터
3. 사용자 Chat 응답

[그림 관찰 데이터]
{json.dumps({
    "색상": report_data.observation.colors[:10] if report_data.observation.colors else [],
    "형태": report_data.observation.shapes[:10] if report_data.observation.shapes else [],
    "구성": report_data.observation.composition or "",
    "세부사항": report_data.observation.details[:5] if report_data.observation.details else [],
    "전체인상": report_data.observation.overall_impression or ""
}, ensure_ascii=False, indent=2)}

[감정 언어 분석]
{json.dumps({
    "주요감정": report_data.emotional_language.dominant_emotions[:5] if report_data.emotional_language.dominant_emotions else [],
    "감정적톤": report_data.emotional_language.emotional_tone or "",
    "상징적요소": report_data.emotional_language.symbolic_elements[:5] if report_data.emotional_language.symbolic_elements else [],
    "강도수준": report_data.emotional_language.intensity_level or ""
}, ensure_ascii=False, indent=2)}

[전문가 결론]
{json.dumps({
    "요약": report_data.professional_conclusion.executive_summary or "",
    "주요발견": report_data.professional_conclusion.key_findings[:5] if report_data.professional_conclusion.key_findings else [],
    "교육방향성": report_data.professional_conclusion.counseling_direction or "",
    "집중탐색영역": report_data.professional_conclusion.focus_areas[:5] if report_data.professional_conclusion.focus_areas else [],
    "전문가평가": report_data.professional_conclusion.professional_assessment or "",
    "권장사항": report_data.professional_conclusion.recommendations[:5] if report_data.professional_conclusion.recommendations else []
}, ensure_ascii=False, indent=2)}

[아이의 말 (Chat 응답)]
{json.dumps(child_words, ensure_ascii=False, indent=2)}

[규칙]
- 20년 경력 미술 심리 전문가의 관점으로 작성
- 해석, 진단, 판단 금지
- 관찰형 문장 사용
- 초등 저학년 보호자가 읽기 쉬운 언어 사용
- 아이의 말은 그대로 인용 (의미 해석하지 않음)
- "~일 수 있음", "~으로 보임" 형태 권장
- 심리·의학적 용어 사용 금지
- 단정형 문장 금지
- 전문가 결론 내용을 자연스럽게 통합

[리포트 형식]
다음 형식으로 작성하세요:

# 그림 기반 교육 참고 리포트

## 1. 그림 관찰 요약
- 시각적 요소 정리
- 객관적 관찰 사항만 기록

## 2. 표현 방식 정리
- 색상, 형태, 구성 등 표현 방식
- 관찰된 특징

## 3. 아이의 말 정리
- Chat에서 나온 아이의 말 그대로 정리
- 의미 해석 없이 인용

## 4. 대화로 이어질 수 있는 질문
- 교육자가 사용할 수 있는 질문 제시
- 개방적이고 탐색적인 질문

## 5. 안내 문구
본 리포트는 그림의 시각적 요소와 아이의 이야기를 정리한 참고 자료이며, 심리 진단이나 치료를 목적으로 하지 않습니다.

리포트를 작성하세요:"""

        # LLM 호출
        try:
            # langchain_openai의 ChatOpenAI는 문자열을 직접 받을 수 있음
            response = self.llm.invoke(prompt)
            
            # 응답이 문자열인 경우 그대로 반환, 객체인 경우 content 추출
            if hasattr(response, 'content'):
                return response.content
            elif isinstance(response, str):
                return response
            else:
                return str(response)
        except Exception as e:
            # 에러 발생 시 기본 리포트 생성
            return f"""# 그림 기반 교육 참고 리포트

## 1. 그림 관찰 요약
{', '.join(report_data.observation.colors[:5]) if report_data.observation.colors else '관찰된 색상이 있습니다.'}

## 2. 표현 방식 정리
{report_data.emotional_language.emotional_tone or '표현 방식이 관찰되었습니다.'}

## 3. 아이의 말 정리
{chr(10).join(f"- {r['answer']}" for r in chat_responses)}

## 4. 대화로 이어질 수 있는 질문
교육자가 아이와 더 깊이 이야기할 수 있는 질문을 준비하세요.

## 5. 안내 문구
본 리포트는 그림의 시각적 요소와 아이의 이야기를 정리한 참고 자료이며, 심리 진단이나 치료를 목적으로 하지 않습니다.

(리포트 생성 중 오류 발생: {str(e)})"""
    
    def format_report_for_display(self, report_content: str) -> str:
        """리포트를 웹 표시용으로 포맷팅"""
        # 마크다운 형식 그대로 반환
        return report_content

