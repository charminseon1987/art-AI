"""반성 질문 에이전트 - Agent C"""
from crewai import Agent, Task
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from models.report import ReflectionQuestion, ImageObservation, EmotionalLanguage


class ReflectionQuestionAgent:
    """상담을 위한 반성 질문을 생성하는 에이전트"""
    
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="상담 질문 생성 전문가",
            goal="그림 관찰 결과를 바탕으로 상담사가 전문가적 의견을 달 수 있는 질문을 생성한다",
            backstory="""당신은 미술 치료 상담 전문가입니다.
            그림 관찰 결과를 바탕으로 상담사가 전문가적 관점에서 분석하고 
            의견을 제시할 수 있는 질문을 생성합니다. 
            생성된 질문은 상담사가 그림의 시각적 요소, 감정적 표현, 상징적 의미 등을 
            종합적으로 분석하여 전문가적 의견을 달 수 있도록 구성되어야 합니다.""",
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
            다음 그림 분석 결과를 바탕으로 상담사가 전문가적 의견을 달 수 있는 질문을 생성하세요:
            
            관찰 결과:
            - 색상: {', '.join(observation.colors)}
            - 형태: {', '.join(observation.shapes)}
            - 구성: {observation.composition}
            - 세부사항: {', '.join(observation.details)}
            
            감정 언어 분석:
            - 주요 감정: {', '.join(emotional_language.dominant_emotions)}
            - 감정적 톤: {emotional_language.emotional_tone}
            - 상징적 요소: {', '.join(emotional_language.symbolic_elements)}
            
            다음을 고려하여 질문을 생성하세요:
            1. 그림의 구체적인 요소에 대한 전문가적 분석 질문 (색상, 형태, 구성 등)
            2. 감정적 표현에 대한 전문가적 해석 질문
            3. 상징적 의미에 대한 전문가적 평가 질문
            4. 그림의 심리적 상태에 대한 전문가적 분석 질문
            
            질문은 상담사가 미술심리 전문가로서 그림을 분석하고 평가할 수 있도록 
            구성되어야 합니다. 상담사는 각 질문에 대해 그림의 시각적 요소와 
            감정적 표현을 종합하여 전문가적 의견을 제시할 수 있어야 합니다.
            
            각 카테고리별로 2-3개의 질문을 생성하세요.
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

