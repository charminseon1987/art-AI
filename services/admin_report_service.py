"""관리자용 전문 리포트 생성 서비스"""
from typing import Optional
from models.report import ReportData
import html


class AdminReportService:
    """관리자용 전문 리포트 마크다운 생성 서비스"""
    
    def generate_admin_report_markdown(self, report_data: ReportData) -> str:
        """관리자용 전문 리포트 마크다운 생성"""
        markdown = []
        
        # 제목
        markdown.append("# 전문 리포트")
        markdown.append("")
        markdown.append(f"**생성일:** {report_data.created_at.strftime('%Y년 %m월 %d일 %H:%M')}")
        if report_data.user_emotion:
            markdown.append(f"**선택 감정:** {report_data.user_emotion}")
        markdown.append("")
        markdown.append("---")
        markdown.append("")
        
        # 1. 이미지 관찰 전문가 결과
        if report_data.observation:
            markdown.append("## 🎨 1. 이미지 관찰 전문가 결과")
            markdown.append("")
            
            if report_data.observation.colors and len(report_data.observation.colors) > 0:
                markdown.append("### 색상 분석")
                markdown.append("")
                colors_text = ", ".join(report_data.observation.colors)
                markdown.append(colors_text)
                markdown.append("")
            
            if report_data.observation.shapes and len(report_data.observation.shapes) > 0:
                markdown.append("### 형태 분석")
                markdown.append("")
                shapes_text = ", ".join(report_data.observation.shapes)
                markdown.append(shapes_text)
                markdown.append("")
            
            if report_data.observation.composition:
                markdown.append("### 구성")
                markdown.append("")
                markdown.append(report_data.observation.composition)
                markdown.append("")
            
            if report_data.observation.details and len(report_data.observation.details) > 0:
                markdown.append("### 세부사항")
                markdown.append("")
                for detail in report_data.observation.details:
                    markdown.append(f"- {detail}")
                markdown.append("")
            
            if report_data.observation.overall_impression:
                markdown.append("### 전체 인상")
                markdown.append("")
                markdown.append(report_data.observation.overall_impression)
                markdown.append("")
            
            markdown.append("---")
            markdown.append("")
        
        # 2. 감정언어 분석 전문가 결과
        if report_data.emotional_language:
            markdown.append("## 💭 2. 감정언어 분석 전문가 결과")
            markdown.append("")
            
            if report_data.emotional_language.dominant_emotions and len(report_data.emotional_language.dominant_emotions) > 0:
                markdown.append("### 주요 감정")
                markdown.append("")
                emotions_text = ", ".join(report_data.emotional_language.dominant_emotions)
                markdown.append(emotions_text)
                markdown.append("")
            
            if report_data.emotional_language.emotional_tone:
                markdown.append("### 감정적 톤")
                markdown.append("")
                markdown.append(report_data.emotional_language.emotional_tone)
                markdown.append("")
            
            if report_data.emotional_language.symbolic_elements and len(report_data.emotional_language.symbolic_elements) > 0:
                markdown.append("### 상징적 요소")
                markdown.append("")
                elements_text = ", ".join(report_data.emotional_language.symbolic_elements)
                markdown.append(elements_text)
                markdown.append("")
            
            if report_data.emotional_language.intensity_level:
                markdown.append("### 강도 수준")
                markdown.append("")
                markdown.append(report_data.emotional_language.intensity_level)
                markdown.append("")
            
            markdown.append("---")
            markdown.append("")
        
        # 3. 상담 질문 생성 전문가 결과 (상담사 답변 포함)
        if report_data.reflection_questions:
            markdown.append("## ❓ 3. 상담 질문 생성 전문가 결과")
            markdown.append("")
            
            if report_data.reflection_questions.questions and len(report_data.reflection_questions.questions) > 0:
                markdown.append("### 생성된 질문 및 상담사 답변")
                markdown.append("")
                
                # 상담사 답변 가져오기
                counselor_answers = {}
                if report_data.image_metadata:
                    counselor_answers = report_data.image_metadata.get("counselor_answers", {})
                
                for idx, question in enumerate(report_data.reflection_questions.questions):
                    markdown.append(f"**질문 {idx + 1}:** {question}")
                    markdown.append("")
                    
                    # 상담사 답변이 있으면 추가
                    if idx in counselor_answers and counselor_answers[idx]:
                        markdown.append(f"**상담사 답변:**")
                        markdown.append("")
                        markdown.append(counselor_answers[idx])
                        markdown.append("")
                    else:
                        markdown.append("*상담사 답변 없음*")
                        markdown.append("")
                    
                    markdown.append("")
                markdown.append("")
            
            if report_data.reflection_questions.categories and len(report_data.reflection_questions.categories) > 0:
                markdown.append("### 질문 카테고리")
                markdown.append("")
                categories_text = ", ".join(report_data.reflection_questions.categories)
                markdown.append(categories_text)
                markdown.append("")
            
            if report_data.reflection_questions.purpose:
                markdown.append("### 질문의 목적")
                markdown.append("")
                markdown.append(report_data.reflection_questions.purpose)
                markdown.append("")
            
            markdown.append("---")
            markdown.append("")
        
        # 4. 미술심리 전문가 종합 분석 (AI 분석)
        professional_report = (
            report_data.image_metadata.get("professional_report") if report_data.image_metadata else None
        )
        
        if professional_report:
            markdown.append("## 👨‍⚕️ 4. 미술심리 전문가 종합 분석 (AI 분석)")
            markdown.append("")
            # 전문 리포트 내용을 그대로 추가
            markdown.append(str(professional_report))
            markdown.append("")
            markdown.append("---")
            markdown.append("")
        
        # 5. 미술심리 전문가 종합 분석 (상담사 답변 + AI 분석)
        counselor_answers = {}
        counselor_based_analysis = None
        if report_data.image_metadata:
            counselor_answers = report_data.image_metadata.get("counselor_answers", {})
            counselor_based_analysis = report_data.image_metadata.get("counselor_based_analysis", None)
        
        if counselor_answers and any(counselor_answers.values()):
            markdown.append("## 👨‍⚕️ 5. 미술심리 전문가 종합 분석")
            markdown.append("")
            
            # 상담사 답변 섹션
            markdown.append("### 상담사 전문가 의견")
            markdown.append("")
            
            if report_data.reflection_questions and report_data.reflection_questions.questions:
                for idx, question in enumerate(report_data.reflection_questions.questions):
                    if idx in counselor_answers and counselor_answers[idx]:
                        markdown.append(f"**질문 {idx + 1}:** {question}")
                        markdown.append("")
                        markdown.append(f"**상담사 답변:**")
                        markdown.append("")
                        markdown.append(counselor_answers[idx])
                        markdown.append("")
                        markdown.append("")
            
            markdown.append("---")
            markdown.append("")
            
            # AI 종합 분석 섹션
            if counselor_based_analysis:
                markdown.append("### AI 심리 분석 보고서")
                markdown.append("")
                markdown.append("상담사 전문가 의견을 바탕으로 생성된 AI 종합 분석:")
                markdown.append("")
                markdown.append(str(counselor_based_analysis))
                markdown.append("")
        
        return "\n".join(markdown)

