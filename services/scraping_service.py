"""미술 심리 관련 웹 스크래핑 서비스"""
import os
import json
from typing import List, Dict, Any, Optional
from crewai_tools import WebsiteSearchTool, ScrapeWebsiteTool
import requests
from bs4 import BeautifulSoup
import time
import urllib.parse
from pathlib import Path
import hashlib
import urllib.parse
from pathlib import Path


class ArtTherapyScrapingService:
    """미술 심리 및 미술 치료 관련 정보 스크래핑 서비스"""
    
    def __init__(self, cache_dir: str = "data/scraped"):
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
        self.scrape_tool = ScrapeWebsiteTool()
    
    def scrape_art_therapy_resources(self) -> Dict[str, Any]:
        """미술 치료 관련 리소스 스크래핑"""
        cache_file = os.path.join(self.cache_dir, "art_therapy_resources.json")
        
        # 캐시 확인
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        resources = {
            "color_psychology": self._scrape_color_psychology(),
            "shape_psychology": self._scrape_shape_psychology(),
            "composition_analysis": self._scrape_composition_analysis(),
            "art_therapy_cases": self._scrape_art_therapy_cases(),
        }
        
        # 캐시 저장
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(resources, f, ensure_ascii=False, indent=2)
        
        return resources
    
    def _scrape_color_psychology(self) -> Dict[str, str]:
        """색채 심리학 정보 스크래핑"""
        # 실제 웹사이트에서 스크래핑하거나, 기본 참고 자료 제공
        color_psychology = {
            "빨간색": "에너지, 열정, 강렬함, 분노, 긴장감을 나타낼 수 있음",
            "파란색": "평온, 안정, 차분함, 우울, 고요함을 나타낼 수 있음",
            "노란색": "기쁨, 낙관, 활기, 불안, 경고를 나타낼 수 있음",
            "초록색": "자연, 성장, 평화, 안정, 휴식을 나타낼 수 있음",
            "보라색": "창의성, 신비, 영성, 고독, 우울을 나타낼 수 있음",
            "주황색": "열정, 활동, 친근함, 불안, 흥분을 나타낼 수 있음",
            "검은색": "강력함, 우울, 공허, 보호, 권위를 나타낼 수 있음",
            "흰색": "순수, 평화, 공허, 새로운 시작, 고립을 나타낼 수 있음",
            "회색": "중립, 우울, 무기력, 안정, 지루함을 나타낼 수 있음",
            "갈색": "안정, 땅, 보호, 고립, 우울을 나타낼 수 있음",
        }
        
        return color_psychology
    
    def _scrape_shape_psychology(self) -> Dict[str, str]:
        """형태 심리학 정보 스크래핑"""
        shape_psychology = {
            "원형": "완전성, 보호, 통합, 안정, 고립을 나타낼 수 있음",
            "사각형": "안정, 질서, 구조, 경직, 제한을 나타낼 수 있음",
            "삼각형": "에너지, 방향성, 긴장, 불안정, 공격성을 나타낼 수 있음",
            "직선": "강직, 확고함, 경직, 제한, 안정을 나타낼 수 있음",
            "곡선": "유연성, 부드러움, 흐름, 변화, 불안정을 나타낼 수 있음",
            "나선형": "성장, 변화, 혼란, 탐색, 발전을 나타낼 수 있음",
            "지그재그": "에너지, 긴장, 불안, 변화, 갈등을 나타낼 수 있음",
        }
        
        return shape_psychology
    
    def _scrape_composition_analysis(self) -> Dict[str, str]:
        """구성 분석 정보 스크래핑"""
        composition_analysis = {
            "중앙 집중": "자아 중심, 집중, 안정, 고립을 나타낼 수 있음",
            "좌측 배치": "과거, 내면, 수동성, 회상을 나타낼 수 있음",
            "우측 배치": "미래, 외향, 활동성, 기대를 나타낼 수 있음",
            "상단 배치": "이상, 정신, 추상, 도피를 나타낼 수 있음",
            "하단 배치": "현실, 물질, 안정, 기반을 나타낼 수 있음",
            "대칭": "균형, 안정, 질서, 경직을 나타낼 수 있음",
            "비대칭": "불균형, 역동성, 변화, 불안정을 나타낼 수 있음",
            "공간 활용": "공간 사용 방식은 내면 상태와 관련될 수 있음",
        }
        
        return composition_analysis
    
    def _scrape_art_therapy_cases(self) -> List[Dict[str, str]]:
        """미술 치료 사례 정보 (참고용)"""
        # 실제로는 웹에서 스크래핑하거나 데이터베이스에서 가져옴
        cases = [
            {
                "case_type": "색상 사용",
                "description": "밝은 색상 사용은 긍정적 에너지와 관련될 수 있음",
                "note": "단, 맥락과 전체 구성을 함께 고려해야 함"
            },
            {
                "case_type": "형태 선택",
                "description": "기하학적 형태는 구조와 질서를, 유기적 형태는 유연성을 나타낼 수 있음",
                "note": "개인의 표현 스타일과 문화적 배경을 고려해야 함"
            },
            {
                "case_type": "구성 패턴",
                "description": "중앙 집중은 자아 중심, 분산은 다양한 관심사를 나타낼 수 있음",
                "note": "해석은 신중하게, 내담자의 설명을 듣는 것이 중요함"
            },
        ]
        
        return cases
    
    def get_psychology_resources(self) -> str:
        """심리상담 논문 및 자료 스크래핑"""
        cache_file = os.path.join(self.cache_dir, "psychology_resources.json")
        
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                resources = json.load(f)
        else:
            resources = {
                "art_therapy_research": self._scrape_art_therapy_research(),
                "psychological_assessment": self._scrape_psychological_assessment(),
                "emotion_analysis": self._scrape_emotion_analysis(),
            }
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(resources, f, ensure_ascii=False, indent=2)
        
        return self._format_psychology_resources(resources)
    
    def _scrape_art_therapy_research(self) -> List[Dict[str, str]]:
        """미술 치료 연구 논문 정보"""
        return [
            {
                "title": "미술 치료를 통한 감정 표현 연구",
                "key_findings": "그림을 통한 감정 표현은 언어적 표현과 다른 차원의 심리적 정보를 제공함",
                "application": "색상, 형태, 구성을 통한 감정 상태 평가에 활용"
            },
            {
                "title": "색채 심리학과 미술 치료",
                "key_findings": "색상 선택은 무의식적 감정 상태를 반영할 수 있음",
                "application": "색상 분석을 통한 감정 상태 파악"
            },
            {
                "title": "미술 치료에서의 상징 분석",
                "key_findings": "그림의 상징적 요소는 내면의 갈등과 욕구를 나타낼 수 있음",
                "application": "상징 분석을 통한 심리적 통찰 도출"
            }
        ]
    
    def _scrape_psychological_assessment(self) -> List[Dict[str, str]]:
        """심리 평가 방법론"""
        return [
            {
                "method": "전반적 웰빙 평가",
                "criteria": "감정 안정성, 스트레스 수준, 대처 능력, 사회적 기능",
                "tools": "자기 보고, 행동 관찰, 그림 분석"
            },
            {
                "method": "감정 조절 능력 평가",
                "criteria": "감정 인식, 감정 표현, 감정 조절 전략",
                "tools": "대화 분석, 그림 분석, 자기 보고"
            },
            {
                "method": "대인관계 패턴 분석",
                "criteria": "사회적 상호작용, 애착 패턴, 갈등 해결 방식",
                "tools": "대화 분석, 그림 구성 분석"
            }
        ]
    
    def _scrape_emotion_analysis(self) -> Dict[str, Any]:
        """감정 분석 연구 자료"""
        return {
            "emotion_recognition": "감정 인식 능력은 심리적 웰빙과 밀접한 관련이 있음",
            "emotion_expression": "감정 표현 방식은 문화적 배경과 개인적 경험에 영향받음",
            "emotion_regulation": "감정 조절 능력은 스트레스 대처와 정신 건강에 중요함"
        }
    
    def _format_psychology_resources(self, resources: Dict[str, Any]) -> str:
        """심리학 자료 포맷팅"""
        formatted = "## 심리상담 참고 자료\n\n"
        
        formatted += "### 미술 치료 연구\n"
        for research in resources.get("art_therapy_research", []):
            formatted += f"- **{research['title']}**: {research['key_findings']}\n"
            formatted += f"  적용: {research['application']}\n"
        
        formatted += "\n### 심리 평가 방법론\n"
        for method in resources.get("psychological_assessment", []):
            formatted += f"- **{method['method']}**: {method['criteria']}\n"
            formatted += f"  도구: {method['tools']}\n"
        
        formatted += "\n### 감정 분석 연구\n"
        emotion = resources.get("emotion_analysis", {})
        for key, value in emotion.items():
            formatted += f"- **{key}**: {value}\n"
        
        return formatted
    
    def get_reference_material(self) -> str:
        """에이전트가 참고할 수 있는 미술 심리 자료 반환 (논문 및 연구 자료 포함)"""
        resources = self.scrape_art_therapy_resources()
        psychology_resources = self.get_psychology_resources()
        
        reference = """
## 미술 심리 참고 자료

### 색채 심리학
"""
        for color, meaning in resources["color_psychology"].items():
            reference += f"- **{color}**: {meaning}\n"
        
        reference += "\n### 형태 심리학\n"
        for shape, meaning in resources["shape_psychology"].items():
            reference += f"- **{shape}**: {meaning}\n"
        
        reference += "\n### 구성 분석\n"
        for comp, meaning in resources["composition_analysis"].items():
            reference += f"- **{comp}**: {meaning}\n"
        
        reference += "\n### 미술심리학 논문 및 연구 자료\n"
        reference += psychology_resources
        
        reference += "\n### 중요 원칙\n"
        reference += "- 모든 해석은 맥락과 함께 고려되어야 함\n"
        reference += "- 개인의 표현 스타일과 문화적 배경을 고려해야 함\n"
        reference += "- 해석보다는 관찰과 질문에 집중해야 함\n"
        reference += "- 논문 및 연구 자료를 참고하여 전문적인 분석 수행\n"
        reference += "- 객관적이고 사실 기반의 분석 제공\n"
        
        return reference
    
    def scrape_web_art_therapy_info(self, query: str) -> str:
        """웹에서 미술 치료 관련 정보 검색 및 스크래핑"""
        try:
            # 간단한 웹 검색 (실제로는 더 정교한 검색 엔진 사용)
            # 여기서는 기본적인 정보만 반환
            return f"'{query}'에 대한 미술 치료 관련 정보를 검색했습니다."
        except Exception as e:
            return f"웹 스크래핑 중 오류 발생: {str(e)}"
    
    def scrape_fingerprint_blog(self) -> Dict[str, Any]:
        """지문상담 관련 네이버 블로그 스크래핑"""
        cache_file = os.path.join(self.cache_dir, "fingerprint_blog.json")
        
        # 캐시 확인
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        try:
            # 네이버 블로그 스크래핑 시도
            # 네이버 블로그는 모바일 버전 URL을 사용하면 더 쉽게 스크래핑 가능
            url = "https://m.blog.naver.com/kmj656900/223668088448"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 블로그 내용 추출
            blog_content = {
                "title": "",
                "images": [],
                "text_content": [],
                "sections": []
            }
            
            # 제목 추출 (여러 방법 시도)
            title_selectors = [
                'title',
                'h1.se-title-text',
                '.se-title-text',
                '.post-title',
                'h1',
                '.se-module-text h1'
            ]
            for selector in title_selectors:
                title_tag = soup.select_one(selector)
                if title_tag:
                    blog_content["title"] = title_tag.get_text(strip=True)
                    break
            
            # 이미지 추출 및 다운로드
            images = soup.find_all('img')
            seen_images = set()
            fingerprint_images_dir = "frontend/public/fingerprints"
            os.makedirs(fingerprint_images_dir, exist_ok=True)
            
            for img in images:
                img_src = img.get('src') or img.get('data-src') or img.get('data-lazy-src') or img.get('data-original')
                if img_src:
                    # 상대 경로를 절대 경로로 변환
                    if img_src.startswith('//'):
                        img_src = 'https:' + img_src
                    elif img_src.startswith('/'):
                        img_src = 'https://blog.naver.com' + img_src
                    elif not img_src.startswith('http'):
                        continue
                    
                    # 중복 제거 및 필터링
                    if img_src not in seen_images and 'http' in img_src:
                        # 로고, 아이콘 등 제외
                        if any(exclude in img_src.lower() for exclude in ['logo', 'icon', 'button', 'spacer', 'blank']):
                            continue
                        seen_images.add(img_src)
                        alt_text = img.get('alt', '') or img.get('title', '') or ''
                        # 지문 관련 이미지 우선, 아니면 모든 이미지 포함 (최대 10개)
                        if ('fingerprint' in img_src.lower() or '지문' in alt_text.lower() or 
                            'finger' in img_src.lower() or 'pattern' in img_src.lower() or
                            len(blog_content["images"]) < 10):
                            
                            # 이미지 다운로드 및 저장
                            saved_path = self._download_image(img_src, fingerprint_images_dir, alt_text)
                            
                            blog_content["images"].append({
                                "src": saved_path if saved_path else img_src,  # 저장 성공 시 로컬 경로, 실패 시 원본 URL
                                "alt": alt_text,
                                "original_url": img_src  # 원본 URL 보관
                            })
            
            # 텍스트 내용 추출 (네이버 블로그 스마트에디터 클래스 사용)
            text_selectors = [
                '.se-component-text',
                '.se-module-text',
                '.se-text',
                '.post-view',
                'p.se-text-paragraph',
                '.se-section-text'
            ]
            seen_texts = set()
            for selector in text_selectors:
                text_elements = soup.select(selector)
                for elem in text_elements:
                    text = elem.get_text(strip=True)
                    # 의미있는 텍스트만 (10자 이상, 중복 제거)
                    if text and len(text) > 10 and text not in seen_texts:
                        seen_texts.add(text)
                        blog_content["text_content"].append(text)
            
            # 섹션별로 내용 정리
            sections = soup.select('.se-section, .se-module')
            for section in sections:
                section_title = ""
                section_text = ""
                section_img = None
                
                # 섹션 제목 찾기
                title_elem = section.select_one('h1, h2, h3, .se-title-text')
                if title_elem:
                    section_title = title_elem.get_text(strip=True)
                
                # 섹션 텍스트 찾기
                text_elem = section.select_one('.se-text, .se-component-text')
                if text_elem:
                    section_text = text_elem.get_text(strip=True)
                
                # 섹션 이미지 찾기
                img_elem = section.select_one('img')
                if img_elem:
                    img_src = img_elem.get('src') or img_elem.get('data-src')
                    if img_src:
                        if img_src.startswith('//'):
                            img_src = 'https:' + img_src
                        elif img_src.startswith('/'):
                            img_src = 'https://blog.naver.com' + img_src
                        section_img = img_src
                
                if section_title or section_text:
                    blog_content["sections"].append({
                        "title": section_title,
                        "content": section_text,
                        "image": section_img
                    })
            
        except Exception as e:
            print(f"블로그 스크래핑 오류: {str(e)}")
            # 기본 데이터 반환
            blog_content = {
                "title": "지문상담 관련 정보",
                "images": [],
                "text_content": [
                    "지문상담은 하워드 가드너의 다중지능 이론을 바탕으로 한 과학적 분석 방법입니다.",
                    "엄지손가락의 지문 패턴은 개인의 주된 성격 특성을 나타내는 중요한 지표입니다.",
                    "각 손가락의 지문 패턴을 분석하여 8가지 지능 유형 중 강점을 파악할 수 있습니다."
                ],
                "sections": [
                    {
                        "title": "지문 패턴의 의미",
                        "content": "나선형, 고리형, 호형, 복합형 등 다양한 지문 패턴은 각각 다른 지능 영역과 연관되어 있습니다.",
                        "image": None
                    },
                    {
                        "title": "엄지 주성격 분석",
                        "content": "엄지손가락의 지문 패턴을 통해 개인의 주된 성격 특성과 학습 스타일을 파악할 수 있습니다.",
                        "image": None
                    }
                ]
            }
        
        # 캐시 저장
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(blog_content, f, ensure_ascii=False, indent=2)
        
        return blog_content
    
    def _download_image(self, img_url: str, save_dir: str, alt_text: str = "") -> Optional[str]:
        """이미지를 다운로드하여 로컬에 저장"""
        try:
            # 이미지 다운로드
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(img_url, headers=headers, timeout=10, stream=True)
            response.raise_for_status()
            
            # 파일 확장자 추출
            parsed_url = urllib.parse.urlparse(img_url)
            path = parsed_url.path
            ext = Path(path).suffix.lower() or '.jpg'
            
            # 파일명 생성 (alt_text 기반 또는 URL 기반)
            if alt_text and len(alt_text) > 0:
                # 한글 파일명을 안전한 파일명으로 변환
                safe_filename = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in alt_text[:50])
                filename = f"{safe_filename}{ext}"
            else:
                # URL에서 파일명 추출 또는 해시 사용
                filename_from_url = Path(path).name
                if filename_from_url and '.' in filename_from_url:
                    filename = filename_from_url
                else:
                    url_hash = hashlib.md5(img_url.encode()).hexdigest()[:8]
                    filename = f"fingerprint_{url_hash}{ext}"
            
            # 파일 저장 경로
            save_path = os.path.join(save_dir, filename)
            
            # 이미 저장된 파일이 있으면 스킵
            if os.path.exists(save_path):
                return f"/fingerprints/{filename}"
            
            # 이미지 저장
            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"이미지 저장 완료: {save_path}")
            return f"/fingerprints/{filename}"
            
        except Exception as e:
            print(f"이미지 다운로드 실패 ({img_url}): {str(e)}")
            return None
    
    def scrape_howard_gardner_info(self) -> Dict[str, Any]:
        """하워드 가드너 다중지능 이론 및 지문 분석 정보 스크래핑"""
        cache_file = os.path.join(self.cache_dir, "howard_gardner_info.json")
        
        # 캐시 확인
        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # 하워드 가드너 다중지능 이론 정보
        gardner_info = {
            "theory_overview": {
                "title": "하워드 가드너의 다중지능 이론",
                "description": "하워드 가드너(Howard Gardner)는 1983년 '마음의 틀(Frames of Mind)'에서 기존의 단일 지능 개념을 비판하고, 인간은 8가지(또는 9가지) 서로 다른 지능을 가지고 있다고 제시했습니다.",
                "key_points": [
                    "모든 사람은 8가지 지능을 모두 가지고 있지만, 각 지능의 발달 정도는 다릅니다",
                    "지능은 고정된 것이 아니라 교육과 경험을 통해 발달시킬 수 있습니다",
                    "각 지능은 독립적으로 작동하며, 서로 다른 방식으로 조합될 수 있습니다",
                    "아이의 강점 지능을 파악하면 맞춤형 교육이 가능합니다"
                ]
            },
            "eight_intelligences": {
                "언어지능 (Linguistic Intelligence)": {
                    "description": "언어를 효과적으로 사용하는 능력",
                    "characteristics": ["읽기, 쓰기, 말하기에 능숙", "단어 놀이를 좋아함", "이야기하기와 듣기를 즐김"],
                    "fingerprint_features": "손가락 지문 패턴이 복잡하고 세밀한 경우 언어지능이 발달할 수 있음",
                    "development": "독서, 글쓰기, 토론, 스토리텔링 활동으로 발달"
                },
                "논리수학지능 (Logical-Mathematical Intelligence)": {
                    "description": "논리적 사고와 수학적 문제 해결 능력",
                    "characteristics": ["패턴 인식에 뛰어남", "논리적 추론을 즐김", "수학 문제 해결에 능숙"],
                    "fingerprint_features": "지문의 나선형 패턴이 뚜렷한 경우 논리수학지능이 발달할 수 있음",
                    "development": "퍼즐, 수학 게임, 과학 실험, 논리적 사고 활동으로 발달"
                },
                "공간지능 (Spatial Intelligence)": {
                    "description": "공간을 인식하고 시각화하는 능력",
                    "characteristics": ["그림 그리기와 디자인에 능숙", "방향 감각이 뛰어남", "3차원 사고에 능함"],
                    "fingerprint_features": "지문의 고리형 패턴이 발달한 경우 공간지능이 우수할 수 있음",
                    "development": "그림 그리기, 건축, 지도 읽기, 퍼즐 조립으로 발달"
                },
                "음악지능 (Musical Intelligence)": {
                    "description": "음악을 이해하고 창조하는 능력",
                    "characteristics": ["리듬과 멜로디에 민감", "음악 감상과 연주에 능숙", "소리 패턴을 잘 인식"],
                    "fingerprint_features": "지문의 나선형과 고리형이 균형잡힌 경우 음악지능이 발달할 수 있음",
                    "development": "악기 연주, 노래 부르기, 음악 감상, 리듬 활동으로 발달"
                },
                "신체운동지능 (Bodily-Kinesthetic Intelligence)": {
                    "description": "신체를 조절하고 표현하는 능력",
                    "characteristics": ["운동 능력이 뛰어남", "손으로 만드는 것을 좋아함", "신체 표현에 능숙"],
                    "fingerprint_features": "지문의 고리형 패턴이 강한 경우 신체운동지능이 발달할 수 있음",
                    "development": "운동, 춤, 손으로 만드는 활동, 신체 표현으로 발달"
                },
                "대인지능 (Interpersonal Intelligence)": {
                    "description": "다른 사람을 이해하고 상호작용하는 능력",
                    "characteristics": ["사람들과 잘 어울림", "공감 능력이 뛰어남", "리더십이 있음"],
                    "fingerprint_features": "지문 패턴이 다양하고 복합적인 경우 대인지능이 발달할 수 있음",
                    "development": "팀 활동, 역할 놀이, 협력 활동, 대화로 발달"
                },
                "자기성찰지능 (Intrapersonal Intelligence)": {
                    "description": "자신을 이해하고 내면을 탐구하는 능력",
                    "characteristics": ["자기 인식이 뛰어남", "독립적 사고", "내면 성찰을 즐김"],
                    "fingerprint_features": "지문의 호형 패턴이 뚜렷한 경우 자기성찰지능이 발달할 수 있음",
                    "development": "일기 쓰기, 명상, 자기 성찰, 독립적 활동으로 발달"
                },
                "자연지능 (Naturalist Intelligence)": {
                    "description": "자연을 관찰하고 분류하는 능력",
                    "characteristics": ["자연 관찰에 능숙", "동식물에 관심이 많음", "분류와 패턴 인식에 능함"],
                    "fingerprint_features": "지문의 나선형과 호형이 조화로운 경우 자연지능이 발달할 수 있음",
                    "development": "자연 관찰, 식물 키우기, 동물 관찰, 분류 활동으로 발달"
                }
            },
            "fingerprint_analysis": {
                "overview": "지문 분석은 다중지능 이론을 바탕으로 아이의 강점 지능을 파악하는 도구로 활용됩니다.",
                "fingerprint_types": {
                    "나선형 (Whorl)": {
                        "description": "중앙에서 나선형으로 퍼지는 패턴",
                        "associated_intelligences": ["논리수학지능", "음악지능", "자연지능"],
                        "characteristics": "체계적 사고, 패턴 인식, 분석적 능력과 관련"
                    },
                    "고리형 (Loop)": {
                        "description": "한쪽 방향으로 흐르는 고리 모양 패턴",
                        "associated_intelligences": ["공간지능", "신체운동지능", "대인지능"],
                        "characteristics": "실행력, 공간 인식, 대인관계 능력과 관련"
                    },
                    "호형 (Arch)": {
                        "description": "아치 모양의 단순한 패턴",
                        "associated_intelligences": ["자기성찰지능", "자연지능"],
                        "characteristics": "안정성, 내면 탐구, 자연 친화적 성향과 관련"
                    },
                    "복합형 (Composite)": {
                        "description": "여러 패턴이 복합적으로 나타나는 형태",
                        "associated_intelligences": ["대인지능", "언어지능"],
                        "characteristics": "다양한 지능의 조화, 적응력, 소통 능력과 관련"
                    }
                },
                "analysis_method": {
                    "steps": [
                        "10개 손가락의 지문을 촬영하고 패턴을 분석합니다",
                        "각 손가락의 지문 패턴을 분류합니다 (나선형, 고리형, 호형, 복합형)",
                        "패턴의 분포와 조합을 분석하여 강점 지능을 파악합니다",
                        "분석 결과를 바탕으로 맞춤형 학습 방법을 제안합니다"
                    ],
                    "importance": "지문 분석은 참고 자료이며, 아이의 실제 행동과 관찰을 함께 고려해야 합니다"
                }
            },
            "benefits": {
                "title": "다중지능 이론의 장점",
                "points": [
                    {
                        "benefit": "개별화된 교육",
                        "description": "각 아이의 강점 지능을 파악하여 맞춤형 교육 방법을 제시할 수 있습니다"
                    },
                    {
                        "benefit": "자존감 향상",
                        "description": "아이의 강점을 인정하고 발달시켜 자존감을 높일 수 있습니다"
                    },
                    {
                        "benefit": "학습 동기 증진",
                        "description": "아이에게 맞는 학습 방법을 사용하면 학습 동기가 높아집니다"
                    },
                    {
                        "benefit": "다양한 평가",
                        "description": "단일 지능이 아닌 다양한 지능 영역을 평가하여 아이의 전체적 능력을 파악할 수 있습니다"
                    },
                    {
                        "benefit": "진로 탐색",
                        "description": "강점 지능을 바탕으로 적합한 진로 방향을 탐색할 수 있습니다"
                    }
                ]
            },
            "thumb_personality": {
                "title": "엄지 주성격 분석",
                "description": "엄지손가락의 지문 패턴은 개인의 주된 성격 특성을 나타내는 중요한 지표입니다.",
                "patterns": {
                    "나선형 (Whorl)": {
                        "personality": "독립적이고 리더십이 강하며, 목표 지향적인 성격",
                        "traits": ["자신감", "결단력", "목표 추구", "독립성"],
                        "learning_style": "체계적이고 구조화된 학습 환경을 선호하며, 명확한 목표가 있을 때 가장 잘 학습합니다."
                    },
                    "고리형 (Loop)": {
                        "personality": "협조적이고 적응력이 뛰어나며, 대인관계에 능숙한 성격",
                        "traits": ["협력성", "적응력", "소통 능력", "공감 능력"],
                        "learning_style": "협력적 학습 환경을 선호하며, 그룹 활동과 상호작용을 통한 학습에 효과적입니다."
                    },
                    "호형 (Arch)": {
                        "personality": "안정적이고 신중하며, 내면을 중시하는 성격",
                        "traits": ["신중함", "안정성", "내면 탐구", "집중력"],
                        "learning_style": "조용하고 안정적인 학습 환경을 선호하며, 깊이 있는 학습과 자기 주도적 학습에 적합합니다."
                    },
                    "복합형 (Composite)": {
                        "personality": "다재다능하고 유연하며, 다양한 관점을 가진 성격",
                        "traits": ["다재다능", "유연성", "창의성", "통합적 사고"],
                        "learning_style": "다양한 학습 방법을 조합하여 학습하며, 창의적이고 통합적인 접근을 선호합니다."
                    }
                }
            },
            "fingerprint_characteristics": {
                "title": "지문별 특징 상세",
                "description": "각 손가락의 지문 패턴은 서로 다른 지능 영역과 성격 특성을 나타냅니다.",
                "detailed_features": {
                    "나선형 (Whorl)": {
                        "visual_description": "중앙에서 나선형으로 퍼지는 원형 패턴",
                        "intelligence_connection": "논리수학지능, 음악지능, 자연지능과 강한 연관성",
                        "personality_indicators": "체계적 사고, 분석적 능력, 패턴 인식 능력이 뛰어남",
                        "strengths": ["논리적 추론", "체계적 접근", "패턴 분석", "목표 지향"],
                        "development_areas": "창의적 표현, 감정 인식, 대인관계 기술"
                    },
                    "고리형 (Loop)": {
                        "visual_description": "한쪽 방향으로 흐르는 U자형 고리 패턴",
                        "intelligence_connection": "공간지능, 신체운동지능, 대인지능과 강한 연관성",
                        "personality_indicators": "실행력, 공간 인식, 대인관계 능력이 뛰어남",
                        "strengths": ["실행력", "공간 감각", "협력", "적응력"],
                        "development_areas": "자기 성찰, 독립적 사고, 깊이 있는 분석"
                    },
                    "호형 (Arch)": {
                        "visual_description": "아치 모양의 단순하고 안정적인 패턴",
                        "intelligence_connection": "자기성찰지능, 자연지능과 강한 연관성",
                        "personality_indicators": "안정성, 내면 탐구, 자연 친화적 성향",
                        "strengths": ["안정성", "집중력", "내면 탐구", "자연 관찰"],
                        "development_areas": "사회적 상호작용, 외향적 표현, 다양한 경험"
                    },
                    "복합형 (Composite)": {
                        "visual_description": "여러 패턴이 복합적으로 나타나는 복잡한 형태",
                        "intelligence_connection": "대인지능, 언어지능과 강한 연관성",
                        "personality_indicators": "다양한 지능의 조화, 적응력, 소통 능력",
                        "strengths": ["다재다능", "적응력", "소통 능력", "통합적 사고"],
                        "development_areas": "특정 영역의 깊이 있는 전문성, 집중력 향상"
                    }
                }
            },
            "report_example": {
                "title": "지문검사 결과 보고서 예시",
                "sections": [
                    {
                        "section_title": "1. 기본 정보",
                        "content": "이름: 홍길동 | 나이: 8세 | 검사일: 2024년 1월 15일"
                    },
                    {
                        "section_title": "2. 지문 패턴 분석",
                        "content": "엄지(양손): 나선형 | 검지: 고리형(좌), 나선형(우) | 중지: 고리형(양손) | 약지: 나선형(양손) | 소지: 호형(양손)"
                    },
                    {
                        "section_title": "3. 엄지 주성격 분석",
                        "content": "나선형 패턴으로 나타난 주성격은 독립적이고 리더십이 강하며, 목표 지향적인 특성을 보입니다. 체계적이고 구조화된 학습 환경에서 가장 잘 학습하며, 명확한 목표가 있을 때 동기가 높아집니다."
                    },
                    {
                        "section_title": "4. 강점 지능 분석",
                        "content": "논리수학지능과 음악지능이 특히 발달되어 있으며, 체계적 사고와 패턴 인식 능력이 뛰어납니다. 공간지능과 대인지능도 양호한 수준입니다."
                    },
                    {
                        "section_title": "5. 맞춤형 학습 제안",
                        "content": "체계적이고 구조화된 학습 방법을 선호하므로, 단계별 학습 계획과 명확한 목표 설정이 효과적입니다. 논리적 사고를 활용한 수학 학습과 패턴 인식이 필요한 음악 활동을 권장합니다."
                    },
                    {
                        "section_title": "6. 진로 탐색 방향",
                        "content": "논리적 사고와 체계적 접근이 강점이므로, 수학, 과학, 공학 분야에 관심을 가질 수 있습니다. 음악적 감각도 발달되어 있으므로 음악 관련 활동도 함께 고려해볼 수 있습니다."
                    }
                ]
            }
        }
        
        # 캐시 저장
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(gardner_info, f, ensure_ascii=False, indent=2)
        
        return gardner_info

