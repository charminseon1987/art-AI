"""리포트 작성 에이전트 - Agent D"""
from crewai import Agent, Task
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from models.report import ReportData, ImageObservation, EmotionalLanguage, ReflectionQuestion


class ReportComposerAgent:
    """모든 분석 결과를 종합하여 교육용 분석 리포트를 작성하는 에이전트"""

    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="분석 리포트 작성 시스템",
            goal="모든 분석 결과를 종합하여 사용자가 교육 목적으로 활용할 수 있는 구조화된 리포트를 작성한다",
            backstory="""당신은 AI 기반 리포트 작성 시스템입니다.
            관찰, 감정 분석, 질문 생성 결과를 종합하여
            사용자가 자신의 그림을 이해하는 데 도움이 되는 교육용 리포트를 작성합니다.
            리포트는 객관적이고 구조화되어 있으며, 자기 이해의 시작점을 제공합니다.

            ⚠️ 본 시스템은 진단이나 치료를 목적으로 하지 않으며, 교육적 참고 자료를 제공하는 분석 도구입니다.""",
            verbose=True,
            llm=llm,
            allow_delegation=False
        )
    
    def create_report_composition_task(
        self,
        observation: ImageObservation,
        emotional_language: EmotionalLanguage,
        reflection_questions: ReflectionQuestion,
        user_emotion: str = None
    ) -> Task:
        """리포트 작성 작업 생성"""
        emotion_section = f"\n사용자 선택 감정: {user_emotion}" if user_emotion else ""
        
        return Task(
            description=f"""
            다음 분석 결과들을 종합하여 교육용 분석 리포트를 작성하세요:

            [관찰 결과]
            색상: {', '.join(observation.colors)}
            형태: {', '.join(observation.shapes)}
            구성: {observation.composition}
            세부사항: {', '.join(observation.details)}
            전체 인상: {observation.overall_impression}

            [감정 표현 분석]
            주요 감정: {', '.join(emotional_language.dominant_emotions)}
            감정적 톤: {emotional_language.emotional_tone}
            시각적 특징 요소: {', '.join(emotional_language.symbolic_elements)}
            강도 수준: {emotional_language.intensity_level}
            {emotion_section}

            [탐색 질문]
            {chr(10).join(reflection_questions.questions)}

            리포트는 다음 구조로 작성하세요:
            1. 요약 (간단한 전체 요약)
            2. 관찰 사항 (구조화된 관찰 결과)
            3. 감정적 표현 (감정 표현 분석 결과)
            4. 탐색 질문 (생성된 질문들)
            5. 활용 시 고려사항 (사용자가 주의할 점)

            참고: 종합 분석은 별도로 생성되므로 리포트 본문에는 포함하지 않습니다.
            리포트는 객관적이고 교육적이며, 자기 이해의 시작점을 제공해야 합니다.

            ⚠️ 본 리포트는 교육 목적의 참고 자료이며, 의료적 진단이나 치료를 대체하지 않습니다.
            """,
            agent=self.agent,
            expected_output="구조화된 분석 리포트 (마크다운 형식)"
        )
    
    def compose_report(
        self,
        observation: ImageObservation,
        emotional_language: EmotionalLanguage,
        reflection_questions: ReflectionQuestion,
        report_text: str
    ) -> str:
        """리포트 텍스트를 최종 형식으로 구성"""
        return report_text

