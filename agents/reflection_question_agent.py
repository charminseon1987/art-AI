"""반성 질문 에이전트 - Agent C"""
from crewai import Agent, Task
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from models.report import ReflectionQuestion, ImageObservation, EmotionalLanguage


class ReflectionQuestionAgent:
    """사용자의 자기 탐색을 위한 반성 질문을 생성하는 에이전트"""

    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="탐색 질문 생성 시스템",
            goal="그림 관찰 결과를 바탕으로 사용자가 자기 탐색에 활용할 수 있는 질문을 생성한다",
            backstory="""당신은 AI 기반 질문 생성 시스템입니다.
            그림 관찰 결과를 바탕으로 사용자가 자신의 그림에 대해 더 깊이 생각하고
            표현할 수 있도록 돕는 질문을 생성하는 교육용 도구입니다.
            생성된 질문은 사용자가 그림의 시각적 요소, 감정적 표현, 시각적 특징 등을
            스스로 탐색하고 이해할 수 있도록 구성되어야 합니다.

            ⚠️ 본 시스템은 진단이나 치료를 목적으로 하지 않으며, 교육적 참고 자료를 제공하는 분석 도구입니다.""",
            verbose=True,
            llm=llm,
            allow_delegation=False
        )
    
    def create_question_generation_task(
        self, 
        observation: ImageObservation, 
        emotional_language: EmotionalLanguage
    ) -> Task:
        """질문 생성 작업 생성"""
        return Task(
            description=f"""
            다음 그림 분석 결과를 바탕으로 사용자가 자기 탐색에 활용할 수 있는 질문을 생성하세요:

            관찰 결과:
            - 색상: {', '.join(observation.colors)}
            - 형태: {', '.join(observation.shapes)}
            - 구성: {observation.composition}
            - 세부사항: {', '.join(observation.details)}

            감정 표현 분석:
            - 주요 감정: {', '.join(emotional_language.dominant_emotions)}
            - 감정적 톤: {emotional_language.emotional_tone}
            - 시각적 특징 요소: {', '.join(emotional_language.symbolic_elements)}

            다음을 고려하여 질문을 생성하세요:
            1. 그림의 구체적인 요소에 대한 탐색 질문 (색상, 형태, 구성 등)
            2. 감정적 표현에 대한 탐색 질문
            3. 시각적 특징에 대한 탐색 질문
            4. 그림 제작 경험에 대한 탐색 질문

            질문은 사용자가 자신의 그림을 더 깊이 이해하고 탐색할 수 있도록
            구성되어야 합니다. 사용자는 각 질문에 대해 그림의 시각적 요소와
            감정적 표현을 스스로 생각하고 표현할 수 있어야 합니다.

            각 카테고리별로 2-3개의 질문을 생성하세요.

            ⚠️ 진단이나 치료 목적의 질문이 아닌, 교육적 자기 탐색 질문만 생성하세요.
            """,
            agent=self.agent,
            expected_output="""JSON 형식으로 구조화된 질문 목록:
            {{
                "questions": [
                    "질문1",
                    "질문2",
                    ...
                ],
                "categories": ["색상/형태", "감정", "상징", "경험"],
                "purpose": "질문 생성의 목적 설명"
            }}"""
        )
    
    def parse_reflection_questions(self, result: str) -> ReflectionQuestion:
        """반성 질문 결과를 파싱"""
        import json
        import re
        
        result_str = str(result)
        
        # 마크다운 코드 블록 제거
        if "```json" in result_str:
            json_start = result_str.find("```json") + 7
            json_end = result_str.find("```", json_start)
            if json_end != -1:
                result_str = result_str[json_start:json_end].strip()
        elif "```" in result_str:
            json_start = result_str.find("```") + 3
            json_end = result_str.find("```", json_start)
            if json_end != -1:
                result_str = result_str[json_start:json_end].strip()
        
        # JSON 객체 추출 시도
        try:
            # 직접 JSON 파싱 시도
            data = json.loads(result_str)
            return ReflectionQuestion(**data)
        except json.JSONDecodeError:
            # JSON 파싱 실패 시 정규식으로 추출 시도
            try:
                # JSON 객체 찾기
                json_match = re.search(r'\{.*?"questions".*?\}', result_str, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                    data = json.loads(json_str)
                    return ReflectionQuestion(**data)
            except:
                pass
        
        # 텍스트에서 질문 추출 시도
        try:
            questions = []
            # "questions" 배열 찾기
            questions_match = re.search(r'"questions"\s*:\s*\[(.*?)\]', result_str, re.DOTALL)
            if questions_match:
                questions_content = questions_match.group(1)
                # 각 질문 추출
                question_matches = re.findall(r'"([^"]+)"', questions_content)
                questions = question_matches
            
            # 카테고리 추출
            categories = []
            categories_match = re.search(r'"categories"\s*:\s*\[(.*?)\]', result_str, re.DOTALL)
            if categories_match:
                categories_content = categories_match.group(1)
                category_matches = re.findall(r'"([^"]+)"', categories_content)
                categories = category_matches
            
            # 목적 추출
            purpose = ""
            purpose_match = re.search(r'"purpose"\s*:\s*"([^"]+)"', result_str)
            if purpose_match:
                purpose = purpose_match.group(1)
            
            if questions:
                return ReflectionQuestion(
                    questions=questions,
                    categories=categories if categories else ["색상/형태", "감정", "상징", "경험"],
                    purpose=purpose
                )
        except Exception as e:
            pass
        
        # 모든 파싱 실패 시 빈 객체 반환
        return ReflectionQuestion()

