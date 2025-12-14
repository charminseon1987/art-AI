"""지문 분석 서비스"""
from crewai import Crew, Process
from langchain_openai import ChatOpenAI
from agents.fingerprint_analysis_agent import FingerprintAnalysisAgent
from services.image_service import ImageService
from typing import Dict, Any, Optional
import uuid


class FingerprintService:
    """엄지 지문 분석 서비스"""
    
    def __init__(self, llm: ChatOpenAI, image_service: ImageService):
        self.llm = llm
        self.image_service = image_service
        self.fingerprint_agent = FingerprintAnalysisAgent(llm)
    
    def analyze_thumb_fingerprint(self, image_file) -> Dict[str, Any]:
        """엄지 지문 이미지를 분석하고 주성향을 파악"""
        try:
            print("1. 이미지 처리 시작...")
            # 이미지 처리
            image_result = self.image_service.process_uploaded_image(image_file)
            
            if not image_result.get("success"):
                error_msg = image_result.get("error", "이미지 처리 실패")
                print(f"이미지 처리 실패: {error_msg}")
                return {
                    "success": False,
                    "error": f"이미지 처리 실패: {error_msg}"
                }
            
            print("2. 이미지 처리 완료, Vision API 호출 시작...")
            # Vision API를 사용하여 지문 패턴 분석을 위한 상세 설명 생성
            image_description = self._generate_fingerprint_description(
                image_result.get("base64", ""),
                image_result.get("description", "")
            )
            
            if not image_description or len(image_description.strip()) < 50:
                print("경고: 이미지 설명이 너무 짧습니다.")
            
            print("3. CrewAI 분석 시작...")
            # 지문 분석 작업 생성 및 실행
            analysis_task = self.fingerprint_agent.create_analysis_task(image_description)
            analysis_crew = Crew(
                agents=[self.fingerprint_agent.agent],
                tasks=[analysis_task],
                process=Process.sequential,
                verbose=True
            )
            
            print("4. CrewAI kickoff 실행 중...")
            analysis_result = analysis_crew.kickoff()
            print(f"5. CrewAI 분석 완료: {str(analysis_result)[:200]}...")
            
            # 분석 결과 파싱
            print("6. 분석 결과 파싱 시작...")
            parsed_result = self.fingerprint_agent.parse_analysis_result(str(analysis_result))
            
            if not parsed_result.get("pattern_type"):
                print("경고: 패턴 유형이 파싱되지 않았습니다.")
                parsed_result["pattern_type"] = "복합형"
            
            # 결과에 이미지 메타데이터 추가
            parsed_result["image_metadata"] = image_result.get("metadata", {})
            parsed_result["image_base64"] = image_result.get("base64", "")
            parsed_result["analysis_id"] = str(uuid.uuid4())
            
            print(f"7. 분석 완료: 패턴={parsed_result.get('pattern_type')}")
            
            return {
                "success": True,
                "analysis": parsed_result
            }
            
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"지문 분석 오류 상세:\n{error_trace}")
            return {
                "success": False,
                "error": f"지문 분석 중 오류 발생: {str(e)}"
            }
    
    def _generate_fingerprint_description(self, base64_image: str, basic_description: str) -> str:
        """지문 분석을 위한 상세한 이미지 설명 생성"""
        if not self.image_service.openai_client or not base64_image:
            return basic_description
        
        try:
            response = self.image_service.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """이것은 엄지 손가락의 지문 사진입니다. 지문 패턴을 정확히 분석해주세요.

다음 항목들을 상세히 분석해주세요:
1. 지문의 중심 구조 (나선형, 고리형, 호형, 또는 복합형)
2. 델타(삼각형) 구조의 개수와 위치
3. 지문 선의 흐름 방향과 패턴
4. 중심에서 바깥쪽으로의 패턴 변화
5. 전체적인 지문 패턴의 특징

중요: 지문 패턴을 정확히 식별하는 것이 목표입니다. 객관적이고 상세한 설명을 제공해주세요."""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1500
            )
            
            vision_description = response.choices[0].message.content
            return f"""{basic_description}

Vision API 지문 분석:
{vision_description}
"""
        except Exception as e:
            print(f"Vision API 호출 오류: {str(e)}")
            return basic_description
