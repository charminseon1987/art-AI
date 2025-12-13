"""리포트 관리 서비스"""
import json
import os
from datetime import datetime
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from models.report import ReportData

if TYPE_CHECKING:
    from services.ai_service import AIService


class ReportService:
    """리포트 저장, 조회, 수정 서비스"""
    
    def __init__(self, storage_dir: str = "data/reports"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
    
    def save_report(self, report_data: ReportData) -> str:
        """리포트 저장"""
        file_path = os.path.join(self.storage_dir, f"{report_data.id}.json")
        
        # ReportData를 dict로 변환
        report_dict = report_data.model_dump()
        report_dict['created_at'] = report_data.created_at.isoformat()
        report_dict['updated_at'] = report_data.updated_at.isoformat()
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(report_dict, f, ensure_ascii=False, indent=2)
        
        return file_path
    
    def save_markdown_report(self, report_data: ReportData, ai_service: 'AIService', output_dir: str = "data/reports") -> str:
        """마크다운 리포트를 파일로 저장"""
        os.makedirs(output_dir, exist_ok=True)
        
        # 마크다운 리포트 생성
        md_content = ai_service.generate_markdown_report(report_data)
        
        # 파일명 생성 (날짜_시간_리포트ID.md)
        date_str = report_data.created_at.strftime('%Y%m%d_%H%M%S')
        report_id_short = report_data.id[:8] if report_data.id else "unknown"
        filename = f"그림상담보고서_{date_str}_{report_id_short}.md"
        file_path = os.path.join(output_dir, filename)
        
        # 파일 저장
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        return file_path
    
    def load_report(self, report_id: str) -> Optional[ReportData]:
        """리포트 로드"""
        file_path = os.path.join(self.storage_dir, f"{report_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # datetime 문자열을 datetime 객체로 변환
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        
        return ReportData(**data)
    
    def update_report(self, report_id: str, counselor_comments: str = None, **kwargs) -> Optional[ReportData]:
        """리포트 수정 (상담사용)"""
        report = self.load_report(report_id)
        if not report:
            return None
        
        if counselor_comments:
            report.counselor_comments = counselor_comments
            report.counselor_modified = True
        
        # 추가 필드 업데이트
        for key, value in kwargs.items():
            if hasattr(report, key):
                setattr(report, key, value)
        
        report.updated_at = datetime.now()
        self.save_report(report)
        
        return report
    
    def list_reports(self, user_id: Optional[str] = None) -> List[ReportData]:
        """리포트 목록 조회"""
        reports = []
        
        if not os.path.exists(self.storage_dir):
            return reports
        
        for filename in os.listdir(self.storage_dir):
            if filename.endswith('.json'):
                report_id = filename[:-5]  # .json 제거
                report = self.load_report(report_id)
                if report:
                    if user_id is None or report.user_id == user_id:
                        reports.append(report)
        
        # 생성일 기준 내림차순 정렬
        reports.sort(key=lambda x: x.created_at, reverse=True)
        return reports
    
    def generate_pdf_report(self, report_data: ReportData, ai_service: 'AIService') -> bytes:
        """PDF 리포트 생성"""
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        from io import BytesIO
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch)
        story = []
        styles = getSampleStyleSheet()
        
        # 제목 스타일
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor='#2c3e50',
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        # 섹션 제목 스타일
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor='#34495e',
            spaceAfter=12,
            spaceBefore=12
        )
        
        # 본문 스타일
        normal_style = styles['Normal']
        
        # 제목
        story.append(Paragraph("그림 상담 리포트", title_style))
        story.append(Spacer(1, 0.2*inch))
        
        # 생성일
        story.append(Paragraph(f"<b>생성일:</b> {report_data.created_at.strftime('%Y년 %m월 %d일 %H:%M')}", normal_style))
        story.append(Spacer(1, 0.3*inch))
        
        # 마크다운 리포트 생성
        md_report = ai_service.generate_markdown_report(report_data)
        
        # 마크다운을 간단히 파싱하여 PDF에 추가
        # (실제로는 더 정교한 마크다운 파서 사용 권장)
        lines = md_report.split('\n')
        for line in lines:
            if line.startswith('# '):
                story.append(Paragraph(line[2:], title_style))
            elif line.startswith('## '):
                story.append(Spacer(1, 0.2*inch))
                story.append(Paragraph(line[3:], heading_style))
            elif line.startswith('### '):
                story.append(Paragraph(f"<b>{line[4:]}</b>", normal_style))
            elif line.startswith('- '):
                story.append(Paragraph(f"• {line[2:]}", normal_style))
            elif line.startswith(('**', '*')):
                # 간단한 마크다운 처리
                text = line.replace('**', '').replace('*', '')
                if text.strip():
                    story.append(Paragraph(text, normal_style))
            elif line.strip() and not line.startswith('---'):
                story.append(Paragraph(line, normal_style))
            elif line.startswith('---'):
                story.append(Spacer(1, 0.2*inch))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

