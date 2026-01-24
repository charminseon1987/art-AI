"""그림 분석 서비스 - 대화형 분석 및 교육용 리포트 생성"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from langchain_openai import ChatOpenAI
from crewai import Agent, Task, Crew, Process
from models.report import ReportData, ImageObservation, EmotionalLanguage, ReflectionQuestion
from services.scraping_service import ArtTherapyScrapingService
import json


class AnalysisService:
    """대화형 그림 분석 서비스"""

    def __init__(self, llm: ChatOpenAI, scraping_service: ArtTherapyScrapingService):
        self.llm = llm
        self.scraping_service = scraping_service
        self.analysis_history: List[Dict[str, str]] = []
        self.analyzer_agent = self._create_analyzer_agent()
        self.report_agent = self._create_report_agent()

    def _create_analyzer_agent(self) -> Agent:
        """AI 기반 그림 분석 시스템 에이전트 생성"""
        psychology_resources = self.scraping_service.get_psychology_resources()

        return Agent(
            role="AI 그림 분석 시스템",
            goal="그림 분석 결과와 대화를 바탕으로 사용자의 그림을 객관적으로 관찰하고 분석 리포트를 작성한다",
            backstory=f"""당신은 AI 기반 그림 분석 시스템입니다.
            그림의 색상, 형태, 구성을 객관적으로 관찰하고 분석하는 교육용 도구입니다.

            당신의 기능:
            - 그림의 시각적 요소 분석
            - 감정 표현 관찰
            - 교육 목적의 질문 생성
            - 객관적인 관찰 기록 작성

            참고 자료:
            {psychology_resources}

            당신은 진단이나 치료를 목적으로 하지 않으며, 교육적 참고 자료를 제공하는 분석 도구입니다.
            사용자의 답변을 경청하고, 객관적이면서도 공감적인 관점에서 그림을 관찰합니다.
            분석 리포트는 교육 목적의 참고 자료로만 사용됩니다.

            ⚠️ 중요: 본 분석은 의료적 진단이나 치료를 대체하지 않습니다.""",
            verbose=True,
            llm=self.llm,
            allow_delegation=False,
            max_iter=5
        )

    def _create_report_agent(self) -> Agent:
        """분석 리포트 작성 시스템 에이전트"""
        return Agent(
            role="분석 리포트 작성 시스템",
            goal="분석 결과를 바탕으로 사용자가 교육 목적으로 활용할 수 있는 상세한 분석 리포트를 작성한다",
            backstory="""당신은 AI 기반 리포트 작성 시스템입니다.
            그림 분석 결과를 바탕으로 교육 목적의 참고 자료를 작성합니다.

            리포트는 다음을 포함합니다:
            - 사용자 그림의 현재 표현 분석
            - 시각적 특성 분석
            - 감정 및 표현 패턴
            - 그림 요소 및 구성
            - 교육적 참고 사항
            - 관찰 기반 종합 의견

            ⚠️ 중요: 본 리포트는 교육 목적의 참고 자료이며, 의료적 진단이나 치료를 대체하지 않습니다.""",
            verbose=True,
            llm=self.llm,
            allow_delegation=False
        )

    def conduct_analysis_session(
        self,
        report_data: ReportData,
        user_responses: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """대화형 분석 세션 진행 및 AI 관찰"""

        # 분석 대화 기록 구성
        conversation_summary = self._create_conversation_summary(user_responses)

        # AI 분석 시스템 평가 태스크
        evaluation_task = Task(
            description=f"""
            AI 분석 시스템으로서 다음 정보를 바탕으로 사용자의 그림을 객관적으로 관찰하고 분석하세요.

            [그림 분석 결과]
            관찰 사항:
            - 색상: {', '.join(report_data.observation.colors) if report_data.observation.colors else '없음'}
            - 형태: {', '.join(report_data.observation.shapes) if report_data.observation.shapes else '없음'}
            - 구성: {report_data.observation.composition or '없음'}
            - 전체 인상: {report_data.observation.overall_impression or '없음'}

            감정 언어 분석:
            - 주요 감정: {', '.join(report_data.emotional_language.dominant_emotions) if report_data.emotional_language.dominant_emotions else '없음'}
            - 감정적 톤: {report_data.emotional_language.emotional_tone or '없음'}
            - 상징적 요소: {', '.join(report_data.emotional_language.symbolic_elements) if report_data.emotional_language.symbolic_elements else '없음'}
            - 강도 수준: {report_data.emotional_language.intensity_level or '없음'}

            사용자 선택 감정: {report_data.user_emotion or '없음'}

            [분석 대화 내용]
            {conversation_summary}

            다음 항목들을 교육 목적으로 분석하세요:

            1. 현재 그림 표현 분석
               - 전반적인 그림 특성
               - 주요 감정 표현 및 안정성
               - 표현 방식 및 스타일

            2. 시각적 특성 분석
               - 색상 및 형태 패턴
               - 감정 표현 방식
               - 공간 구성 및 배치
               - 그림 요소 간 관계

            3. 그림을 통한 표현 분석
               - 그림에서 나타난 메시지
               - 감정 표현 방식
               - 시각적 선택과 의도
               - 창의적 요소 및 특징

            4. 대화를 통한 관찰
               - 대화에서 드러난 표현 특성
               - 감정 인식 및 표현 능력
               - 자기 이해 수준
               - 그림에 대한 태도

            5. 종합 관찰
               - 창의적 강점 및 특징
               - 흥미로운 표현 영역
               - 관찰된 패턴
               - 발전 가능성

            6. 교육적 참고 사항
               - 관찰 기반 인사이트
               - 구체적 참고 방향
               - 추가 관찰 제안
               - 교육적 활용 방안

            ⚠️ 중요 원칙:
            - 진단이나 치료 목적이 아닌 교육 목적 분석
            - 객관적 관찰만 제공
            - 전문가 조언은 제공하지 않음
            - 본 분석은 의료적 진단이나 치료를 대체하지 않음
            """,
            agent=self.analyzer_agent,
            expected_output="""JSON 형식으로 구조화된 그림 분석:
            {{
                "current_expression_analysis": {{
                    "overall_characteristics": "전반적 그림 특성",
                    "emotional_expression": "주요 감정 표현",
                    "expression_style": "표현 방식 및 스타일"
                }},
                "visual_characteristics": {{
                    "color_and_form_patterns": "색상 및 형태 패턴",
                    "emotion_expression_style": "감정 표현 방식",
                    "self_perception": "공간 구성 및 배치",
                    "element_relationships": "그림 요소 간 관계"
                }},
                "expression_analysis": {{
                    "visual_message": "그림의 메시지",
                    "emotion_expression": "감정 표현 방식",
                    "visual_choices": "시각적 선택과 의도",
                    "creative_elements": "창의적 요소 및 특징"
                }},
                "conversation_insights": {{
                    "expression_traits": "대화에서 드러난 표현 특성",
                    "emotion_recognition": "감정 인식 및 표현 능력",
                    "self_understanding": "자기 이해 수준",
                    "attitude_toward_art": "그림에 대한 태도"
                }},
                "comprehensive_observation": {{
                    "creative_strengths": ["강점1", "강점2", ...],
                    "interesting_areas": ["흥미로운 영역1", "흥미로운 영역2", ...],
                    "observed_patterns": ["패턴1", "패턴2", ...],
                    "development_potential": "발전 가능성"
                }},
                "educational_references": {{
                    "insights": "관찰 기반 인사이트",
                    "reference_directions": ["참고 방향1", "참고 방향2", ...],
                    "additional_observations": "추가 관찰 제안",
                    "educational_applications": ["교육적 활용1", "교육적 활용2", ...]
                }},
                "analysis_summary": "분석 종합 의견 (2-3문단)"
            }}"""
        )

        # 평가 수행
        evaluation_crew = Crew(
            agents=[self.analyzer_agent],
            tasks=[evaluation_task],
            process=Process.sequential,
            verbose=True
        )
        evaluation_result = evaluation_crew.kickoff()

        return {
            "evaluation": str(evaluation_result),
            "conversation_summary": conversation_summary
        }

    def generate_professional_report(
        self,
        report_data: ReportData,
        evaluation_result: Dict[str, Any]
    ) -> str:
        """교육용 분석 리포트 생성"""

        report_task = Task(
            description=f"""
            다음 분석 결과를 바탕으로 교육 목적의 상세한 그림 분석 리포트를 작성하세요.

            [그림 분석 결과]
            {json.dumps({{
                "observation": report_data.observation.model_dump(),
                "emotional_language": report_data.emotional_language.model_dump(),
                "user_emotion": report_data.user_emotion
            }}, ensure_ascii=False, indent=2)}

            [AI 분석 시스템 평가]
            {evaluation_result.get('evaluation', '')}

            [분석 대화 요약]
            {evaluation_result.get('conversation_summary', '')}

            리포트는 다음 구조로 작성하세요:

            # 그림 분석 리포트

            ⚠️ **중요 고지사항**
            본 자료는 교육 목적의 참고 자료이며, 의료적 진단이나 치료를 대체하지 않습니다.
            전문적인 상담이 필요한 경우 자격을 갖춘 전문가에게 문의하시기 바랍니다.

            ## 1. 분석 개요
            - 분석 일시
            - 분석 방법 (AI 기반 그림 관찰)
            - 분석 목적 (교육 참고 자료)

            ## 2. 현재 그림 표현 분석
            - 전반적인 그림 특성
            - 주요 감정 표현
            - 표현 방식 및 스타일

            ## 3. 시각적 특성 분석
            - 색상 및 형태 패턴
            - 감정 표현 방식
            - 공간 구성
            - 그림 요소 간 관계

            ## 4. 그림을 통한 표현 분석
            - 그림에서 나타난 메시지
            - 감정 표현 방식
            - 시각적 선택과 의도
            - 창의적 요소

            ## 5. 대화를 통한 관찰
            - 대화에서 드러난 표현 특성
            - 감정 인식 및 표현 능력
            - 자기 이해 수준

            ## 6. 종합 관찰
            - 창의적 강점 및 특징
            - 흥미로운 표현 영역
            - 관찰된 패턴
            - 발전 가능성

            ## 7. 교육적 참고 사항
            - 관찰 기반 인사이트
            - 구체적 참고 방향
            - 추가 관찰 제안
            - 교육적 활용 방안

            ## 8. 분석 종합 의견

            리포트 작성 원칙:
            - 교육 목적의 참고 자료로 작성
            - 객관적 관찰 중심
            - 객관적이면서도 공감적인 톤
            - 구체적이고 실행 가능한 참고 사항
            - 진단이나 치료 용어 사용 금지

            ⚠️ 리포트 끝에 다시 한 번 면책 조항 명시:
            본 분석은 AI 도구에 의해 생성되었으며, 인간 전문가의 평가를 대체하지 않습니다.
            """,
            agent=self.report_agent,
            expected_output="교육 목적의 상세한 그림 분석 리포트 (마크다운 형식)"
        )

        report_crew = Crew(
            agents=[self.report_agent],
            tasks=[report_task],
            process=Process.sequential,
            verbose=True
        )

        professional_report = report_crew.kickoff()
        return str(professional_report)

    def _create_conversation_summary(self, user_responses: List[Dict[str, str]]) -> str:
        """분석 대화 요약 생성"""
        summary = "분석 대화 내용:\n\n"
        for i, response in enumerate(user_responses, 1):
            question = response.get('question', '')
            answer = response.get('answer', '')
            summary += f"질문 {i}: {question}\n"
            summary += f"답변: {answer}\n\n"
        return summary

    def get_next_question(
        self,
        report_data: ReportData,
        previous_responses: List[Dict[str, str]]
    ) -> str:
        """다음 분석 질문 생성"""
        question_agent = Agent(
            role="질문 생성 시스템",
            goal="이전 대화를 바탕으로 다음 분석 질문을 생성한다",
            backstory="""당신은 AI 기반 질문 생성 시스템입니다.
            사용자의 이전 답변을 분석하여, 더 깊이 있는 탐색을 위한 다음 질문을 생성합니다.
            질문은 개방적이고 탐색적이며, 사용자가 자신의 감정과 경험을 더 깊이 탐색할 수 있도록 돕습니다.

            ⚠️ 중요: 진단이나 치료 목적이 아닌 교육 목적의 질문만 생성합니다.""",
            verbose=False,
            llm=self.llm,
            allow_delegation=False
        )

        previous_summary = self._create_conversation_summary(previous_responses)

        task = Task(
            description=f"""
            다음 정보를 바탕으로 분석의 다음 질문을 생성하세요.

            [그림 분석]
            주요 감정: {', '.join(report_data.emotional_language.dominant_emotions) if report_data.emotional_language.dominant_emotions else '없음'}
            감정적 톤: {report_data.emotional_language.emotional_tone or '없음'}

            [이전 대화]
            {previous_summary}

            이전 질문들과 중복되지 않으면서, 사용자의 감정과 경험을 더 깊이 탐색할 수 있는
            개방적이고 탐색적인 질문을 하나만 생성하세요.

            ⚠️ 중요: 교육 목적의 질문만 생성하며, 진단이나 치료 관련 질문은 하지 않습니다.
            """,
            agent=question_agent,
            expected_output="분석 질문 하나 (한 문장)"
        )

        crew = Crew(
            agents=[question_agent],
            tasks=[task],
            process=Process.sequential,
            verbose=False
        )

        result = crew.kickoff()
        return str(result).strip()
