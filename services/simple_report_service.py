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
        """사용자용 간단 리포트 생성 (초등 저학년 부모가 읽기 쉬운 형식)"""
        
        # 간단한 리포트 구성
        report_parts = []
        
        # 1. 그림 관찰 요약
        observation_summary = []
        if report_data.observation.colors:
            observation_summary.append(f"• 여러 색이 사용되었어요 ({', '.join(report_data.observation.colors[:3])})")
        if report_data.observation.shapes:
            observation_summary.append(f"• 다양한 모양이 보여요 ({', '.join(report_data.observation.shapes[:2])})")
        if report_data.observation.composition:
            observation_summary.append("• 그림이 화면에 잘 배치되어 있어요")
        
        # 2. 표현 방식
        expression_summary = []
        if report_data.emotional_language.emotional_tone:
            expression_summary.append(f"• {report_data.emotional_language.emotional_tone}")
        if report_data.observation.details:
            expression_summary.append(f"• {report_data.observation.details[0] if report_data.observation.details else ''}")
        
        # 3. 아이의 말 (Chat 응답이 있는 경우)
        child_words_summary = []
        if chat_responses:
            for response in chat_responses:
                child_words_summary.append(f"Q: {response['question']}\nA: {response['answer']}")
        
        # 리포트 구성
        report = f"""# 그림 관찰 기반 상담 참고 리포트

## 1️⃣ 그림에서 관찰된 점

{chr(10).join(observation_summary) if observation_summary else '• 그림이 잘 그려져 있어요'}

## 2️⃣ 표현 방식 정리

{chr(10).join(expression_summary) if expression_summary else '• 표현 방식이 다양해요'}

"""
        
        # Chat 응답이 있으면 추가
        if child_words_summary:
            report += f"""## 3️⃣ 아이의 말 정리

{chr(10).join(child_words_summary)}

"""
        
        report += """## 4️⃣ 대화로 이어질 수 있는 질문

• 이 그림에서 가장 좋아하는 부분은 어디인가요?
• 이 그림을 그릴 때 어떤 생각이 들었나요?
• 이 그림에 이름을 붙인다면 뭐라고 하고 싶나요?

---

⚠ **중요 안내**

본 리포트는 그림의 시각적 요소와 아이의 이야기를 정리한 참고 자료이며,
심리 진단이나 치료를 목적으로 하지 않습니다.
"""
        
        return report

