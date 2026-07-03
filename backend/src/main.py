# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from . import models, schemas # schemas는 아래에서 설명할 예정입니다

# 1. DB 테이블 자동 생성
Base.metadata.create_all(bind=engine)

app = FastAPI()

# DB 세션 의존성 주입 (이 함수를 통해 API마다 DB 통로를 관리합니다)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 2. 단어 추가 API (POST)
@app.post("/words/")
def create_word(word_text: str, meaning: str, db: Session = Depends(get_db)):
    # models.Word 클래스를 사용하여 새로운 데이터 객체 생성
    new_word = models.Word(text=word_text, meaning=meaning)
    
    db.add(new_word)
    db.commit()
    db.refresh(new_word) # 저장된 데이터를 객체에 다시 로드
    
    return {"status": "success", "word": new_word}

# 3. 모든 단어 조회 API (GET)
@app.get("/words/")
def read_words(db: Session = Depends(get_db)):
    words = db.query(models.Word).all()
    return words