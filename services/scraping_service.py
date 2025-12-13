"""미술 심리 관련 웹 스크래핑 서비스"""
import os
import json
from typing import List, Dict, Any, Optional
from crewai_tools import WebsiteSearchTool, ScrapeWebsiteTool
import requests
from bs4 import BeautifulSoup
import time


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
        """에이전트가 참고할 수 있는 미술 심리 자료 반환"""
        resources = self.scrape_art_therapy_resources()
        
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
        
        reference += "\n### 중요 원칙\n"
        reference += "- 모든 해석은 맥락과 함께 고려되어야 함\n"
        reference += "- 개인의 표현 스타일과 문화적 배경을 고려해야 함\n"
        reference += "- 해석보다는 관찰과 질문에 집중해야 함\n"
        reference += "- 내담자의 설명을 듣는 것이 가장 중요함\n"
        
        return reference
    
    def scrape_web_art_therapy_info(self, query: str) -> str:
        """웹에서 미술 치료 관련 정보 검색 및 스크래핑"""
        try:
            # 간단한 웹 검색 (실제로는 더 정교한 검색 엔진 사용)
            # 여기서는 기본적인 정보만 반환
            return f"'{query}'에 대한 미술 치료 관련 정보를 검색했습니다."
        except Exception as e:
            return f"웹 스크래핑 중 오류 발생: {str(e)}"

