"""사용자용 간단 리포트 생성 서비스"""
from typing import List, Dict, Any
from models.report import ReportData
from langchain_openai import ChatOpenAI
import json


class SimpleReportService:
    """사용자용 간단 리포트 생성"""
    
    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
    
    def generate_simple_report(
        self,
        report_data: ReportData,
        chat_responses: List[Dict[str, str]] = None,
        age: str = None,
        gender: str = None
    ) -> str:
        """사용자용 간단 리포트 생성 (전문가 리포트 형식)"""
        
        # 기본 정보 섹션
        user_info_section = ""
        if age or gender:
            user_info_section = "## 기본 정보\n\n"
            if age:
                user_info_section += f"- **나이**: {age}\n"
            if gender:
                user_info_section += f"- **성별**: {gender}\n"
            user_info_section += "\n---\n\n"
        
#         # 전문가 리포트 형식으로 작성 (제목과 작성자 제거)
#         report = user_info_section + """## 1. 그림 관찰 요약

# ### 색상 분석
# """
        
#         # 색상 정리
#         if report_data.observation.colors:
#             unique_colors = list(dict.fromkeys(report_data.observation.colors[:10]))  # 중복 제거
#             report += "\n".join([f"- {color}" for color in unique_colors])
#         else:
#             report += "- 관찰된 색상이 있습니다."
        
#         report += "\n\n### 형태 분석\n"
        
#         # 형태 정리
#         if report_data.observation.shapes:
#             unique_shapes = list(dict.fromkeys(report_data.observation.shapes[:10]))  # 중복 제거
#             report += "\n".join([f"- {shape}" for shape in unique_shapes])
#         else:
#             report += "- 관찰된 형태가 있습니다."
        
#         report += f"\n\n### 구성\n- {report_data.observation.composition or '그림의 구성이 관찰되었습니다.'}\n"
        
#         report += "\n### 세부사항\n"
#         if report_data.observation.details:
#             report += "\n".join([f"- {detail}" for detail in report_data.observation.details[:5]])
#         else:
#             report += "- 세부사항이 관찰되었습니다."
        
#         report += f"\n\n### 전체 인상\n- {report_data.observation.overall_impression or '작품의 전체적인 인상이 관찰되었습니다.'}\n"
        
#         report += "\n---\n\n## 2. 감정적 표현\n\n"
        
#         # 감정 언어 분석
#         if report_data.emotional_language.dominant_emotions:
#             report += f"**주요 감정**: {', '.join(report_data.emotional_language.dominant_emotions[:5])}\n\n"
        
#         if report_data.emotional_language.emotional_tone:
#             report += f"**감정적 톤**: {report_data.emotional_language.emotional_tone}\n\n"
        
#         if report_data.emotional_language.symbolic_elements:
#             report += f"**상징적 요소**: {', '.join(report_data.emotional_language.symbolic_elements[:5])}\n\n"
        
#         if report_data.emotional_language.intensity_level:
#             report += f"**강도 수준**: {report_data.emotional_language.intensity_level}\n"
        
