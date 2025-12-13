"""전문가 결론 생성 에이전트"""
from crewai import Agent, Task
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from models.report import ImageObservation, EmotionalLanguage, ReflectionQuestion, ProfessionalConclusion


class ConclusionAgent:
    """모든 분석 결과를 종합하여 전문가 결론을 작성하는 에이전트"""
    
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="미술 심리 전문가 (20년 경력)",
            goal="20년간의 미술 치료 경험을 바탕으로 모든 분석 결과를 종합하여 전문적이고 객관적인 결론을 작성한다",
            backstory="""당신은 20년 이상의 경력을 가진 미술 심리 전문가입니다.
            수천 건의 미술 치료 사례를 다루며, 그림 분석 결과를 종합하여 
            전문적이고 객관적인 결론을 도출하는 전문성을 쌓아왔습니다.
            
            당신의 전문성:
            - 객관적 관찰과 분석 결과의 종합
            - 핵심 인사이트 도출 및 요약
            - 상담 방향성 제시
            - 전문가 관점에서의 종합 평가
            - 실용적이고 실행 가능한 권장사항 제시
            
            당신은 항상 객관적이고 전문적인 관점을 유지하며,
            해석이나 진단은 하지 않고, 관찰된 사실을 바탕으로 
            상담의 방향성을 제시합니다.""",
            verbose=True,
            llm=llm,
            allow_delegation=False
        )
    
    def create_conclusion_task(
        self,
        observation: ImageObservation,
        emotional_language: EmotionalLanguage,
        reflection_questions: ReflectionQuestion,
        user_emotion: str = None
    ) -> Task:
        """전문가 결론 작성 작업 생성"""
        emotion_section = f"\n사용자 선택 감정: {user_emotion}" if user_emotion else ""
        
        return Task(
            description=f"""
            20년 경력의 미술 심리 전문가로서 다음 분석 결과들을 종합하여 
            전문적이고 객관적인 결론을 작성하세요:
            
            [관찰 결과]
            색상: {', '.join(observation.colors) if observation.colors else '없음'}
            형태: {', '.join(observation.shapes) if observation.shapes else '없음'}
            구성: {observation.composition or '없음'}
            세부사항: {', '.join(observation.details) if observation.details else '없음'}
            전체 인상: {observation.overall_impression or '없음'}
            
            [감정 언어 분석]
            주요 감정: {', '.join(emotional_language.dominant_emotions) if emotional_language.dominant_emotions else '없음'}
            감정적 톤: {emotional_language.emotional_tone or '없음'}
            상징적 요소: {', '.join(emotional_language.symbolic_elements) if emotional_language.symbolic_elements else '없음'}
            강도 수준: {emotional_language.intensity_level or '없음'}
            {emotion_section}
            
            [반성 질문]
            {chr(10).join(f"- {q}" for q in reflection_questions.questions) if reflection_questions.questions else '없음'}
            
            다음 구조로 전문가 결론을 작성하세요:
            
            1. 요약 및 핵심 인사이트 (Executive Summary)
               - 전체 분석의 핵심 요약
               - 가장 중요한 발견 사항 3-5개
               - 객관적이고 명확한 표현
            
            2. 주요 발견 사항 (Key Findings)
               - 관찰, 감정 분석, 질문에서 도출된 주요 발견 사항
               - 각 발견 사항을 간결하게 나열
               - 객관적 사실 중심
            
            3. 상담 방향성 제시 (Counseling Direction)
               - 이 그림을 바탕으로 한 상담의 주요 방향성
               - 탐색해야 할 주요 영역
               - 상담사가 집중해야 할 포인트
            
            4. 집중 탐색 영역 (Focus Areas)
               - 상담에서 집중적으로 탐색해야 할 구체적 영역
               - 각 영역별 간단한 설명
            
            5. 전문가 종합 평가 (Professional Assessment)
               - 20년 경력 전문가의 관점에서의 종합 평가
               - 객관적이고 전문적인 톤
               - 해석이나 진단 없이 관찰 기반 평가
            
            6. 권장 사항 (Recommendations)
               - 상담사가 참고할 수 있는 실용적 권장 사항
               - 다음 단계 제안
               - 주의사항이나 고려사항
            
            중요 원칙:
            - 객관적이고 전문적인 톤 유지
            - 해석이나 진단은 절대 포함하지 않음
            - 관찰된 사실을 바탕으로 한 결론만 제시
            - 상담사가 실무에서 활용할 수 있는 실용적 내용
            - 명확하고 구조화된 형식
            """,
            agent=self.agent,
            expected_output="""JSON 형식으로 구조화된 전문가 결론:
            {{
                "executive_summary": "요약 및 핵심 인사이트 (2-3문단)",
                "key_findings": [
                    "발견 사항1",
                    "발견 사항2",
                    ...
                ],
                "counseling_direction": "상담 방향성에 대한 상세 설명",
                "focus_areas": [
                    "탐색 영역1",
                    "탐색 영역2",
                    ...
                ],
                "professional_assessment": "전문가 종합 평가 (2-3문단)",
                "recommendations": [
                    "권장 사항1",
                    "권장 사항2",
                    ...
                ]
            }}"""
        )
    
    def parse_conclusion(self, result: str) -> ProfessionalConclusion:
        """결론 결과를 파싱하여 ProfessionalConclusion 객체로 변환"""
        import json
        try:
            # JSON 추출 시도
            result_str = str(result)
            # JSON 부분만 추출 (마크다운 코드 블록 제거)
            if "```json" in result_str:
                json_start = result_str.find("```json") + 7
                json_end = result_str.find("```", json_start)
                result_str = result_str[json_start:json_end].strip()
            elif "```" in result_str:
                json_start = result_str.find("```") + 3
                json_end = result_str.find("```", json_start)
                result_str = result_str[json_start:json_end].strip()
            
            data = json.loads(result_str)
            return ProfessionalConclusion(**data)
        except Exception as e:
            # 파싱 실패 시 기본값 반환
            return ProfessionalConclusion(
                executive_summary="결론 파싱 중 오류가 발생했습니다.",
                professional_assessment=str(result)[:500]  # 원본 텍스트 일부 저장
            )

