"""AI 분석 서비스 - CrewAI를 사용한 멀티 에이전트 분석"""
from crewai import Crew, Process
from langchain_openai import ChatOpenAI
from agents.image_observation_agent import ImageObservationAgent
from agents.emotional_language_agent import EmotionalLanguageAgent
from agents.reflection_question_agent import ReflectionQuestionAgent
from agents.conclusion_agent import ConclusionAgent
from services.scraping_service import ArtTherapyScrapingService
from models.report import ReportData, ImageObservation, EmotionalLanguage, ReflectionQuestion, ProfessionalConclusion
from typing import Dict, Any, Optional
import json


class AIService:
    """AI 분석 서비스 - 4개 에이전트를 조율하여 리포트 생성"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.image_agent = ImageObservationAgent(llm)
        self.emotional_agent = EmotionalLanguageAgent(llm)
        self.question_agent = ReflectionQuestionAgent(llm)
        self.conclusion_agent = ConclusionAgent(llm)
        self.scraping_service = ArtTherapyScrapingService()
    
    def analyze_image(self, image_description: str, user_emotion: Optional[str] = None) -> ReportData:
        """이미지를 분석하고 리포트 생성"""
        
        # 미술 심리 참고 자료 가져오기
        reference_material = self.scraping_service.get_reference_material()
        enhanced_description = f"""{image_description}

{reference_material}

위 참고 자료를 바탕으로 이 그림을 분석하되, 각 그림의 고유한 특징을 정확히 파악하고 일반화하지 마세요.
"""
        
        # 1단계: 이미지 관찰
        observation_task = self.image_agent.create_observation_task(enhanced_description)
        observation_crew = Crew(
            agents=[self.image_agent.agent],
            tasks=[observation_task],
            process=Process.sequential,
            verbose=True
        )
        observation_result = observation_crew.kickoff()
        observation = self.image_agent.parse_observation(str(observation_result))
        
        # 관찰 결과 디버깅 (개발용)
        import logging
        logging.info(f"관찰 결과: {observation.model_dump()}")
        
        # 관찰 결과가 비어있으면 원본 결과를 포함
        if not observation.colors and not observation.shapes:
            # 원본 결과를 세부사항에 포함
            observation.details.append(f"원본 관찰 결과: {str(observation_result)[:500]}")
        
        # 2단계: 감정 언어 분석 (관찰 결과를 명시적으로 전달)
        emotional_task = self.emotional_agent.create_emotional_analysis_task(observation, user_emotion)
        emotional_crew = Crew(
            agents=[self.emotional_agent.agent],
            tasks=[emotional_task],
            process=Process.sequential,
            verbose=True
        )
        emotional_result = emotional_crew.kickoff()
        emotional_language = self.emotional_agent.parse_emotional_language(str(emotional_result))
        
        # 3단계: 반성 질문 생성
        question_task = self.question_agent.create_question_generation_task(observation, emotional_language)
        question_crew = Crew(
            agents=[self.question_agent.agent],
            tasks=[question_task],
            process=Process.sequential,
            verbose=True
        )
        question_result = question_crew.kickoff()
        reflection_questions = self.question_agent.parse_reflection_questions(str(question_result))
        
        # 디버깅: 질문 파싱 결과 확인
        import logging
        logging.info(f"질문 파싱 결과: {reflection_questions.model_dump()}")
        
        # 질문이 없으면 원본 결과를 로그에 기록
        if not reflection_questions.questions:
            logging.warning(f"질문 파싱 실패. 원본 결과: {str(question_result)[:500]}")
        
        # 4단계: 전문가 결론 생성 (참고 자료 포함)
        reference_material = self.scraping_service.get_reference_material()
        # ConclusionAgent에 참고 자료 전달
        conclusion_agent_with_refs = ConclusionAgent(self.llm, reference_material=reference_material)
        conclusion_task = conclusion_agent_with_refs.create_conclusion_task(
            observation,
            emotional_language,
            reflection_questions,
            user_emotion,
            chat_responses=None  # 이미지 분석 시점에는 사용자 답변이 없음
        )
        conclusion_crew = Crew(
            agents=[conclusion_agent_with_refs.agent],
            tasks=[conclusion_task],
            process=Process.sequential,
            verbose=True
        )
        conclusion_result = conclusion_crew.kickoff()
        professional_conclusion = conclusion_agent_with_refs.parse_conclusion(str(conclusion_result))
        
        # ReportData 객체 생성 (20년 경력 상담전문가의 FinalAnswer를 보고서로 사용)
        import uuid
        report_data = ReportData(
            id=str(uuid.uuid4()),
            observation=observation,
            emotional_language=emotional_language,
            reflection_questions=reflection_questions,
            professional_conclusion=professional_conclusion,
            user_emotion=user_emotion
        )
        
        # 20년 경력 상담전문가의 FinalAnswer를 보고서로 저장
        report_data.image_metadata['professional_report'] = str(conclusion_result)
        
        return report_data
    
    def generate_markdown_report(self, report_data: ReportData) -> str:
        """마크다운 형식의 전문적인 그림 상담 결과 보고서 생성"""
        
        # 리포트 헤더
        report_id = report_data.id[:8] if report_data.id else "N/A"
        created_date = report_data.created_at.strftime('%Y년 %m월 %d일')
        created_time = report_data.created_at.strftime('%H:%M:%S')
        
        md = f"""# 그림 상담 결과 보고서

<div align="right">

**리포트 ID**: `{report_id}`  
**생성일시**: {created_date} {created_time}  
**분석 방법**: AI 기반 미술 심리 분석 (20년 경력 전문가 모델)

</div>

---

## 📋 목차

