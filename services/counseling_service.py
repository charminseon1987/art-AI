"""심리상담 서비스 - 대화형 상담 및 전문가 보고서 생성"""
from typing import List, Dict, Any, Optional
from datetime import datetime
from langchain_openai import ChatOpenAI
from crewai import Agent, Task, Crew, Process
from models.report import ReportData, ImageObservation, EmotionalLanguage, ReflectionQuestion
from services.scraping_service import ArtTherapyScrapingService
import json


class CounselingService:
    """대화형 심리상담 서비스"""
    
    def __init__(self, llm: ChatOpenAI, scraping_service: ArtTherapyScrapingService):
        self.llm = llm
        self.scraping_service = scraping_service
        self.counseling_history: List[Dict[str, str]] = []
        self.counselor_agent = self._create_counselor_agent()
        self.report_agent = self._create_report_agent()
    
    def _create_counselor_agent(self) -> Agent:
        """30년 경력 심리상담 전문가 에이전트 생성"""
        psychology_resources = self.scraping_service.get_psychology_resources()
        
        return Agent(
            role="30년 경력 심리상담 전문가",
            goal="그림 분석 결과와 대화를 바탕으로 내담자의 심리 상태를 전문적으로 평가하고 상담 보고서를 작성한다",
            backstory=f"""당신은 30년 이상의 경력을 가진 임상 심리 전문가이자 미술 치료 상담 전문가입니다.
            수천 명의 내담자와의 상담 경험을 통해 깊이 있는 심리 평가와 상담 보고서 작성의 전문성을 쌓아왔습니다.
            
            당신의 전문성:
            - 임상 심리 평가 및 진단
            - 미술 치료를 통한 심리 분석
            - 내담자 중심 상담 기법
            - 전문적이고 상세한 상담 보고서 작성
            - 연구 기반 심리 이론 적용
            
            참고 자료:
            {psychology_resources}
            
            당신은 항상 내담자의 말을 경청하고, 객관적이면서도 공감적인 관점에서 
            전문적인 심리 평가를 수행합니다. 상담 보고서는 실제 전문 상담사가 작성한 것처럼 
            상세하고 전문적이며, 연구 기반 이론을 바탕으로 작성합니다.""",
            verbose=True,
            llm=self.llm,
            allow_delegation=False,
            max_iter=5
        )
    
    def _create_report_agent(self) -> Agent:
        """상담 보고서 작성 전문가 에이전트"""
        return Agent(
            role="상담 보고서 작성 전문가",
            goal="심리상담 전문가의 평가를 바탕으로 실제 전문 상담사가 작성한 것과 같은 상세한 상담 보고서를 작성한다",
            backstory="""당신은 임상 심리 보고서 작성 전문가입니다.
            30년 경력의 심리상담 전문가가 제공한 평가 내용을 바탕으로
            실제 전문 상담사가 작성한 것처럼 상세하고 전문적인 상담 보고서를 작성합니다.
            
            보고서는 다음을 포함합니다:
            - 내담자 현재 상태 평가
            - 심리적 특성 분석
            - 감정 및 인지 패턴
            - 대인관계 및 사회적 기능
            - 권장 사항 및 치료 방향
            - 전문가 의견 및 종합 평가""",
            verbose=True,
            llm=self.llm,
            allow_delegation=False
        )
    
    def conduct_counseling_session(
        self,
        report_data: ReportData,
        user_responses: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """대화형 상담 세션 진행 및 전문가 평가"""
        
        # 상담 대화 기록 구성
        conversation_summary = self._create_conversation_summary(user_responses)
        
        # 심리상담 전문가 평가 태스크
        evaluation_task = Task(
            description=f"""
            30년 경력의 심리상담 전문가로서 다음 정보를 바탕으로 내담자의 심리 상태를 전문적으로 평가하세요.
            
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
            
            [상담 대화 내용]
            {conversation_summary}
            
            다음 항목들을 전문적으로 평가하세요:
            
            1. 현재 심리 상태 평가
               - 전반적인 심리적 웰빙 수준
               - 주요 감정 상태 및 안정성
               - 스트레스 수준 및 대처 능력
            
            2. 심리적 특성 분석
               - 인지 패턴 및 사고 방식
               - 감정 조절 능력
               - 자기 인식 수준
               - 대인관계 패턴
            
            3. 그림을 통한 심리적 표현 분석
               - 그림에서 나타난 심리적 메시지
               - 감정 표현 방식
               - 내면의 갈등이나 욕구
               - 자원 및 강점
            
            4. 상담 대화를 통한 심리적 통찰
               - 대화에서 드러난 심리적 특성
               - 감정 인식 및 표현 능력
               - 자기 탐색 수준
               - 변화에 대한 준비도
            
            5. 종합 심리 평가
               - 강점 및 자원
               - 주의가 필요한 영역
               - 심리적 위험 요인
               - 성장 가능성
            
            6. 전문가 의견 및 권장 사항
               - 치료 방향성
               - 구체적 개입 방안
               - 후속 상담 제안
               - 자가 관리 권장 사항
            
            평가는 연구 기반 심리 이론을 바탕으로 하되, 진단명을 함부로 제시하지 마세요.
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
        """전문 상담 보고서 생성"""
        
        report_task = Task(
            description=f"""
            다음 심리상담 전문가의 평가를 바탕으로 실제 전문 상담사가 작성한 것처럼 
            상세하고 전문적인 심리상담 보고서를 작성하세요.
            
            [그림 분석 결과]
            {json.dumps({
                "observation": report_data.observation.model_dump(),
                "emotional_language": report_data.emotional_language.model_dump(),
                "user_emotion": report_data.user_emotion
            }, ensure_ascii=False, indent=2)}
            
            [심리상담 전문가 평가]
            {evaluation_result.get('evaluation', '')}
            
            [상담 대화 요약]
            {evaluation_result.get('conversation_summary', '')}
            
            보고서는 다음 구조로 작성하세요:
            
            # 심리상담 보고서
            
            ## 1. 내담자 정보 및 상담 개요
            - 상담 일시
            - 상담 방법 (미술 치료 기반)
            - 상담 목적
            
            ## 2. 현재 상태 평가
            - 전반적인 심리적 웰빙
            - 주요 감정 상태
            - 스트레스 및 대처 능력
            
            ## 3. 심리적 특성 분석
            - 인지 패턴
            - 감정 조절 능력
            - 자기 인식
            - 대인관계 패턴
            
            ## 4. 그림을 통한 심리적 표현 분석
            - 그림에서 나타난 심리적 메시지
            - 감정 표현 방식
            - 내면의 갈등과 욕구
            - 자원 및 강점
            
            ## 5. 상담 대화를 통한 심리적 통찰
            - 대화에서 드러난 심리적 특성
            - 감정 인식 및 표현 능력
            - 자기 탐색 수준
            
            ## 6. 종합 심리 평가
            - 강점 및 자원
            - 주의가 필요한 영역
            - 심리적 위험 요인
            - 성장 가능성
            
            ## 7. 전문가 의견 및 권장 사항
            - 치료 방향성
            - 구체적 개입 방안
            - 후속 상담 제안
            - 자가 관리 권장 사항
            
            ## 8. 전문가 종합 의견
            
            보고서는 실제 전문 상담사가 작성한 것처럼:
            - 전문적이고 상세한 내용
            - 연구 기반 심리 이론 적용
            - 객관적이면서도 공감적인 톤
            - 구체적이고 실행 가능한 권장 사항
            - 전문 용어의 적절한 사용
            """,
            agent=self.report_agent,
            expected_output="전문적이고 상세한 심리상담 보고서 (마크다운 형식)"
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
        """상담 대화 요약 생성"""
        summary = "상담 대화 내용:\n\n"
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
        """다음 상담 질문 생성"""
        question_agent = Agent(
            role="상담 질문 생성 전문가",
            goal="이전 대화를 바탕으로 다음 상담 질문을 생성한다",
            backstory="""당신은 경험 많은 상담 전문가입니다.
            내담자의 이전 답변을 듣고, 더 깊이 있는 탐색을 위한 다음 질문을 생성합니다.
            질문은 개방적이고 탐색적이며, 내담자가 자신의 감정과 경험을 더 깊이 탐색할 수 있도록 돕습니다.""",
            verbose=False,
            llm=self.llm,
            allow_delegation=False
        )
        
        previous_summary = self._create_conversation_summary(previous_responses)
        
        task = Task(
            description=f"""
            다음 정보를 바탕으로 상담의 다음 질문을 생성하세요.
            
            [그림 분석]
            주요 감정: {', '.join(report_data.emotional_language.dominant_emotions) if report_data.emotional_language.dominant_emotions else '없음'}
            감정적 톤: {report_data.emotional_language.emotional_tone or '없음'}
            
            [이전 대화]
            {previous_summary}
            
            이전 질문들과 중복되지 않으면서, 내담자의 감정과 경험을 더 깊이 탐색할 수 있는
            개방적이고 탐색적인 질문을 하나만 생성하세요.
            """,
            agent=question_agent,
            expected_output="상담 질문 하나 (한 문장)"
        )
        
        crew = Crew(
            agents=[question_agent],
            tasks=[task],
            process=Process.sequential,
            verbose=False
        )
        
        result = crew.kickoff()
        return str(result).strip()

