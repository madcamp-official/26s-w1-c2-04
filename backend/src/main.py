# backend/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import engine, SessionLocal, Base
from . import models, schemas # schemas는 아래에서 설명할 예정입니다
from passlib.context import CryptContext

# 이 코드가 데이터베이스에 테이블을 생성해줍니다.
Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#단어장 추가
@app.post("/vocabs/", response_model=schemas.Vocabulary) 
def create_vocab(vocab: schemas.VocabCreate, db: Session = Depends(get_db)):
    # main.py에서 수정할 부분
    db_vocab = models.Vocabulary(title=vocab.title)
    db.add(db_vocab)
    db.commit()
    db.refresh(db_vocab)
    return db_vocab

# 모든 단어장 조회
@app.get("/vocabs/")
def read_vocab(db: Session = Depends(get_db)):
    vocabs = db.query(models.Vocabulary).all()
    return vocabs

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#단어장 삭제
@app.delete("/vocabs/{vocabulary_id}")
def delete_vocab(vocabulary_id: int, db: Session = Depends(get_db)):
    vocabulary = db.query(models.Vocabulary).filter(models.Vocabulary.id == vocabulary_id).first()
    
    if not vocabulary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="삭제할 단어장을 찾을 수 없습니다."
        )
    
    # 2. 삭제 수행
    db.delete(vocabulary)
    db.commit()
    
    return {"message": "Vocabulary successfully deleted"}

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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#단어 삭제
@app.delete("/words/{word_id}")
def delete_word(word_id: int, db: Session = Depends(get_db)):
    word = db.query(models.Word).filter(models.Word.id == word_id).first()
    
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="삭제할 단어를 찾을 수 없습니다."
        )
    
    # 2. 삭제 수행
    db.delete(word)
    db.commit()
    
    return {"message": "Word successfully deleted"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. 비밀번호 해싱
    hashed_pw = pwd_context.hash(user.password)
    
    # 2. 모델 객체 생성
    db_user = models.User(username=user.username, hashed_password=hashed_pw)
    
    # 3. DB 저장
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/login/")
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. 아이디로 사용자 조회
    user = db.query(models.User).filter(models.User.username == user_login.username).first()
    
    # 2. 아이디가 존재하지 않는 경우
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="아이디가 존재하지 않습니다. 회원가입을 해주세요."
        )
    
    # 3. 비밀번호가 일치하지 않는 경우
    if not pwd_context.verify(user_login.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 혹은 비밀번호가 일치하지 않습니다."
        )
    
    # 4. 로그인 성공
    return {"message": "로그인 성공!"}

