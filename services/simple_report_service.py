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
        chat_responses: List[Dict[str, str]] = None
    ) -> str:
        """사용자용 간단 리포트 생성 (20년 경력 전문가 리포트 형식)"""
        
        # 전문가 리포트 형식으로 작성
        report = f"""# 그림 관찰 기반 상담 참고 리포트

**작성자**: 20년 경력 미술 심리 전문가

---

## 1. 요약

본 리포트는 미술 치료 세션에서 제작된 작품에 대한 관찰, 감정 분석, 질문 생성을 종합하여 정리한 것입니다. 작품은 {report_data.emotional_language.emotional_tone or '다양한 감정을 표현하고 있으며'}, {report_data.observation.overall_impression or '그림의 특징이 관찰되었습니다'}. 이 리포트는 상담사가 세션의 의미를 탐색하고, 치료적 개입의 방향성을 설정하는 데 도움을 줄 것입니다.

---

## 2. 관찰 사항

### 색상 분석
"""
        
        # 색상 정리
        if report_data.observation.colors:
            unique_colors = list(dict.fromkeys(report_data.observation.colors[:10]))  # 중복 제거
            report += "\n".join([f"- {color}" for color in unique_colors])
        else:
            report += "- 관찰된 색상이 있습니다."
        
        report += "\n\n### 형태 분석\n"
        
        # 형태 정리
        if report_data.observation.shapes:
            unique_shapes = list(dict.fromkeys(report_data.observation.shapes[:10]))  # 중복 제거
            report += "\n".join([f"- {shape}" for shape in unique_shapes])
        else:
            report += "- 관찰된 형태가 있습니다."
        
        report += f"\n\n### 구성\n- {report_data.observation.composition or '그림의 구성이 관찰되었습니다.'}\n"
        
        report += "\n### 세부사항\n"
        if report_data.observation.details:
            report += "\n".join([f"- {detail}" for detail in report_data.observation.details[:5]])
        else:
            report += "- 세부사항이 관찰되었습니다."
        
        report += f"\n\n### 전체 인상\n- {report_data.observation.overall_impression or '작품의 전체적인 인상이 관찰되었습니다.'}\n"
        
        report += "\n---\n\n## 3. 감정적 표현\n\n"
        
        # 감정 언어 분석
        if report_data.emotional_language.dominant_emotions:
            report += f"**주요 감정**: {', '.join(report_data.emotional_language.dominant_emotions[:5])}\n\n"
        
        if report_data.emotional_language.emotional_tone:
            report += f"**감정적 톤**: {report_data.emotional_language.emotional_tone}\n\n"
        
        if report_data.emotional_language.symbolic_elements:
            report += f"**상징적 요소**: {', '.join(report_data.emotional_language.symbolic_elements[:5])}\n\n"
        
        if report_data.emotional_language.intensity_level:
            report += f"**강도 수준**: {report_data.emotional_language.intensity_level}\n"
        
        # Chat 응답이 있으면 추가
        if chat_responses:
            report += "\n---\n\n## 4. 아이의 말 정리\n\n"
            for idx, response in enumerate(chat_responses, 1):
                report += f"**질문 {idx}**: {response['question']}\n\n"
                report += f"**답변**: {response['answer']}\n\n"
        
        report += """---

## 5. 대화로 이어질 수 있는 질문

• 이 그림에서 가장 좋아하는 부분은 어디인가요?
• 이 그림을 그릴 때 어떤 생각이 들었나요?
• 이 그림에 이름을 붙인다면 뭐라고 하고 싶나요?

---

⚠ **중요 안내**

본 리포트는 그림의 시각적 요소와 아이의 이야기를 정리한 참고 자료이며,
심리 진단이나 치료를 목적으로 하지 않습니다.
"""
        
        return report

