# backend/main.py
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from . import models, schemas # schemas는 아래에서 설명할 예정입니다
from .models import Word

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
@app.post("/words/", response_model=schemas.Word) # 응답 형태를 Schema로 지정
def create_word(word: schemas.WordCreate, db: Session = Depends(get_db)):
    # main.py에서 수정할 부분
    db_word = models.Word(term=word.term, meaning=word.meaning)
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word

# 3. 모든 단어 조회 API (GET)
@app.get("/words/")
def read_words(db: Session = Depends(get_db)):
    words = db.query(models.Word).all()
    return words