"""그림 분석 서비스 - 대화형 분석 및 교육 참고 자료 생성"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from langchain_openai import ChatOpenAI
from crewai import Agent, Task, Crew, Process
from models.report import ReportData, ImageObservation, EmotionalLanguage, ReflectionQuestion
from services.scraping_service import ArtTherapyScrapingService
import json


class CounselingService:
    """대화형 그림 분석 서비스"""
    
    def __init__(self, llm: ChatOpenAI, scraping_service: ArtTherapyScrapingService):
        self.llm = llm
        self.scraping_service = scraping_service
        self.counseling_history: List[Dict[str, str]] = []
        self.counselor_agent = self._create_counselor_agent()
        self.report_agent = self._create_report_agent()
    
    def _create_counselor_agent(self) -> Agent:
        """그림 분석 전문가 에이전트 생성"""
        psychology_resources = self.scraping_service.get_psychology_resources()
        
        return Agent(
            role="그림 분석 전문가",
            goal="그림 분석 결과와 대화를 바탕으로 사용자의 표현을 분석하고 교육 참고 자료를 작성한다",
            backstory=f"""당신은 그림 분석과 교육에 관심이 있는 전문가입니다.
            그림을 통한 표현 분석과 교육적 참고 자료 작성에 경험이 있습니다.
            
            당신의 역할:
            - 그림 표현 분석
            - 미술 교육을 통한 표현 이해
            - 사용자 중심 대화 기법
            - 교육적이고 상세한 분석 보고서 작성
            - 연구 기반 교육 이론 적용
            
            참고 자료:
            {psychology_resources}
            
            당신은 항상 사용자의 말을 경청하고, 객관적이면서도 공감적인 관점에서 
            교육적인 분석을 수행합니다. 분석 보고서는 교육적 참고 자료로 활용할 수 있도록 
            상세하고 명확하며, 연구 기반 이론을 바탕으로 작성합니다.""",
            verbose=True,
            llm=self.llm,
            allow_delegation=False,
            max_iter=5
        )
    
    def _create_report_agent(self) -> Agent:
        """분석 보고서 작성 전문가 에이전트"""
        return Agent(
            role="분석 보고서 작성 전문가",
            goal="그림 분석 전문가의 평가를 바탕으로 교육적 참고 자료로 활용할 수 있는 상세한 분석 보고서를 작성한다",
            backstory="""당신은 그림 분석 보고서 작성 전문가입니다.
            그림 분석 전문가가 제공한 평가 내용을 바탕으로
            교육적 참고 자료로 활용할 수 있도록 상세하고 명확한 분석 보고서를 작성합니다.
            
            보고서는 다음을 포함합니다:
            - 사용자 표현 분석
            - 표현 특성 분석
            - 감정 및 인지 패턴 관찰
            - 대인관계 및 사회적 표현 관찰
            - 권장 사항 및 교육 방향
            - 종합 분석 의견""",
            verbose=True,
            llm=self.llm,
            allow_delegation=False
        )
    
    def conduct_counseling_session(
        self,
        report_data: ReportData,
        user_responses: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """대화형 분석 세션 진행 및 평가"""
        
        # 대화 기록 구성
        conversation_summary = self._create_conversation_summary(user_responses)
        
        # 그림 분석 전문가 평가 태스크
        evaluation_task = Task(
            description=f"""
            그림 분석 전문가로서 다음 정보를 바탕으로 사용자의 표현을 교육적으로 분석하세요.
            
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
            
            [대화 내용]
            {conversation_summary}
            
            다음 항목들을 교육적으로 분석하세요:
            
            1. 현재 표현 상태 관찰
               - 전반적인 표현 수준
               - 주요 감정 표현 및 안정성
               - 스트레스 표현 및 대처 방식 관찰
            
            2. 표현 특성 분석
               - 인지 패턴 및 사고 방식 관찰
               - 감정 표현 능력 관찰
               - 자기 인식 수준 관찰
               - 대인관계 표현 패턴 관찰
            
            3. 그림을 통한 표현 분석
               - 그림에서 나타난 표현 메시지
               - 감정 표현 방식
               - 관찰된 표현 특징
               - 관찰된 강점
            
            4. 대화를 통한 표현 통찰
               - 대화에서 드러난 표현 특성
               - 감정 인식 및 표현 능력 관찰
               - 자기 탐색 수준 관찰
               - 변화에 대한 준비도 관찰
            
            5. 종합 표현 분석
               - 관찰된 강점 및 자원
               - 주의 깊게 관찰할 영역
               - 관찰된 표현 특징
               - 성장 가능성 관찰
            
            6. 분석 의견 및 권장 사항
               - 교육 방향성
               - 구체적 교육 방안
               - 후속 대화 제안
               - 자기 탐색 권장 사항
            
            분석은 연구 기반 교육 이론을 바탕으로 하되, 진단명을 함부로 제시하지 마세요.
            객관적이면서도 공감적인 관점을 유지하세요.
            """,
            agent=self.counselor_agent,
            expected_output="""JSON 형식으로 구조화된 전문가 심리 평가:
            {{
                "current_psychological_state": {{
                    "overall_wellbeing": "전반적 웰빙 수준 평가",
                    "emotional_state": "주요 감정 상태",
                    "stress_level": "스트레스 수준",
                    "coping_ability": "대처 능력 평가"
                }},
                "psychological_characteristics": {{
                    "cognitive_patterns": "인지 패턴 분석",
                    "emotional_regulation": "감정 조절 능력",
                    "self_awareness": "자기 인식 수준",
                    "interpersonal_patterns": "대인관계 패턴"
                }},
                "art_expression_analysis": {{
                    "psychological_message": "그림의 심리적 메시지",
                    "emotion_expression": "감정 표현 방식",
                    "inner_conflicts": "내면의 갈등이나 욕구",
                    "resources_strengths": "자원 및 강점"
                }},
                "conversation_insights": {{
                    "psychological_traits": "대화에서 드러난 심리적 특성",
                    "emotion_recognition": "감정 인식 및 표현 능력",
                    "self_exploration": "자기 탐색 수준",
                    "readiness_for_change": "변화에 대한 준비도"
                }},
                "comprehensive_assessment": {{
                    "strengths_resources": ["강점1", "강점2", ...],
                    "areas_of_concern": ["주의 영역1", "주의 영역2", ...],
                    "risk_factors": ["위험 요인1", "위험 요인2", ...],
                    "growth_potential": "성장 가능성 평가"
                }},
                "professional_recommendations": {{
                    "treatment_direction": "치료 방향성",
                    "intervention_approaches": ["개입 방안1", "개입 방안2", ...],
                    "follow_up_suggestions": "후속 상담 제안",
                    "self_care_recommendations": ["자가 관리 권장1", "자가 관리 권장2", ...]
                }},
                "expert_opinion": "전문가 종합 의견 (2-3문단)"
            }}"""
        )
        
        # 평가 수행
        evaluation_crew = Crew(
            agents=[self.counselor_agent],
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
        """교육 참고 분석 보고서 생성"""
        
        report_task = Task(
            description=f"""
            다음 그림 분석 전문가의 평가를 바탕으로 교육적 참고 자료로 활용할 수 있도록 
            상세하고 명확한 분석 보고서를 작성하세요.
            
            [그림 분석 결과]
            {json.dumps({
                "observation": report_data.observation.model_dump(),
                "emotional_language": report_data.emotional_language.model_dump(),
                "user_emotion": report_data.user_emotion
            }, ensure_ascii=False, indent=2)}
            
            [그림 분석 전문가 평가]
            {evaluation_result.get('evaluation', '')}
            
            [대화 요약]
            {evaluation_result.get('conversation_summary', '')}
            
            보고서는 다음 구조로 작성하세요:
            
            # 그림 분석 보고서
            
            ## 1. 사용자 정보 및 분석 개요
            - 분석 일시
            - 분석 방법 (미술 교육 기반)
            - 분석 목적
            
            ## 2. 현재 표현 상태 관찰
            - 전반적인 표현 수준
            - 주요 감정 표현
            - 스트레스 표현 및 대처 방식 관찰
            
            ## 3. 표현 특성 분석
            - 인지 패턴 관찰
            - 감정 표현 능력 관찰
            - 자기 인식 수준 관찰
            - 대인관계 표현 패턴 관찰
            
            ## 4. 그림을 통한 표현 분석
            - 그림에서 나타난 표현 메시지
            - 감정 표현 방식
            - 관찰된 표현 특징
            - 관찰된 강점
            
            ## 5. 대화를 통한 표현 통찰
            - 대화에서 드러난 표현 특성
            - 감정 인식 및 표현 능력 관찰
            - 자기 탐색 수준 관찰
            
            ## 6. 종합 표현 분석
            - 관찰된 강점 및 자원
            - 주의 깊게 관찰할 영역
            - 관찰된 표현 특징
            - 성장 가능성 관찰
            
            ## 7. 분석 의견 및 권장 사항
            - 교육 방향성
            - 구체적 교육 방안
            - 후속 대화 제안
            - 자기 탐색 권장 사항
            
            ## 8. 종합 분석 의견
            
            보고서는 교육적 참고 자료로 활용할 수 있도록:
            - 교육적이고 상세한 내용
            - 연구 기반 교육 이론 적용
            - 객관적이면서도 공감적인 톤
            - 구체적이고 실행 가능한 권장 사항
            - 교육 용어의 적절한 사용
            """,
            agent=self.report_agent,
            expected_output="교육적이고 상세한 그림 분석 보고서 (마크다운 형식)"
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
        """대화 요약 생성"""
        summary = "대화 내용:\n\n"
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
        """다음 탐색 질문 생성"""
        question_agent = Agent(
            role="탐색 질문 생성 전문가",
            goal="이전 대화를 바탕으로 다음 탐색 질문을 생성한다",
            backstory="""당신은 경험 많은 교육 전문가입니다.
            사용자의 이전 답변을 듣고, 더 깊이 있는 탐색을 위한 다음 질문을 생성합니다.
            질문은 개방적이고 탐색적이며, 사용자가 자신의 감정과 경험을 더 깊이 탐색할 수 있도록 돕습니다.""",
            verbose=False,
            llm=self.llm,
            allow_delegation=False
        )
        
        previous_summary = self._create_conversation_summary(previous_responses)
        
        task = Task(
            description=f"""
            다음 정보를 바탕으로 대화의 다음 질문을 생성하세요.
            
            [그림 분석]
            주요 감정: {', '.join(report_data.emotional_language.dominant_emotions) if report_data.emotional_language.dominant_emotions else '없음'}
            감정적 톤: {report_data.emotional_language.emotional_tone or '없음'}
            
            [이전 대화]
            {previous_summary}
            
            이전 질문들과 중복되지 않으면서, 사용자의 감정과 경험을 더 깊이 탐색할 수 있는
            개방적이고 탐색적인 질문을 하나만 생성하세요.
            """,
            agent=question_agent,
            expected_output="탐색 질문 하나 (한 문장)"
        )
        
        crew = Crew(
            agents=[question_agent],
            tasks=[task],
            process=Process.sequential,
            verbose=False
        )
        
        result = crew.kickoff()
        return str(result).strip()

