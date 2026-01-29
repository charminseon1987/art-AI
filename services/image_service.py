"""이미지 처리 서비스"""
import base64
from io import BytesIO
from PIL import Image
from typing import Dict, Any, Optional
import os
from openai import OpenAI


class ImageService:
    """이미지 업로드, 처리, 메타데이터 추출 서비스"""
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.max_size = (2048, 2048)  # 최대 이미지 크기
        self.allowed_formats = ['JPEG', 'PNG', 'JPG']
        self.openai_client = OpenAI(api_key=openai_api_key) if openai_api_key else None
    
    def process_uploaded_image(self, uploaded_file) -> Dict[str, Any]:
        """업로드된 이미지 처리 및 메타데이터 추출"""
        try:
            # 이미지 열기
            image = Image.open(uploaded_file)
            
            # 이미지 크기 조정 (너무 큰 경우)
            image.thumbnail(self.max_size, Image.Resampling.LANCZOS)
            
            # 메타데이터 추출
            metadata = {
                "format": image.format,
                "size": image.size,
                "mode": image.mode,
                "width": image.width,
                "height": image.height,
            }
            
            # 이미지를 base64로 인코딩 (AI 분석용)
            buffered = BytesIO()
            image.save(buffered, format=image.format or "PNG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            # 이미지 설명 생성 (Vision API 사용)
            description = self._generate_image_description(image, img_base64)
            
            return {
                "success": True,
                "metadata": metadata,
                "base64": img_base64,
                "description": description,
                "image": image  # PIL Image 객체
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _generate_image_description(self, image: Image.Image, base64_image: Optional[str] = None) -> str:
        """이미지에 대한 상세한 텍스트 설명 생성 (Vision API 사용)"""
        width, height = image.size
        mode = image.mode
        
        # 기본 메타데이터
        basic_info = f"""
        이미지 기본 정보:
        - 크기: {width}x{height} 픽셀
        - 색상 모드: {mode}
        - 형식: {image.format}
        """
        
        # Vision API를 사용한 상세 분석
        if self.openai_client and base64_image:
            try:
                vision_description = self._analyze_with_vision_api(base64_image)
                return f"""{basic_info}

        Vision API 분석 결과:
        {vision_description}
        """
            except Exception as e:
                # Vision API 실패 시 기본 분석
                return self._generate_basic_description(image, basic_info)
        else:
            # Vision API 없이 기본 분석
            return self._generate_basic_description(image, basic_info)
    
    def _analyze_with_vision_api(self, base64_image: str) -> str:
        """OpenAI Vision API를 사용하여 이미지 분석"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """이 그림을 객관적으로 상세히 분석해주세요. 다음 항목들을 포함해주세요:
1. 그림에 나타난 주요 객체, 형태, 패턴
2. 색상의 분포와 위치 (어떤 색상이 어디에 있는지)
3. 선의 특성 (두께, 방향, 곡선/직선)
4. 구성과 배치 (중심, 대칭성, 공간 활용)
5. 세부사항과 질감
6. 전체적인 시각적 특징

중요: 해석이나 진단은 하지 말고, 오직 보이는 것만을 객관적으로 기술해주세요."""
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
                max_tokens=1000
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"Vision API 분석 중 오류 발생: {str(e)}"
    
    def _generate_basic_description(self, image: Image.Image, basic_info: str) -> str:
        """기본적인 이미지 분석 (Vision API 없이)"""
        description = basic_info
        
        # 색상 분석
        try:
            colors = image.getcolors(maxcolors=256)
            if colors:
                dominant_colors = sorted(colors, key=lambda x: x[0], reverse=True)[:10]
                description += f"\n- 주요 색상: {len(dominant_colors)}개의 주요 색상 감지"
                
                # RGB 값을 색상명으로 변환 (간단한 버전)
                color_names = []
                for count, rgb in dominant_colors[:5]:
                    if isinstance(rgb, tuple):
                        r, g, b = rgb[:3]
                        color_name = self._rgb_to_color_name(r, g, b)
                        percentage = (count / (image.width * image.height)) * 100
                        color_names.append(f"{color_name} (약 {percentage:.1f}%)")
                
                if color_names:
                    description += f"\n  - 상위 색상: {', '.join(color_names)}"
        except:
            pass
        
        return description
    
    def _rgb_to_color_name(self, r: int, g: int, b: int) -> str:
        """RGB 값을 색상명으로 변환 (간단한 버전)"""
        # 간단한 색상 분류
        if r > 200 and g > 200 and b > 200:
            return "흰색"
        elif r < 50 and g < 50 and b < 50:
            return "검은색"
        elif abs(r - g) < 30 and abs(g - b) < 30:
            return "회색"
        elif r > g and r > b:
            if r > 200:
                return "빨간색"
            else:
                return "어두운 빨간색"
        elif g > r and g > b:
            if g > 200:
                return "초록색"
            else:
                return "어두운 초록색"
        elif b > r and b > g:
            if b > 200:
                return "파란색"
            else:
                return "어두운 파란색"
        elif r > 200 and g > 150:
            return "노란색"
        elif r > 200 and g > 100 and b < 100:
            return "주황색"
        else:
            return f"RGB({r},{g},{b})"
    
    def save_image_metadata_only(self, metadata: Dict[str, Any], report_id: str) -> str:
        """이미지 자체는 저장하지 않고 메타데이터만 저장"""
        # 실제 구현에서는 데이터베이스에 저장
        # 여기서는 파일 시스템에 메타데이터만 저장하는 예시
        metadata_file = f"data/metadata/{report_id}_metadata.json"
        os.makedirs(os.path.dirname(metadata_file), exist_ok=True)
        
        import json
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        return metadata_file

