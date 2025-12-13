"""이미지 관찰 에이전트 - 핵심 Agent A"""
from crewai import Agent, Task
from typing import Dict, Any
from langchain_openai import ChatOpenAI
from models.report import ImageObservation


class ImageObservationAgent:
    """그림을 관찰하고 구조화된 정보를 추출하는 에이전트"""
    
    def __init__(self, llm: ChatOpenAI):
        self.agent = Agent(
            role="이미지 관찰 전문가",
            goal="그림을 해석하지 않고 객관적으로 관찰하고 구조화된 정보를 추출한다",
            backstory="""당신은 미술 치료 전문가이자 관찰 전문가입니다. 
            그림을 해석하거나 진단하지 않고, 눈에 보이는 것만을 정확히 관찰하고 기록합니다.
            색상, 형태, 구성, 세부사항 등을 체계적으로 구조화합니다.""",
            verbose=True,
            llm=llm,
            allow_delegation=False
        )
    
    def create_observation_task(self, image_description: str) -> Task:
        """관찰 작업 생성"""
        return Task(
            description=f"""
            다음 그림에 대한 상세한 설명을 바탕으로 이 그림만의 고유한 특징을 정확히 관찰하세요:
            
            {image_description}
            
            **중요**: 이 그림의 고유한 특징을 정확히 파악하세요. 다른 그림과 비슷하게 분석하지 말고, 
            이 그림에서 실제로 보이는 구체적인 내용만을 기록하세요.
            
            다음 항목들을 이 그림에 특화되어 구조화하여 제공하세요:
            1. 주요 색상 (정확한 색상명, 위치, 대략적인 비율, 색상의 분포)
            2. 주요 형태 (구체적인 형태의 종류, 크기, 위치, 형태 간의 관계)
            3. 구성/배치 (중심의 정확한 위치, 대칭성 여부, 공간 배치의 구체적 특성, 균형감)
            4. 선의 특성 (선의 두께, 방향, 곡선/직선, 선의 강도, 선의 패턴)
            5. 질감과 세부사항 (표면 질감의 구체적 특성, 세밀한 부분의 위치와 특징, 반복 패턴)
            6. 전체적인 시각적 인상 (이 그림만의 고유한 시각적 특징, 객관적 사실만)
            
            **핵심 원칙**:
            - 이 그림의 고유한 특징을 강조하세요
            - 일반화된 설명을 피하고 구체적인 관찰을 하세요
            - 해석이나 진단은 절대 하지 마세요
            - "보이는 것"만을 정확히 기록하세요
            - 다른 그림과 비교하지 말고 이 그림 자체에 집중하세요
            """,
            agent=self.agent,
            expected_output="""JSON 형식으로 구조화된 관찰 결과:
            {{
                "colors": ["색상1", "색상2", ...],
                "shapes": ["형태1", "형태2", ...],
                "composition": "구성에 대한 객관적 설명",
                "details": ["세부사항1", "세부사항2", ...],
                "overall_impression": "전체적인 시각적 인상"
            }}"""
        )
    
    def parse_observation(self, result: str) -> ImageObservation:
        """관찰 결과를 파싱하여 ImageObservation 객체로 변환"""
        import json
        import re
        
        result_str = str(result)
        
        # JSON 블록 추출 시도
        # 중첩된 중괄호를 처리하기 위해 스택 기반 추출
        json_start = result_str.find('{')
        if json_start != -1:
            brace_count = 0
            json_end = json_start
            for i in range(json_start, len(result_str)):
                if result_str[i] == '{':
                    brace_count += 1
                elif result_str[i] == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        json_end = i + 1
                        break
            
            if json_end > json_start:
                json_str = result_str[json_start:json_end]
                try:
                    data = json.loads(json_str)
                    
                    # 딕셔너리 리스트를 문자열 리스트로 변환
                    if 'colors' in data and isinstance(data['colors'], list):
                        data['colors'] = [self._dict_to_string(item, 'color') if isinstance(item, dict) else str(item) for item in data['colors']]
                    
                    if 'shapes' in data and isinstance(data['shapes'], list):
                        data['shapes'] = [self._dict_to_string(item, 'shape') if isinstance(item, dict) else str(item) for item in data['shapes']]
                    
                    if 'details' in data and isinstance(data['details'], list):
                        data['details'] = [self._dict_to_string(item, 'detail') if isinstance(item, dict) else str(item) for item in data['details']]
                    
                    return ImageObservation(**data)
                except (json.JSONDecodeError, Exception):
                    # JSON 파싱 실패 시 계속 진행
                    pass
        
        # 정규식으로 재시도
        json_match = re.search(r'\{.*?"colors".*?\}', result_str, re.DOTALL)
        if json_match:
            try:
                json_str = json_match.group(0)
                data = json.loads(json_str)
                
                # 딕셔너리 리스트를 문자열 리스트로 변환
                if 'colors' in data and isinstance(data['colors'], list):
                    data['colors'] = [self._dict_to_string(item, 'color') if isinstance(item, dict) else str(item) for item in data['colors']]
                
                if 'shapes' in data and isinstance(data['shapes'], list):
                    data['shapes'] = [self._dict_to_string(item, 'shape') if isinstance(item, dict) else str(item) for item in data['shapes']]
                
                if 'details' in data and isinstance(data['details'], list):
                    data['details'] = [self._dict_to_string(item, 'detail') if isinstance(item, dict) else str(item) for item in data['details']]
                
                return ImageObservation(**data)
            except json.JSONDecodeError as e:
                # JSON 파싱 실패 시 계속 진행
                pass
            except Exception as e:
                # 기타 오류 시 계속 진행
                pass
        
        # JSON 파싱 실패 시 텍스트에서 정보 추출
        try:
            # 색상 추출
            colors = []
            color_matches = re.findall(r'"colors"\s*:\s*\[(.*?)\]', result_str, re.DOTALL)
            if color_matches:
                # 딕셔너리 형태인지 확인
                if '{' in color_matches[0]:
                    # 딕셔너리 리스트인 경우
                    color_dicts = re.findall(r'\{[^}]+\}', color_matches[0])
                    for color_dict_str in color_dicts:
                        try:
                            color_dict = json.loads(color_dict_str)
                            colors.append(self._dict_to_string(color_dict, 'color'))
                        except:
                            colors.append(color_dict_str)
                else:
                    # 문자열 리스트인 경우
                    color_list = re.findall(r'"([^"]+)"', color_matches[0])
                    colors = color_list
            
            # 형태 추출
            shapes = []
            shape_matches = re.findall(r'"shapes"\s*:\s*\[(.*?)\]', result_str, re.DOTALL)
            if shape_matches:
                # 딕셔너리 형태인지 확인
                if '{' in shape_matches[0]:
                    # 딕셔너리 리스트인 경우
                    shape_dicts = re.findall(r'\{[^}]+\}', shape_matches[0])
                    for shape_dict_str in shape_dicts:
                        try:
                            shape_dict = json.loads(shape_dict_str)
                            shapes.append(self._dict_to_string(shape_dict, 'shape'))
                        except:
                            shapes.append(shape_dict_str)
                else:
                    # 문자열 리스트인 경우
                    shape_list = re.findall(r'"([^"]+)"', shape_matches[0])
                    shapes = shape_list
            
            # 구성 추출
            composition = ""
            comp_match = re.search(r'"composition"\s*:\s*"([^"]+)"', result_str)
            if comp_match:
                composition = comp_match.group(1)
            else:
                # 텍스트에서 구성 관련 내용 찾기
                comp_text = re.search(r'구성[^"]*[:：]\s*([^"]+)', result_str)
                if comp_text:
                    composition = comp_text.group(1).strip()
            
            # 세부사항 추출
            details = []
            detail_matches = re.findall(r'"details"\s*:\s*\[(.*?)\]', result_str, re.DOTALL)
            if detail_matches:
                # 딕셔너리 형태인지 확인
                if '{' in detail_matches[0]:
                    # 딕셔너리 리스트인 경우
                    detail_dicts = re.findall(r'\{[^}]+\}', detail_matches[0])
                    for detail_dict_str in detail_dicts:
                        try:
                            detail_dict = json.loads(detail_dict_str)
                            details.append(self._dict_to_string(detail_dict, 'detail'))
                        except:
                            details.append(detail_dict_str)
                else:
                    # 문자열 리스트인 경우
                    detail_list = re.findall(r'"([^"]+)"', detail_matches[0])
                    details = detail_list
            
            # 전체 인상 추출
            overall_impression = ""
            impression_match = re.search(r'"overall_impression"\s*:\s*"([^"]+)"', result_str)
            if impression_match:
                overall_impression = impression_match.group(1)
            else:
                # 텍스트에서 전체 인상 찾기
                impression_text = re.search(r'전체[^"]*인상[^"]*[:：]\s*([^"]+)', result_str)
                if impression_text:
                    overall_impression = impression_text.group(1).strip()
            
            # Vision API 결과에서 직접 추출 시도
            if not colors and "색상" in result_str:
                # 색상 관련 문장 찾기
                color_sentences = re.findall(r'[^.]*색[^.]*\.', result_str)
                colors = [s.strip() for s in color_sentences[:5]]
            
            if not shapes and "형태" in result_str:
                shape_sentences = re.findall(r'[^.]*형태[^.]*\.', result_str)
                shapes = [s.strip() for s in shape_sentences[:5]]
            
            # 딕셔너리 리스트를 문자열로 변환
            colors_str = [self._dict_to_string(item, 'color') if isinstance(item, dict) else str(item) for item in colors]
            shapes_str = [self._dict_to_string(item, 'shape') if isinstance(item, dict) else str(item) for item in shapes]
            details_str = [self._dict_to_string(item, 'detail') if isinstance(item, dict) else str(item) for item in details]
            
            return ImageObservation(
                colors=colors_str if colors_str else [],
                shapes=shapes_str if shapes_str else [],
                composition=composition,
                details=details_str if details_str else [],
                overall_impression=overall_impression
            )
        except Exception as e:
            # 최종 실패 시 원본 텍스트를 세부사항에 포함
            return ImageObservation(
                colors=[],
                shapes=[],
                composition="",
                details=[result_str[:500] if len(result_str) > 500 else result_str],
                overall_impression="파싱 오류 발생"
            )
    
    def _dict_to_string(self, item: dict, item_type: str = 'item') -> str:
        """딕셔너리를 읽기 쉬운 문자열로 변환"""
        if not isinstance(item, dict):
            return str(item)
        
        parts = []
        
        # 타입별 주요 필드 추출
        if item_type == 'color':
            name = item.get('name', item.get('color', ''))
            location = item.get('location', '')
            ratio = item.get('approximate_ratio', item.get('ratio', ''))
            
            if name:
                parts.append(name)
            if location:
                parts.append(f"위치: {location}")
            if ratio:
                parts.append(f"비율: {ratio}")
        
        elif item_type == 'shape':
            shape_type = item.get('type', item.get('shape', ''))
            size = item.get('size', '')
            location = item.get('location', '')
            
            if shape_type:
                parts.append(shape_type)
            if size:
                parts.append(f"크기: {size}")
            if location:
                parts.append(f"위치: {location}")
        
        elif item_type == 'detail':
            # 세부사항은 다양한 필드가 있을 수 있음
            for key, value in item.items():
                if key not in ['location'] and value:
                    parts.append(f"{key}: {value}")
            if 'location' in item:
                parts.append(f"위치: {item['location']}")
        
        # 모든 필드를 포함하는 일반적인 경우
        if not parts:
            for key, value in item.items():
                if value:
                    parts.append(f"{key}: {value}")
        
        return ", ".join(parts) if parts else str(item)

