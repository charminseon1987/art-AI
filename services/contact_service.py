"""문의 관리 서비스"""
import json
import os
import uuid
from datetime import datetime
from typing import Optional, List
from models.contact import ContactInquiry


class ContactService:
    """문의 저장, 조회, 수정 서비스"""
    
    def __init__(self, storage_dir: str = "data/contacts"):
        self.storage_dir = storage_dir
        os.makedirs(storage_dir, exist_ok=True)
    
    def save_contact(self, contact_data: ContactInquiry) -> str:
        """문의 저장"""
        # ID가 없으면 생성
        if not contact_data.id:
            contact_data.id = str(uuid.uuid4())
        
        file_path = os.path.join(self.storage_dir, f"{contact_data.id}.json")
        
        # ContactInquiry를 dict로 변환
        contact_dict = contact_data.model_dump()
        contact_dict['created_at'] = contact_data.created_at.isoformat()
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(contact_dict, f, ensure_ascii=False, indent=2)
        
        return file_path
    
    def load_contact(self, contact_id: str) -> Optional[ContactInquiry]:
        """문의 로드"""
        file_path = os.path.join(self.storage_dir, f"{contact_id}.json")
        
        if not os.path.exists(file_path):
            return None
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # datetime 문자열을 datetime 객체로 변환
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        
        return ContactInquiry(**data)
    
    def update_contact_status(self, contact_id: str, status: str) -> Optional[ContactInquiry]:
        """문의 상태 업데이트"""
        contact = self.load_contact(contact_id)
        if not contact:
            return None
        
        contact.status = status
        self.save_contact(contact)
        
        return contact
    
    def list_contacts(self) -> List[ContactInquiry]:
        """문의 목록 조회"""
        contacts = []
        
        if not os.path.exists(self.storage_dir):
            return contacts
        
        for filename in os.listdir(self.storage_dir):
            if filename.endswith('.json'):
                contact_id = filename[:-5]  # .json 제거
                contact = self.load_contact(contact_id)
                if contact:
                    contacts.append(contact)
        
        # 생성일 기준 내림차순 정렬
        contacts.sort(key=lambda x: x.created_at, reverse=True)
        return contacts
