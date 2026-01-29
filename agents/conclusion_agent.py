"""종합 분석 생성 에이전트"""
from crewai import Agent, Task
from typing import Dict, Any, List, Optional
from langchain_openai import ChatOpenAI
from models.report import ImageObservation, EmotionalLanguage, ReflectionQuestion, ProfessionalConclusion


class ConclusionAgent:
    """모든 분석 결과를 종합하여 교육용 종합 분석을 작성하는 에이전트"""

    def __init__(self, llm: ChatOpenAI, reference_material: Optional[str] = None):
        self.reference_material = reference_material or ""
        self.agent = Agent(
            role="AI 종합 분석 시스템",
            goal="AI 분석 시스템으로서 다른 분석 결과들을 바탕으로 그림의 시각적 특성을 종합하고, 탐색 질문에 대한 관찰 기반 분석을 제공하여 객관적이고 교육적인 종합 분석을 작성한다",
            backstory=f"""당신은 AI 기반 종합 분석 시스템입니다.
            그림 분석 결과를 종합하여 교육적 참고 자료를 제공하는 분석 도구입니다.
            
            당신의 전문성:
            - 이미지 관찰 전문가의 관찰 결과를 미술심리학적 관점에서 분석
            - 감정언어 분석 전문가의 감정 분석을 종합하여 심리적 상태 평가
            - 탐색 질문 생성 전문가가 생성한 질문들을 바탕으로 표현 탐색 영역 파악
            - 탐색 질문 생성 전문가가 생성한 각 질문에 대해 교육자로서 직접 교육적인 답변 제공
            - 미술심리학 논문 및 연구 자료를 참고하여 교육적인 분석 수행
            - 세 가지 전문가의 보고서를 종합하여 미술 표현 분석 수행
            - 그림에 나타난 표현 상태를 관찰하고 종합
            - 객관적 관찰과 분석 결과의 종합
            - 핵심 인사이트 도출 및 요약
            - 교육 방향성 제시
            - 교육적 관점에서의 그림 상태 평가
            - 실용적이고 실행 가능한 권장사항 제시
            
            당신은 교육 전문가로서 그림을 분석하고 표현 상태를 관찰합니다.
            탐색 질문 생성 전문가가 생성한 질문들에 대해, 교육자로서 각 질문에 직접 교육적인 관점에서 답변을 제공하는 것이 당신의 핵심 역할입니다.
            미술심리학 논문 및 연구 자료를 참고하여 전문적이고 객관적인 분석을 제공합니다.
            항상 객관적이고 전문적인 관점을 유지하고, 해석이나 진단이 아닌 사실 기반 분석을 제공합니다.
            다른 전문가들의 관찰과 분석 결과를 바탕으로 미술심리 분석과 상태 평가를 제공합니다.
            
            {f"[참고 자료]\n다음은 미술심리학 및 교육 관련 논문 및 연구 자료입니다. 이 자료들을 참고하여 교육적인 분석을 수행하세요:\n{self.reference_material}" if self.reference_material else ""}""",
            verbose=True,
            llm=llm,
            allow_delegation=False
        )
    
    def create_conclusion_task(
        self,
        observation: ImageObservation,
        emotional_language: EmotionalLanguage,
        reflection_questions: ReflectionQuestion,
        user_emotion: str = None,
        chat_responses: List[Dict[str, str]] = None
    ) -> Task:
        """전문가 결론 작성 작업 생성"""
        emotion_section = f"\n아이 선택 감정: {user_emotion}" if user_emotion else ""
        
        return Task(
            description=f"""
            미술 심리 전문가로서 다른 전문가들의 보고서를 종합적으로 심리 분석하여 
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
            
            [3. 탐색 질문 생성 전문가의 보고서]
            이 전문가는 탐색을 위한 질문들을 생성했습니다:
            - 질문들:
            {chr(10).join(f"  • {q}" for q in reflection_questions.questions) if reflection_questions.questions else '  • 없음'}
            - 질문 카테고리: {', '.join(reflection_questions.categories) if reflection_questions.categories else '없음'}
            - 질문의 목적: {reflection_questions.purpose or '없음'}
            
            {f"[4. 아이의 기본 질문 답변]\n아이가 기본 질문들에 대해 다음과 같이 답변했습니다:\n{chr(10).join('  • 질문: ' + str(r.get('question', '')) + '\\n    답변: ' + str(r.get('answer', '')) for r in (chat_responses or []))}\n\n이 답변들은 기본 질문에 대한 아이의 응답이며, 탐색 질문 생성 전문가가 생성한 질문들과는 별개입니다." if chat_responses else ""}
            
            [당신의 교육자 역할 - 핵심 임무]
            당신은 미술 심리 전문가이자 교육자입니다. 
            
            종합결론 전문가 종합 평가는 두 부분으로 구분하여 작성해야 합니다:
            
            [1부: 탐색 질문 생성 전문가가 생성한 질문들에 대한 교육자의 답변]
            위의 탐색 질문 생성 전문가가 생성한 각 질문에 대해, 교육자로서 직접 교육적인 답변을 제공해야 합니다.
            
            각 질문에 대해 교육자로서 답변할 때:
            1. 질문의 의도와 목적을 파악하고, 그림의 시각적 요소와 연결하여 분석합니다
            2. 이미지 관찰 전문가와 감정언어 분석 전문가의 보고서를 바탕으로 그림을 분석합니다
            3. 미술심리학 논문 및 연구 자료를 참고하여 전문적인 관점에서 답변합니다
            4. 그림의 시각적 요소(색상, 형태, 구성, 세부사항)와 감정적 표현을 종합하여 분석합니다
            5. 객관적이고 사실 기반의 분석을 제공합니다
            6. 해석이나 진단이 아닌 관찰과 평가를 제공합니다
            7. 각 질문에 대한 답변을 자연스럽게 통합하여 작성합니다
            
            중요: 
            - 탐색 질문 생성 전문가가 생성한 질문들은 참고용이며, 종합결론에는 질문을 포함하지 않습니다
            - 질문에 대한 설명이나 질문의 목적을 설명하는 문구를 작성하지 마세요
            - 각 질문에 대한 교육자의 답변 내용만 자연스럽게 통합하여 작성하세요
            - 예를 들어, "탐색 질문들은 아이가 자신의 그림에 대해 깊이 탐색하도록 돕기 위해 설계되었습니다" 같은 설명은 작성하지 마세요
            - "탐색 질문들을 통해 아이가..." 같은 문구도 사용하지 마세요
            - 대신 각 질문에 대한 교육자의 교육적인 답변 내용만 자연스럽게 통합하여 작성하세요
            
            {f"[2부: 아이의 기본 질문 답변(채팅) 분석]\n아이가 기본 질문에 답변한 내용을 바탕으로 그림 분석과 연결하여 평가합니다.\n\n작성 시:\n- 아이의 답변 내용을 그림의 시각적 요소와 연결하여 분석합니다\n- 아이가 표현한 감정이나 경험이 그림의 색상, 형태, 구성과 어떻게 연결되는지 평가합니다\n- 객관적이고 사실 기반의 분석을 제공합니다\n- 해석이나 진단이 아닌 관찰과 평가를 제공합니다\n\n중요:\n- 1부(상담 질문 답변)와 2부(아이의 채팅 분석)를 명확히 구분하여 작성하세요\n- 두 부분을 혼합하거나 통합하지 말고, 각각 별도의 문단으로 작성하세요\n- 예를 들어, \"상담 질문들을 통해 아이가...\" 같은 문구는 사용하지 마세요\n- 대신 \"아이가 기본 질문에 답변한 내용을 보면...\" 또는 \"아이의 답변을 그림 분석과 연결하면...\" 같은 형식으로 작성하세요" if chat_responses else ""}
            
            {f"[참고 자료]\n다음은 미술심리학 및 교육 관련 논문 및 연구 자료입니다. 이 자료들을 참고하여 교육적인 분석을 수행하세요:\n{self.reference_material}" if self.reference_material else ""}
            
            [작성 지침]
            이미지 관찰, 감정 분석, 탐색 질문을 종합하여 그림에 나타난 표현 상태를 평가하세요.
            - 사실 기반 분석만 수행하고 해석이나 진단은 하지 않습니다
            - "작가"라는 용어를 절대 사용하지 마세요. 대신 "아이", "그림을 그린 아이", "사용자" 등의 표현을 사용하세요
            - 예를 들어, "작가의 행복한 감정" 대신 "아이의 행복한 감정" 또는 "그림을 그린 아이의 행복한 감정"으로 작성하세요
            - 보기 쉽게 구조화된 보고서를 작성합니다
            - 탐색 질문 생성 전문가가 생성한 각 질문에 대해 교육자로서 직접 교육적인 답변을 제공하세요
            {f"- 아이가 기본 질문에 답변한 내용을 참고하여 종합적인 분석을 수행하세요" if chat_responses else ""}
            
            [당신의 역할]
            교육 전문가로서 위 세 전문가의 보고서를 바탕으로 미술 표현을 분석하고 
            그림에 대한 상태를 평가하세요:
            
            - 이미지 관찰 전문가가 관찰한 시각적 요소들을 미술심리학적 관점에서 분석
              (색상, 형태, 구성, 세부사항이 표현적으로 어떤 의미를 가질 수 있는지)
            
            - 감정언어 분석 전문가가 식별한 감정들을 종합하여 표현 상태 평가
              (주요 감정, 감정적 톤, 상징적 요소가 나타내는 표현 상태나 경험)
            
            - 탐색 질문 생성 전문가가 제시한 질문들을 바탕으로 표현 탐색 영역 파악
              (질문들이 가리키는 표현 탐색 영역과 그림에 대한 상태 평가의 방향성)
            
            - 탐색 질문 생성 전문가가 생성한 각 질문에 대해 교육자로서 직접 교육적인 답변을 제공합니다
              (각 질문의 의도, 그림의 시각적 요소와 감정적 표현을 종합한 분석, 미술심리학적 관점에서의 평가)
              (논문 및 연구 자료를 참고하여 교육적이고 객관적인 답변 제공)
            {f"\n- 아이가 기본 질문에 답변한 내용을 참고하여 그림 분석과 연결합니다\n  (아이의 답변과 그림의 시각적 요소, 감정적 표현을 종합하여 분석)" if chat_responses else ""}
            
            - 세 가지 보고서{chr(10) + "와 아이의 기본 질문 답변" if chat_responses else ""}를 종합하여 미술심리 분석 수행 및 그림 상태 평가
              (관찰, 감정, 질문{chr(10) + ", 아이의 답변" if chat_responses else ""}을 통합하여 그림에 나타난 심리적 상태를 종합적으로 평가)
            
            [최종 보고서 형식]
            다음 구조로 전문가 종합 평가를 작성하세요:
            
            ==== 종합결론 전문가 종합 평가 ====
            
            중요: 대괄호 [ ]로 감싼 섹션 제목을 사용하지 마세요. 모든 내용을 자연스럽게 통합하여 하나의 종합적인 평가로 작성하세요.
            
            작성 시 다음 요소들을 구분하여 작성하세요:
            
            [1부: 탐색 질문 생성 전문가가 생성한 질문들에 대한 교육자의 답변]
            - 그림에 대한 평가
            - 미술 표현 분석을 통한 종합 평가
            - 탐색 질문 생성 전문가가 생성한 각 질문에 대한 교육자의 교육적인 답변 내용을 통합
              (질문에 대한 설명이나 질문의 목적 설명 없이, 각 질문에 대한 답변 내용만 포함)
            - 미술심리학 논문 및 연구 자료를 참고한 교육적인 분석
            - 그림의 시각적 요소(색상, 형태, 구성, 세부사항)와 감정적 표현을 종합한 표현 상태 평가
            
            {f"[2부: 아이의 기본 질문 답변(채팅) 분석]\n- 아이가 기본 질문에 답변한 내용을 그림 분석과 연결한 평가\n- 아이의 답변 내용과 그림의 시각적 요소, 감정적 표현을 종합한 분석\n- 객관적이고 사실 기반의 평가" if chat_responses else ""}
            
            작성 형식:
            - 대괄호 [ ]로 섹션을 구분하지 말고, 자연스러운 문단으로 작성하세요
            - 1부(탐색 질문 답변)와 2부(아이의 채팅 분석)를 명확히 구분하여 작성하세요
            - 각 부분은 별도의 문단으로 작성하되, 자연스럽게 연결되도록 하세요
            - 교육적이면서도 읽기 쉬운 문체로 작성하세요
            - 질문을 나열하지 말고, 질문에 대한 설명을 작성하지 말고, 교육자의 교육적인 답변 내용만 자연스럽게 통합하여 작성하세요
            - "탐색 질문들을 통해 아이가..." 같은 문구는 사용하지 마세요
            - 1부에서는 탐색 질문에 대한 답변만 작성하고, 2부에서는 아이의 채팅 답변 분석만 작성하세요
            
            중요 원칙:
            
            - "작가"라는 용어를 절대 사용하지 마세요. 대신 "아이", "그림을 그린 아이", "사용자" 등의 표현을 사용하세요
            - 예를 들어, "작가의 행복한 감정" 대신 "아이의 행복한 감정" 또는 "그림을 그린 아이의 행복한 감정"으로 작성하세요
            - "작가의 정서적 웰빙" 대신 "아이의 정서적 웰빙" 또는 "그림을 그린 아이의 정서적 웰빙"으로 작성하세요
            - 그림 상담 맥락에 맞는 용어를 사용하세요
            - 보기 쉽게 구조화된 형식으로 작성
            - 객관적이고 전문적인 톤 유지
            """,
            agent=self.agent,
            expected_output=f"""보기 쉽게 구조화된 전문가 종합 평가 보고서:
            
            ==== 종합결론 전문가 종합 평가 ====
            
            (대괄호 [ ] 없이 자연스러운 문단으로 작성)
            
            [1부: 탐색 질문 생성 전문가가 생성한 질문들에 대한 교육자의 답변]
            - 그림에 대한 평가
            - 미술 표현 분석을 통한 종합 평가
            - 탐색 질문 생성 전문가가 생성한 각 질문에 대한 교육자의 교육적인 답변 내용을 자연스럽게 통합
            - 미술심리학 논문 및 연구 자료를 참고한 교육적인 분석
            - 그림의 시각적 요소(색상, 형태, 구성, 세부사항)와 감정적 표현을 종합한 표현 상태 평가
            (질문에 대한 설명 없이, 각 질문에 대한 답변 내용만 자연스럽게 통합하여 작성)
            
            {f"[2부: 아이의 기본 질문 답변(채팅) 분석]\n- 아이가 기본 질문에 답변한 내용을 그림 분석과 연결한 평가\n- 아이의 답변 내용과 그림의 시각적 요소, 감정적 표현을 종합한 분석\n- 객관적이고 사실 기반의 평가\n(1부와 명확히 구분하여 별도의 문단으로 작성)" if chat_responses else ""}
            
            (각 부분은 자연스럽게 연결되되, 명확히 구분되어야 하며, 대괄호나 섹션 제목 없이 흐름 있게 작성)
            
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