1. [요약](#요약)
2. [관찰 사항](#1-관찰-사항)
3. [감정적 표현 분석](#2-감정적-표현-분석)
4. [상담 질문](#3-상담-질문)
5. [상담 시 고려사항](#4-상담-시-고려사항)
6. [전문가 결론 및 종합 평가](#5-전문가-결론-및-종합-평가)
{f"7. [상담사 코멘트](#6-상담사-코멘트)" if report_data.counselor_comments else ""}

---

## 요약

이 보고서는 그림 분석을 통해 생성된 상담용 전문 자료입니다. 20년 경력의 미술 심리 전문가 AI 모델을 통해 객관적 관찰, 감정 언어 분석, 상담 질문 생성, 전문가 결론 도출의 4단계 프로세스를 거쳐 작성되었습니다.

{f"**사용자 선택 감정**: {report_data.user_emotion}" if report_data.user_emotion else ""}

---

## 1. 관찰 사항

본 섹션에서는 그림에서 관찰된 객관적 사실만을 기록합니다. 해석이나 진단은 포함하지 않습니다.

### 1.1 색상 분석

{chr(10).join(f"- {color}" for color in report_data.observation.colors) if report_data.observation.colors else '- 관찰되지 않음'}

### 1.2 형태 분석

{chr(10).join(f"- {shape}" for shape in report_data.observation.shapes) if report_data.observation.shapes else '- 관찰되지 않음'}

### 1.3 구성 및 배치

{report_data.observation.composition or '관찰되지 않음'}

### 1.4 세부 관찰 사항

{chr(10).join(f"- {detail}" for detail in report_data.observation.details) if report_data.observation.details else '- 관찰되지 않음'}

### 1.5 전체적인 시각적 인상

{report_data.observation.overall_impression or '관찰되지 않음'}

---

## 2. 감정적 표현 분석

본 섹션에서는 그림에서 나타나는 감정적 표현과 상징적 요소를 객관적으로 식별합니다.

### 2.1 주요 감정 표현

{chr(10).join(f"- **{emotion}**" for emotion in report_data.emotional_language.dominant_emotions) if report_data.emotional_language.dominant_emotions else '- 식별되지 않음'}

### 2.2 감정적 톤

{report_data.emotional_language.emotional_tone or '분석되지 않음'}

### 2.3 상징적 요소

{chr(10).join(f"- {element}" for element in report_data.emotional_language.symbolic_elements) if report_data.emotional_language.symbolic_elements else '- 식별되지 않음'}

### 2.4 감정 표현 강도

**강도 수준**: {report_data.emotional_language.intensity_level or '분석되지 않음'}

{f"### 2.5 사용자 선택 감정\n\n**선택한 감정**: {report_data.user_emotion}" if report_data.user_emotion else ""}

---

## 3. 상담 질문

본 섹션에서는 상담자가 사용할 수 있는 반성적이고 탐색적인 질문들을 제시합니다.

### 3.1 생성된 상담 질문

{chr(10).join(f"{i+1}. {q}" for i, q in enumerate(report_data.reflection_questions.questions)) if report_data.reflection_questions and report_data.reflection_questions.questions else '질문이 생성되지 않았습니다.'}

### 3.2 질문 카테고리

{', '.join(f"**{cat}**" for cat in report_data.reflection_questions.categories) if report_data.reflection_questions.categories else '없음'}

{f"### 3.3 질문의 목적\n\n{report_data.reflection_questions.purpose}" if report_data.reflection_questions.purpose else ""}

---

## 4. 상담 시 고려사항

{report_data.image_metadata.get('professional_report', '20년 경력 상담전문가의 보고서가 생성되지 않았습니다.')}

---

## 5. 전문가 결론 및 종합 평가

20년 경력의 미술 심리 전문가가 모든 분석 결과를 종합하여 도출한 전문적 결론입니다.

### 5.1 요약 및 핵심 인사이트

{report_data.professional_conclusion.executive_summary or '결론이 생성되지 않았습니다.'}

### 5.2 주요 발견 사항

{chr(10).join(f"- {finding}" for finding in report_data.professional_conclusion.key_findings) if report_data.professional_conclusion.key_findings else '- 발견 사항이 없습니다.'}

### 5.3 상담 방향성 제시

{report_data.professional_conclusion.counseling_direction or '상담 방향성이 제시되지 않았습니다.'}

### 5.4 집중 탐색 영역

{chr(10).join(f"- **{area}**" for area in report_data.professional_conclusion.focus_areas) if report_data.professional_conclusion.focus_areas else '- 탐색 영역이 지정되지 않았습니다.'}

### 5.5 전문가 종합 평가

{report_data.professional_conclusion.professional_assessment or '종합 평가가 생성되지 않았습니다.'}

### 5.6 권장 사항

{chr(10).join(f"- {rec}" for rec in report_data.professional_conclusion.recommendations) if report_data.professional_conclusion.recommendations else '- 권장 사항이 없습니다.'}

---

{f"## 6. 상담사 코멘트\n\n{report_data.counselor_comments}\n\n---" if report_data.counselor_comments else ""}

## 📌 중요 안내

- 이 보고서는 **AI 기반 분석**을 통해 생성되었으며, 상담의 **시작점**으로 활용하시기 바랍니다.
- 보고서의 모든 내용은 **객관적 관찰**을 바탕으로 하며, **해석이나 진단은 포함하지 않습니다**.
- 상담사는 본 보고서를 참고하여 내담자와의 대화를 진행하시기 바랍니다.
- 보고서의 결론은 **상담의 방향성을 제시**하는 것이며, 최종 판단은 상담사의 전문성을 통해 이루어집니다.

---

<div align="center">

**생성일**: {created_date} {created_time}  
**분석 시스템**: AI 그림 상담 에이전트 (20년 경력 전문가 모델)

</div>
"""
        return md

