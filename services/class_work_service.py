"""수업 작품 관리 서비스"""
import json
import os
from typing import Optional, List
from datetime import datetime
from models.class_work import ClassWork


class ClassWorkService:
    """수업 작품 저장, 조회 서비스"""
    
    def __init__(self, storage_dir: str = "data/class_works"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
    
    def save_class_work(self, class_work: ClassWork) -> str:
        """수업 작품 저장"""
        file_path = os.path.join(self.storage_dir, f"{class_work.id}.json")
        
        # ClassWork를 dict로 변환
        work_dict = class_work.model_dump()
        work_dict['created_at'] = class_work.created_at.isoformat()
        work_dict['updated_at'] = class_work.updated_at.isoformat()
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(work_dict, f, ensure_ascii=False, indent=2)
        
        return file_path
    
    def load_class_work(self, work_id: str) -> Optional[ClassWork]:
        """수업 작품 로드"""
        file_path = os.path.join(self.storage_dir, f"{work_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        data['updated_at'] = datetime.fromisoformat(data['updated_at'])
        
        return ClassWork(**data)
    
    def list_class_works(self) -> List[ClassWork]:
        """모든 수업 작품 목록 조회"""
        works = []
        
        if not os.path.exists(self.storage_dir):
            return works
        
        for filename in os.listdir(self.storage_dir):
            if filename.endswith('.json'):
                work_id = filename[:-5]  # .json 제거
                work = self.load_class_work(work_id)
                if work:
                    works.append(work)
        
        # 생성일 기준 내림차순 정렬
        works.sort(key=lambda x: x.created_at, reverse=True)
        
        return works
    
    def delete_class_work(self, work_id: str) -> bool:
        """수업 작품 삭제"""
        file_path = os.path.join(self.storage_dir, f"{work_id}.json")
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        
        return False