#         # Chat 응답이 있으면 추가
#         if chat_responses:
#             report += "\n---\n\n## 3. 아이의 말 정리\n\n"
#             for idx, response in enumerate(chat_responses, 1):
#                 report += f"**질문 {idx}**: {response['question']}\n\n"
#                 report += f"**답변**: {response['answer']}\n\n"
        
        # 리포트 초기화
        report = user_info_section
        
        # 1. 이미지 관찰 결과
        if report_data.observation:
            report += "## 1. 이미지 관찰 결과\n\n"
            
            if report_data.observation.colors and len(report_data.observation.colors) > 0:
                report += "### 색상 분석\n\n"
                unique_colors = list(dict.fromkeys(report_data.observation.colors[:10]))  # 중복 제거
                report += "\n".join([f"- {color}" for color in unique_colors])
                report += "\n\n"
            
            if report_data.observation.shapes and len(report_data.observation.shapes) > 0:
                report += "### 형태 분석\n\n"
                unique_shapes = list(dict.fromkeys(report_data.observation.shapes[:10]))  # 중복 제거
                report += "\n".join([f"- {shape}" for shape in unique_shapes])
                report += "\n\n"
            
            if report_data.observation.composition:
                report += "### 구성\n\n"
                report += f"{report_data.observation.composition}\n\n"
            
            if report_data.observation.details and len(report_data.observation.details) > 0:
                report += "### 세부사항\n\n"
                report += "\n".join([f"- {detail}" for detail in report_data.observation.details[:5]])
                report += "\n\n"
            
            if report_data.observation.overall_impression:
                report += "### 전체 인상\n\n"
                report += f"{report_data.observation.overall_impression}\n\n"
            
            report += "---\n\n"
        
        # 2. 감정언어 분석 결과
        if report_data.emotional_language:
            report += "## 2. 감정언어 분석 결과\n\n"
            
            if report_data.emotional_language.dominant_emotions and len(report_data.emotional_language.dominant_emotions) > 0:
                report += "### 주요 감정\n\n"
                emotions_text = ", ".join(report_data.emotional_language.dominant_emotions[:5])
                report += f"{emotions_text}\n\n"
            
            if report_data.emotional_language.emotional_tone:
                report += "### 감정적 톤\n\n"
                report += f"{report_data.emotional_language.emotional_tone}\n\n"
            
            if report_data.emotional_language.symbolic_elements and len(report_data.emotional_language.symbolic_elements) > 0:
                report += "### 상징적 요소\n\n"
                elements_text = ", ".join(report_data.emotional_language.symbolic_elements[:5])
                report += f"{elements_text}\n\n"
            
            if report_data.emotional_language.intensity_level:
                report += "### 강도 수준\n\n"
                report += f"{report_data.emotional_language.intensity_level}\n\n"
            
            report += "---\n\n"
        
        # 3. 미술심리 전문가 종합분석
        professional_report = report_data.image_metadata.get('professional_report', '') if report_data.image_metadata else ''
        
        if professional_report:
            report += "## 3. 미술심리 전문가 종합분석\n\n"
            # 터미널 출력 형식을 리포트에 그대로 반영
            # ==== 이미지 분석 ====, ==== 감정 언어 분석 ====, ==== 종합결론 전문가 종합 평가 ==== 형식
            report += professional_report
            report += "\n\n"
        else:
            # professional_report가 없는 경우, professional_conclusion에서 종합 평가 부분만 추출
            conclusion = report_data.professional_conclusion
            if conclusion:
                report += "## 3. 미술심리 전문가 종합분석\n\n"
                
                if conclusion.professional_assessment and "결론 파싱 중 오류가 발생했습니다" not in conclusion.professional_assessment:
                    report += f"### 종합 평가\n\n{conclusion.professional_assessment}\n\n"
                
                if conclusion.executive_summary and conclusion.executive_summary != "결론 파싱 중 오류가 발생했습니다.":
                    report += f"### 요약 및 핵심 인사이트\n\n{conclusion.executive_summary}\n\n"
                
                if conclusion.key_findings:
                    report += "### 주요 발견 사항\n\n"
                    for finding in conclusion.key_findings:
                        report += f"- {finding}\n"
                    report += "\n"
                
                if conclusion.counseling_direction:
                    report += f"### 상담 방향성 제시\n\n{conclusion.counseling_direction}\n\n"
                
                if conclusion.focus_areas:
                    report += "### 집중 탐색 영역\n\n"
                    for area in conclusion.focus_areas:
                        report += f"- **{area}**\n"
                    report += "\n"
                
                if conclusion.recommendations:
                    report += "### 권장 사항\n\n"
                    for rec in conclusion.recommendations:
                        report += f"- {rec}\n"
                    report += "\n"
            
            report += "---\n\n"

        # 4. 교육용 상세 분석 (분석 에이전트 결과)
        professional_analysis_report = (
            report_data.image_metadata.get("professional_analysis_report", "")
            if report_data.image_metadata else ""
        )
        if professional_analysis_report:
            report += "## 4. 교육용 상세 분석\n\n"
            report += professional_analysis_report
            report += "\n\n---\n\n"
        
        report += "\n⚠ **중요 안내**\n\n본 리포트는 그림의 시각적 요소와 아이의 이야기를 정리한 참고 자료이며,\n심리 진단이나 치료를 목적으로 하지 않습니다.\n"
        
        return report

