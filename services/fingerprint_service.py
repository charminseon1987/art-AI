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
            
            print("2. 지문 이미지 검증 시작...")
            # 지문 이미지 검증 (검증 실패해도 경고만 하고 계속 진행)
            validation_result = self._validate_fingerprint_image(
                image_result.get("base64", "")
            )
            
            if not validation_result.get("is_valid"):
                error_msg = validation_result.get("error", "지문 사진이 아닙니다.")
                print(f"지문 검증 실패 (경고): {error_msg}")
                # 검증 실패해도 분석을 계속 진행 (사용자 경험 개선)
                # 필요시 아래 주석을 해제하여 검증 실패 시 중단할 수 있음
                # return {
                #     "success": False,
                #     "error": error_msg
                # }
            
            print("3. 이미지 처리 완료, Vision API 호출 시작...")
            # Vision API를 사용하여 지문 패턴 분석을 위한 상세 설명 생성
            image_description = self._generate_fingerprint_description(
                image_result.get("base64", ""),
                image_result.get("description", "")
            )
            
            if not image_description or len(image_description.strip()) < 50:
                print("경고: 이미지 설명이 너무 짧습니다.")
            
            print("4. CrewAI 분석 시작...")
            # 지문 분석 작업 생성 및 실행
            analysis_task = self.fingerprint_agent.create_analysis_task(image_description)
            analysis_crew = Crew(
                agents=[self.fingerprint_agent.agent],
                tasks=[analysis_task],
                process=Process.sequential,
                verbose=True
            )
            
            print("5. CrewAI kickoff 실행 중...")
            analysis_result = analysis_crew.kickoff()
            print(f"6. CrewAI 분석 완료: {str(analysis_result)[:200]}...")
            
            # 분석 결과 파싱
            print("7. 분석 결과 파싱 시작...")
            parsed_result = self.fingerprint_agent.parse_analysis_result(str(analysis_result))
            
            if not parsed_result.get("pattern_type"):
                print("경고: 패턴 유형이 파싱되지 않았습니다.")
                parsed_result["pattern_type"] = "복합형"
            
            # 결과에 이미지 메타데이터 추가
            parsed_result["image_metadata"] = image_result.get("metadata", {})
            parsed_result["image_base64"] = image_result.get("base64", "")
            parsed_result["analysis_id"] = str(uuid.uuid4())
            
            print(f"8. 분석 완료: 패턴={parsed_result.get('pattern_type')}")
            
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
    
    def _validate_fingerprint_image(self, base64_image: str) -> Dict[str, Any]:
        """업로드된 이미지가 실제 지문 사진인지 검증"""
        if not self.image_service.openai_client or not base64_image:
            # OpenAI 클라이언트가 없으면 검증을 건너뛰고 통과 처리
            print("경고: OpenAI 클라이언트가 없어 지문 검증을 건너뜁니다.")
            return {"is_valid": True}
        
        try:
            print("지문 이미지 검증 중...")
            response = self.image_service.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """이 이미지가 엄지 손가락의 지문 사진인지 확인해주세요.

다음 기준으로 판단해주세요:
1. 지문 패턴(나선형, 고리형, 호형 등)이 명확히 보이는가?
2. 손가락 지문의 특징적인 선과 패턴이 있는가?
3. 손가락 끝부분의 지문인가?

응답 형식:
- 지문 사진이 맞다면: "예" 또는 "지문입니다" 또는 "지문 사진입니다"
- 지문 사진이 아니라면: "아니오" 또는 "지문이 아닙니다" 또는 "지문 사진이 아닙니다"

간단하게 "예" 또는 "아니오"로만 답변해주세요."""
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
                max_tokens=50
            )
            
            validation_response = response.choices[0].message.content.strip().lower()
            print(f"검증 응답: {validation_response}")
            
            # 지문인 경우를 판단하는 키워드 (우선순위 높음)
            positive_keywords = [
                "예", "네", "지문입니다", "지문 사진입니다", "지문이 맞습니다",
                "지문 사진이 맞습니다", "yes", "맞습니다", "맞다", "맞아요",
                "지문", "fingerprint", "지문 패턴", "나선형", "고리형", "호형"
            ]
            
            # 지문이 아닌 경우를 판단하는 키워드 (더 구체적으로)
            negative_keywords = [
                "지문이 아닙니다", "지문 사진이 아닙니다", "지문이 아니에요",
                "지문 사진이 아니에요", "not a fingerprint", "no fingerprint",
                "지문이 아니", "지문 사진이 아니"
            ]
            
            # 긍정 키워드 확인 (우선 처리)
            is_positive = any(keyword in validation_response for keyword in positive_keywords)
            
            # 부정 키워드 확인 (더 구체적인 키워드만)
            is_negative = any(keyword in validation_response for keyword in negative_keywords)
            
            # 긍정 키워드가 있으면 무조건 통과
            if is_positive:
                print("검증 통과: 긍정 키워드 발견")
                return {"is_valid": True}
            
            # 부정 키워드가 명확히 있고 긍정 키워드가 없을 때만 실패
            if is_negative and not is_positive:
                print("검증 실패: 부정 키워드 발견")
                return {
                    "is_valid": False,
                    "error": "지문사진이 아닙니다. 지문사진을 업로드해주세요."
                }
            
            # 애매한 경우 기본적으로 통과 (사용자 경험을 위해 관대하게 처리)
            print("경고: 검증 응답이 명확하지 않습니다. 기본적으로 통과 처리합니다.")
            return {"is_valid": True}
                
        except Exception as e:
            print(f"지문 검증 중 오류 발생: {str(e)}")
            # 검증 중 오류가 발생하면 기본적으로 통과 처리
            # (더 엄격한 검증을 원하면 False 반환 가능)
            return {"is_valid": True}
    
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
