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
    
    def generate_pdf_from_markdown(self, markdown_content: str, title: str = "그림 상담 리포트") -> bytes:
        """마크다운 내용을 PDF로 변환"""
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
        from reportlab.pdfbase import pdfmetrics
        from reportlab.pdfbase.ttfonts import TTFont
        from io import BytesIO
        import re
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, 
                               topMargin=0.75*inch, 
                               bottomMargin=0.75*inch,
                               leftMargin=0.75*inch,
                               rightMargin=0.75*inch)
        story = []
        styles = getSampleStyleSheet()
        
        # 한글 폰트 설정 (시스템 기본 폰트 사용)
        try:
            # macOS의 경우
            pdfmetrics.registerFont(TTFont('NanumGothic', '/System/Library/Fonts/Supplemental/AppleGothic.ttf'))
            font_name = 'NanumGothic'
        except:
            try:
                # Linux의 경우
                pdfmetrics.registerFont(TTFont('NanumGothic', '/usr/share/fonts/truetype/nanum/NanumGothic.ttf'))
                font_name = 'NanumGothic'
            except:
                font_name = 'Helvetica'  # 기본 폰트 사용
        
        # 제목 스타일
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor='#2c3e50',
            spaceAfter=20,
            alignment=TA_CENTER,
            fontName=font_name
        )
        
        # 섹션 제목 스타일 (##)
        heading2_style = ParagraphStyle(
            'CustomHeading2',
            parent=styles['Heading2'],
            fontSize=16,
            textColor='#34495e',
            spaceAfter=12,
            spaceBefore=20,
            fontName=font_name,
            leading=20
        )
        
        # 소제목 스타일 (###)
        heading3_style = ParagraphStyle(
            'CustomHeading3',
            parent=styles['Heading3'],
            fontSize=14,
            textColor='#34495e',
            spaceAfter=8,
            spaceBefore=12,
            fontName=font_name,
            leading=18
        )
        
        # 본문 스타일
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            leading=16,
            alignment=TA_JUSTIFY,
            fontName=font_name
        )
        
        # 볼드 스타일
        bold_style = ParagraphStyle(
            'CustomBold',
            parent=normal_style,
            fontName=font_name,
            fontSize=11,
            leading=16
        )
        
        # 제목 추가
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # 마크다운 파싱
        lines = markdown_content.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            if not line:
                story.append(Spacer(1, 0.1*inch))
                i += 1
                continue
            
            # ## 제목 (섹션)
            if line.startswith('## '):
                text = line[3:].strip()
                story.append(Paragraph(text, heading2_style))
            
            # ### 제목 (소제목)
            elif line.startswith('### '):
                text = line[4:].strip()
                story.append(Paragraph(text, heading3_style))
            
            # 구분선
            elif line.startswith('---'):
                story.append(Spacer(1, 0.2*inch))
            
            # 리스트 항목 (- 또는 •)
            elif line.startswith('- ') or line.startswith('• '):
                text = line[2:].strip()
                # 볼드 처리
                text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
                story.append(Paragraph(f"• {text}", normal_style))
            
            # 번호 리스트
            elif re.match(r'^\d+\.\s', line):
                text = re.sub(r'^\d+\.\s', '', line)
                text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
                story.append(Paragraph(f"• {text}", normal_style))
            
            # 일반 텍스트
            else:
                # 마크다운 포맷팅 처리
                text = line
                # 볼드 처리
                text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
                # 이탤릭 처리
                text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
                
                if text.strip():
                    story.append(Paragraph(text, normal_style))
            
            i += 1
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
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

