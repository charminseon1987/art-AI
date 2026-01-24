"""지문 분석 에이전트 - 엄지 지문 패턴 관찰 시스템"""
from crewai import Agent, Task
from typing import Dict, Any
from langchain_openai import ChatOpenAI


class FingerprintAnalysisAgent:
    """엄지 손가락 지문 패턴을 관찰하고 일반적인 특성을 제시하는 교육용 에이전트"""

    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="지문 패턴 관찰 시스템",
            goal="엄지 손가락의 지문 패턴을 관찰하고 일반적인 성격 특성을 제시한다",
            backstory="""당신은 AI 기반 지문 패턴 관찰 시스템으로 하워드 가드너의 다중지능 이론을 참고하여
            지문 패턴을 관찰하고 교육적 참고 정보를 제공합니다. 엄지 손가락의 지문 패턴과 일반적인 특성 간의 연관성을 탐색하는 교육용 도구입니다.

            ⚠️ 본 시스템은 과학적 진단이나 전문적 성격 평가를 목적으로 하지 않으며, 교육적 참고 자료를 제공하는 분석 도구입니다.
            
            지문 패턴 분류:
            - 나선형 (Whorl): 독립적이고 리더십이 강하며, 목표 지향적인 성격
            - 고리형 (Loop): 협조적이고 적응력이 뛰어나며, 대인관계에 능숙한 성격
            - 호형 (Arch): 안정적이고 신중하며, 내면을 중시하는 성격
            - 복합형 (Composite): 다재다능하고 유연하며, 다양한 관점을 가진 성격
            - 두형문 (Double Whorl): 두 개의 나선형 패턴이 있는 형태, 균형감과 조화를 중시하는 성격
            - 호형문 (Arch Loop): 호형과 고리형이 결합된 형태, 안정적이면서도 적응력이 있는 성격
            - 쌍기문 (Double Core): 두 개의 중심점을 가진 패턴, 다면적 사고와 균형잡힌 성격
            - 반기문 (Half Whorl): 불완전한 나선형 패턴, 유연하고 개방적인 성격
            - 정기문 (Regular Whorl): 규칙적이고 대칭적인 나선형 패턴, 체계적이고 완벽주의적인 성격
            
            당신의 임무는 업로드된 엄지 지문 사진을 분석하여 정확한 패턴을 식별하고,
            해당 패턴에 맞는 성격 특성과 학습 스타일을 제시하는 것입니다.""",
            verbose=True,
            llm=llm,
            allow_delegation=False
        )
    
    def create_analysis_task(self, image_description: str) -> Task:
        """지문 분석 작업 생성"""
        return Task(
            description=f"""
            다음은 엄지 손가락 지문 사진에 대한 상세한 설명입니다:
            
            {image_description}
            
            **지문 패턴 분석 지침**:
            
            1. **나선형 (Whorl) 특징**:
               - 중심에서 나선형으로 퍼져나가는 패턴
               - 하나 이상의 델타(삼각형) 구조
               - 원형 또는 나선형 중심 구조
               - 독립적이고 리더십이 강하며, 목표 지향적
               - 특성: 자신감, 결단력, 목표 추구, 독립성
               - 학습 스타일: 체계적이고 구조화된 학습 환경 선호, 명확한 목표가 있을 때 가장 잘 학습
            
            2. **고리형 (Loop) 특징**:
               - 한쪽 방향으로 흐르는 루프 패턴
               - 하나의 델타 구조
               - U자형 또는 호형 루프
               - 협조적이고 적응력이 뛰어나며, 대인관계에 능숙
               - 특성: 협력성, 적응력, 소통 능력, 공감 능력
               - 학습 스타일: 협력적 학습 환경 선호, 그룹 활동과 상호작용을 통한 학습에 효과적
            
            3. **호형 (Arch) 특징**:
               - 산 모양의 호형 패턴
               - 델타 구조가 없거나 매우 약함
               - 단순하고 부드러운 곡선
               - 안정적이고 신중하며, 내면을 중시
               - 특성: 신중함, 안정성, 내면 탐구, 집중력
               - 학습 스타일: 조용하고 안정적인 학습 환경 선호, 깊이 있는 학습과 자기 주도적 학습에 적합
            
            4. **복합형 (Composite) 특징**:
               - 두 가지 이상의 패턴이 혼합된 형태
               - 복잡한 구조와 다양한 패턴 요소
               - 다재다능하고 유연하며, 다양한 관점을 가짐
               - 특성: 다재다능, 유연성, 창의성, 통합적 사고
               - 학습 스타일: 다양한 학습 방법을 조합하여 학습, 창의적이고 통합적인 접근 선호
            
            5. **두형문 (Double Whorl) 특징**:
               - 두 개의 독립적인 나선형 패턴이 있는 형태
               - 두 개의 중심점과 델타 구조
               - 균형감과 조화를 중시하며, 양면성을 가짐
               - 특성: 균형감, 조화 추구, 양면적 사고, 통합 능력
               - 학습 스타일: 다양한 관점을 통합하여 학습하며, 균형잡힌 접근을 선호
            
            6. **호형문 (Arch Loop) 특징**:
               - 호형과 고리형이 결합된 형태
               - 안정적인 호형 기반에 유동적인 루프 구조
               - 안정적이면서도 적응력이 있는 성격
               - 특성: 안정성, 적응력, 신중함, 유연성
               - 학습 스타일: 안정적인 기반 위에서 유연하게 학습하며, 점진적 발전을 선호
            
            7. **쌍기문 (Double Core) 특징**:
               - 두 개의 중심점(코어)을 가진 패턴
               - 대칭적이거나 비대칭적인 이중 구조
               - 다면적 사고와 균형잡힌 성격
               - 특성: 다면적 사고, 균형감, 통합 능력, 복합적 이해
               - 학습 스타일: 여러 관점을 동시에 고려하며, 통합적 이해를 추구
            
            8. **반기문 (Half Whorl) 특징**:
               - 불완전하거나 부분적인 나선형 패턴
               - 한쪽 방향으로 열려있는 구조
               - 유연하고 개방적인 성격
               - 특성: 유연성, 개방성, 적응력, 창의성
               - 학습 스타일: 자유롭고 유연한 학습 환경을 선호하며, 창의적 접근에 적합
            
            9. **정기문 (Regular Whorl) 특징**:
               - 규칙적이고 대칭적인 나선형 패턴
               - 완벽한 원형 또는 나선형 구조
               - 체계적이고 완벽주의적인 성격
               - 특성: 체계성, 완벽주의, 규칙 준수, 정확성
               - 학습 스타일: 체계적이고 구조화된 학습을 선호하며, 명확한 규칙과 순서가 있을 때 효과적
            
            **분석 요구사항**:
            1. 지문 이미지에서 패턴의 중심 구조를 정확히 식별하세요
            2. 델타(삼각형) 구조의 개수와 위치를 확인하세요
            3. 지문 선의 흐름 방향을 분석하세요
            4. 가장 일치하는 패턴 유형을 결정하세요
            5. 해당 패턴에 맞는 성격 특성과 학습 스타일을 제시하세요
            
            **중요**: 
            - 지문 패턴을 정확히 식별하는 것이 가장 중요합니다
            - 불확실한 경우 가장 유사한 패턴을 선택하되, 그 이유를 명시하세요
            - 분석 결과는 간략하지만 전문적인 보고서 형식으로 작성하세요
            """,
            agent=self.agent,
            expected_output="""다음 형식으로 구조화된 분석 결과를 제공하세요:

            {
                "pattern_type": "나선형|고리형|호형|복합형|두형문|호형문|쌍기문|반기문|정기문",
                "confidence": "높음|보통|낮음",
                "pattern_description": "지문 패턴의 구체적인 특징 설명",
                "personality_traits": ["특성1", "특성2", "특성3", "특성4"],
                "learning_style": "학습 스타일에 대한 상세한 설명",
                "analysis_summary": "전체적인 분석 요약"
            }
            """,
        )
    
    def parse_analysis_result(self, result: str) -> Dict[str, Any]:
        """분석 결과 파싱"""
        import json
        import re
        
        try:
            # JSON 형식으로 파싱 시도
            json_match = re.search(r'\{[\s\S]*\}', result)
            if json_match:
                json_str = json_match.group(0)
                parsed = json.loads(json_str)
                return parsed
        except:
            pass
        
        # JSON 파싱 실패 시 텍스트에서 정보 추출
        pattern_type = "복합형"  # 기본값
        if "정기문" in result or "Regular Whorl" in result:
            pattern_type = "정기문"
        elif "반기문" in result or "Half Whorl" in result:
            pattern_type = "반기문"
        elif "쌍기문" in result or "Double Core" in result:
            pattern_type = "쌍기문"
        elif "호형문" in result or "Arch Loop" in result:
            pattern_type = "호형문"
        elif "두형문" in result or "Double Whorl" in result:
            pattern_type = "두형문"
        elif "나선형" in result or "Whorl" in result:
            pattern_type = "나선형"
        elif "고리형" in result or "Loop" in result:
            pattern_type = "고리형"
        elif "호형" in result or "Arch" in result:
            pattern_type = "호형"
        
        # 패턴별 기본 정보
        pattern_info = {
            "나선형": {
                "personality": "독립적이고 리더십이 강하며, 목표 지향적인 성격",
                "traits": ["자신감", "결단력", "목표 추구", "독립성"],
                "learning_style": "체계적이고 구조화된 학습 환경을 선호하며, 명확한 목표가 있을 때 가장 잘 학습합니다."
            },
            "고리형": {
                "personality": "협조적이고 적응력이 뛰어나며, 대인관계에 능숙한 성격",
                "traits": ["협력성", "적응력", "소통 능력", "공감 능력"],
                "learning_style": "협력적 학습 환경을 선호하며, 그룹 활동과 상호작용을 통한 학습에 효과적입니다."
            },
            "호형": {
                "personality": "안정적이고 신중하며, 내면을 중시하는 성격",
                "traits": ["신중함", "안정성", "내면 탐구", "집중력"],
                "learning_style": "조용하고 안정적인 학습 환경을 선호하며, 깊이 있는 학습과 자기 주도적 학습에 적합합니다."
            },
            "복합형": {
                "personality": "다재다능하고 유연하며, 다양한 관점을 가진 성격",
                "traits": ["다재다능", "유연성", "창의성", "통합적 사고"],
                "learning_style": "다양한 학습 방법을 조합하여 학습하며, 창의적이고 통합적인 접근을 선호합니다."
            },
            "두형문": {
                "personality": "균형감과 조화를 중시하며, 양면성을 가진 성격",
                "traits": ["균형감", "조화 추구", "양면적 사고", "통합 능력"],
                "learning_style": "다양한 관점을 통합하여 학습하며, 균형잡힌 접근을 선호합니다."
            },
            "호형문": {
                "personality": "안정적이면서도 적응력이 있는 성격",
                "traits": ["안정성", "적응력", "신중함", "유연성"],
                "learning_style": "안정적인 기반 위에서 유연하게 학습하며, 점진적 발전을 선호합니다."
            },
            "쌍기문": {
                "personality": "다면적 사고와 균형잡힌 성격",
                "traits": ["다면적 사고", "균형감", "통합 능력", "복합적 이해"],
                "learning_style": "여러 관점을 동시에 고려하며, 통합적 이해를 추구합니다."
            },
            "반기문": {
                "personality": "유연하고 개방적인 성격",
                "traits": ["유연성", "개방성", "적응력", "창의성"],
                "learning_style": "자유롭고 유연한 학습 환경을 선호하며, 창의적 접근에 적합합니다."
            },
            "정기문": {
                "personality": "체계적이고 완벽주의적인 성격",
                "traits": ["체계성", "완벽주의", "규칙 준수", "정확성"],
                "learning_style": "체계적이고 구조화된 학습을 선호하며, 명확한 규칙과 순서가 있을 때 효과적입니다."
            }
        }
        
        info = pattern_info.get(pattern_type, pattern_info["복합형"])
        
        return {
            "pattern_type": pattern_type,
            "confidence": "보통",
            "pattern_description": result[:200] if len(result) > 200 else result,
            "personality_traits": info["traits"],
            "learning_style": info["learning_style"],
            "analysis_summary": f"{pattern_type} 패턴이 감지되었습니다. {info['personality']}"
        }
