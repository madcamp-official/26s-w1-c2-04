# backend/schemas.py
from pydantic import BaseModel

# 데이터를 추가할 때 사용할 형식
class WordCreate(BaseModel):
    term: str
    meaning: str

# 데이터를 조회할 때 보여줄 형식
class Word(WordCreate):
    id: int

    class Config:
        from_attributes = True # ORM 객체를 Pydantic 모델로 변환 가능하게 함

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_atts = True
