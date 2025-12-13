"""감정 언어 에이전트 - Agent B"""
from crewai import Agent, Task
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from models.report import EmotionalLanguage, ImageObservation


class EmotionalLanguageAgent:
    """그림에서 나타나는 감정적 언어와 상징을 분석하는 에이전트"""
    
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="감정 언어 분석 전문가",
            goal="그림에서 나타나는 감정적 표현과 상징적 요소를 식별하고 구조화한다",
            backstory="""당신은 미술 치료와 심리학을 결합한 전문가입니다.
            그림에서 나타나는 감정적 표현, 색상의 감정적 의미, 상징적 요소를 
            객관적으로 식별하고 구조화합니다. 진단은 하지 않고 관찰만 합니다.""",
            verbose=True,
            llm=llm,
            allow_delegation=False
        )
    
    def create_emotional_analysis_task(self, observation: ImageObservation, user_emotion: str = None) -> Task:
        """감정 분석 작업 생성"""
        emotion_context = f"\n사용자가 선택한 감정: {user_emotion}" if user_emotion else ""
        
        # 관찰 결과를 상세하게 전달
        observation_details = f"""
            관찰 결과 상세:
            - 색상: {', '.join(observation.colors) if observation.colors else '관찰되지 않음'}
            - 형태: {', '.join(observation.shapes) if observation.shapes else '관찰되지 않음'}
            - 구성: {observation.composition if observation.composition else '관찰되지 않음'}
            - 세부사항: {', '.join(observation.details[:3]) if observation.details else '관찰되지 않음'}
            - 전체 인상: {observation.overall_impression if observation.overall_impression else '관찰되지 않음'}
        """
        
        return Task(
            description=f"""
            다음 그림 관찰 결과를 바탕으로 감정적 언어를 분석하세요:
            
            {observation_details}
            {emotion_context}
            
            다음 항목들을 분석하세요:
            1. 주요 감정 (색상, 형태, 구성에서 나타나는 감정적 표현)
            2. 감정적 톤 (전체적인 감정적 분위기)
            3. 상징적 요소 (반복되는 패턴, 특별한 기호나 상징)
            4. 강도 수준 (감정 표현의 강도: 약함/보통/강함)
            
            중요: 관찰된 사실을 바탕으로 감정적 언어를 식별하되, 진단이나 해석은 하지 마세요.
            """,
            agent=self.agent,
            expected_output="""JSON 형식으로 구조화된 감정 언어 분석 결과:
            {{
                "dominant_emotions": ["감정1", "감정2", ...],
                "emotional_tone": "감정적 톤 설명",
                "symbolic_elements": ["상징1", "상징2", ...],
                "intensity_level": "약함/보통/강함"
            }}"""
        )
    
    def parse_emotional_language(self, result: str) -> EmotionalLanguage:
        """감정 언어 분석 결과를 파싱"""
        import json
        try:
            data = json.loads(result)
            return EmotionalLanguage(**data)
        except:
            return EmotionalLanguage()

