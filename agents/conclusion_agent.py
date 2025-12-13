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
            goal="20년 경력의 상담 전문가로서 다른 전문가들의 보고서를 바탕으로 미술심리를 분석하고 그림에 대한 상태를 평가하여 전문적이고 객관적인 결론을 작성한다",
            backstory="""당신은 20년 이상의 경력을 가진 미술 심리 상담 전문가입니다.
            수천 건의 미술 치료 상담 사례를 다루며, 그림을 통한 심리 분석과 상태 평가를 
            수행하는 전문성을 쌓아왔습니다.
            
            당신의 전문성:
            - 이미지 관찰 전문가의 관찰 결과를 미술심리학적 관점에서 분석
            - 감정언어 분석 전문가의 감정 분석을 종합하여 심리적 상태 평가
            - 상담 질문 생성 전문가의 질문을 바탕으로 심리적 탐색 영역 파악
            - 세 가지 전문가의 보고서를 종합하여 미술심리 분석 수행
            - 그림에 나타난 심리적 상태를 평가하고 종합
            - 객관적 관찰과 분석 결과의 종합
            - 핵심 인사이트 도출 및 요약
            - 상담 방향성 제시
            - 전문가 관점에서의 그림 상태 평가
            - 실용적이고 실행 가능한 권장사항 제시
            
            당신은 20년 경력의 상담 전문가로서 그림을 분석하고 심리적 상태를 평가합니다.
            항상 객관적이고 전문적인 관점을 유지고, 해석이나 진단을 함,
            다른 전문가들의 관찰과 분석 결과를 바탕으로 미술심리 분석과 상태 평가를 제공합니다.""",
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
            20년 경력의 미술 심리 전문가로서 다른 전문가들의 보고서를 종합적으로 심리 분석하여 
            전문적이고 객관적인 결론을 작성하세요:
            
            [1. 이미지 관찰 전문가의 보고서]
            이 전문가는 그림의 시각적 요소를 객관적으로 관찰했습니다:
            - 색상: {', '.join(observation.colors) if observation.colors else '없음'}
            - 형태: {', '.join(observation.shapes) if observation.shapes else '없음'}
            - 구성: {observation.composition or '없음'}
            - 세부사항: {chr(10).join(f"  • {detail}" for detail in observation.details) if observation.details else '없음'}
            - 전체 인상: {observation.overall_impression or '없음'}
            
            [2. 감정언어 분석 전문가의 보고서]
            이 전문가는 그림에서 나타나는 감정적 표현을 분석했습니다:
            - 주요 감정: {', '.join(emotional_language.dominant_emotions) if emotional_language.dominant_emotions else '없음'}
            - 감정적 톤: {emotional_language.emotional_tone or '없음'}
            - 상징적 요소: {', '.join(emotional_language.symbolic_elements) if emotional_language.symbolic_elements else '없음'}
            - 강도 수준: {emotional_language.intensity_level or '없음'}
            {emotion_section}
            
            [3. 상담 질문 생성 전문가의 보고서]
            이 전문가는 상담을 위한 질문들을 생성했습니다:
            - 질문들:
            {chr(10).join(f"  • {q}" for q in reflection_questions.questions) if reflection_questions.questions else '  • 없음'}
            - 질문 카테고리: {', '.join(reflection_questions.categories) if reflection_questions.categories else '없음'}
            - 질문의 목적: {reflection_questions.purpose or '없음'}
            
            [작성 지침]
            이미지 관찰, 감정 분석, 상담 질문을 종합하여 그림에 나타난 심리 상태를 평가하세요.
            - 사실 기반 분석만 수행하고 해석이나 진단은 하지 않습니다
            - 사용자가 보기 쉽게 구조화된 보고서를 작성합니다
            
            [당신의 역할]
            20년 경력의 상담 전문가로서 위 세 전문가의 보고서를 바탕으로 미술심리를 분석하고 
            그림에 대한 상태를 평가하세요:
            
            - 이미지 관찰 전문가가 관찰한 시각적 요소들을 미술심리학적 관점에서 분석
              (색상, 형태, 구성, 세부사항이 심리학적으로 어떤 의미를 가질 수 있는지)
            
            - 감정언어 분석 전문가가 식별한 감정들을 종합하여 심리적 상태 평가
              (주요 감정, 감정적 톤, 상징적 요소가 나타내는 심리적 상태나 경험)
            
            - 상담 질문 생성 전문가가 제시한 질문들을 바탕으로 심리적 탐색 영역 파악
              (질문들이 가리키는 심리적 탐색 영역과 그림에 대한 상태 평가의 방향성)
            
            - 세 가지 보고서를 종합하여 미술심리 분석 수행 및 그림 상태 평가
              (관찰, 감정, 질문을 통합하여 그림에 나타난 심리적 상태를 종합적으로 평가)
            
            [최종 보고서 형식]
            다음 구조로 전문가 종합 평가를 작성하세요:
            
            ==== 이미지 분석 ====
            - composition: {observation.composition or '없음'}
            - details: [세부사항 리스트 형식으로 작성]
            - overall_impression: {observation.overall_impression or '없음'}
            
            ==== 감정 언어 분석 ====
            - dominant_emotions: [주요 감정 리스트 형식으로 작성]
            - emotional_tone: {emotional_language.emotional_tone or '없음'}
            - symbolic_elements: [상징적 요소 리스트 형식으로 작성]
            - intensity_level: {emotional_language.intensity_level or '없음'}
            
            ==== 종합결론 전문가 종합 평가 ====
            - 20년 경력 상담 전문가의 관점에서 그림에 대한 상태 평가
            - 미술심리 분석을 통한 종합 평가
            - 객관적이고 전문적인 톤
            - 그림에 나타난 심리적 상태에 대한 평가 (2-3문단)
            
            중요 원칙:
            
            
            - 사용자가 보기 쉽게 구조화된 형식으로 작성
            - 객관적이고 전문적인 톤 유지
            """,
            agent=self.agent,
            expected_output="""사용자가 보기 쉽게 구조화된 전문가 종합 평가 보고서:
            
            ==== 이미지 분석 ====
            composition: [구성 정보]
            details: [세부사항 리스트]
            overall_impression: [전체 인상]
            
            ==== 감정 언어 분석 ====
            dominant_emotions: [주요 감정 리스트]
            emotional_tone: [감정적 톤]
            symbolic_elements: [상징적 요소 리스트]
            intensity_level: [강도 수준]
            
            ==== 종합결론 전문가 종합 평가 ====
            [20년 경력 상담 전문가의 관점에서 그림에 대한 상태 평가]
            [미술심리 분석을 통한 종합 평가]
            [객관적이고 전문적인 톤으로 그림에 나타난 심리적 상태에 대한 평가 (2-3문단)]
            
            """
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
            # 파싱 실패 시 빈 ProfessionalConclusion 반환 (오류 메시지 표시 안 함)
            return ProfessionalConclusion(
                executive_summary="",
                professional_assessment=""
            )

