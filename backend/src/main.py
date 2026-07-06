from fastapi import Depends, FastAPI, HTTPException, status
#Depends - DB연결을 자동으로 연동시켜줄 때 사용
#HTTP - 성공 및 실패 이유를 파악하기 위한 설명 제공
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, SessionLocal, engine


Base.metadata.create_all(bind=engine)
with engine.begin() as connection:
    columns = connection.execute(text("PRAGMA table_info(words)")).fetchall()
    column_names = {column[1] for column in columns}
    if "examples" not in column_names:
        connection.execute(
            text("ALTER TABLE words ADD COLUMN examples VARCHAR NOT NULL DEFAULT ''")
        )
#engine을 이용해서 생성된 모든 테이블을 DB에 저장

app = FastAPI()
#FastAPI app 생성, FastAPI를 실행시키기 위함.

#middleware: 요청받은 도메인을 확인하는 역할 (일반적으로 중간역할을 미들웨어라고 지칭)
#Front와의 연결을 위해 CORS허용
app.add_middleware(
    CORSMiddleware,
    #허용된 링크들
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True, #로그인 기능 허용
    allow_methods=["*"], #모든 기능 (CRUD) 허용
    allow_headers=["*"], #모든 헤더 허용
)

#암호화된 비밀번호 객체 생성, bcrypt라는 알고리즘 사용, 예전 방식으로 암호화된 비밀번호 폐기
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#DB 연결 함수
def get_db():
    db = SessionLocal() #SQlite연결
    try:
        yield db
    finally:
        db.close()

#API 데이터 요청이 정상적으로 왔는지 실행해보는 예시용 함수
@app.get("/api/data")
def read_root():
    return {"message": "Hello from FastAPI!"}


@app.post(
    "/users/",
    response_model=schemas.UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        username=user.username,
        hashed_password=pwd_context.hash(user.password), #비밀번호는 hashed 형태로 저장
    )
    db.add(db_user)

    try:
        db.commit() #진짜 저장
    except IntegrityError: #중복아이디라면 에러 발송
        db.rollback() #실패된 작업 취소
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 사용 중인 아이디입니다.",
        )

    db.refresh(db_user) #반영된 db다시 읽기
    return db_user #회원가입 여부 알려주기


@app.post("/login/", response_model=schemas.LoginResponse)
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = (
        db.query(models.User)
        .filter(models.User.username == user_login.username)
        .first()
    )

    if not user or not pwd_context.verify(
        user_login.password,
        user.hashed_password,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 일치하지 않습니다.",
        )

    return {
        "id": user.id,
        "username": user.username,
        "message": "로그인 성공!",
    }


@app.post("/logout/")
def logout():
    return {"message": "로그아웃 되었습니다."}


@app.get("/vocabs/", response_model=list[schemas.Vocabulary])
def read_vocabs(owner_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Vocabulary)
        .filter(models.Vocabulary.owner_id == owner_id) #해당 사용자의 단어장만 검색 및 조회
        .all()
    )


@app.post(
    "/vocabs/",
    response_model=schemas.Vocabulary,
    status_code=status.HTTP_201_CREATED,
)
def create_vocab(vocab: schemas.VocabCreate, db: Session = Depends(get_db)):
    owner = (
        db.query(models.User)
        .filter(models.User.id == vocab.owner_id)
        .first()
    )
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다.",
        )

    db_vocab = models.Vocabulary(
        title=vocab.title,
        owner_id=vocab.owner_id,
    )
    db.add(db_vocab)
    db.commit()
    db.refresh(db_vocab)
    return db_vocab


@app.delete("/vocabs/{vocabulary_id}")
def delete_vocab(vocabulary_id: int, db: Session = Depends(get_db)):
    vocabulary = (
        db.query(models.Vocabulary)
        .filter(models.Vocabulary.id == vocabulary_id)
        .first()
    )
    if not vocabulary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="삭제할 단어장을 찾을 수 없습니다.",
        )

    db.delete(vocabulary)
    db.commit()
    return {"message": "단어장이 삭제되었습니다."}


@app.get(
    "/vocabs/{vocabulary_id}/words/",
    response_model=list[schemas.Word],
)
def read_words(vocabulary_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Word)
        .filter(models.Word.vocab_id == vocabulary_id)
        .all()
    )


@app.post(
    "/vocabs/{vocabulary_id}/words/",
    response_model=schemas.Word,
    status_code=status.HTTP_201_CREATED,
)
def create_word(
    vocabulary_id: int,
    word: schemas.WordCreate,
    db: Session = Depends(get_db),
):
    vocabulary = (
        db.query(models.Vocabulary)
        .filter(models.Vocabulary.id == vocabulary_id)
        .first()
    )
    if not vocabulary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="단어장을 찾을 수 없습니다.",
        )

    db_word = models.Word(
        vocab_id=vocabulary_id,
        word=word.word,
        meaning=word.meaning,
        examples=word.examples,
    )
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word


@app.put("/words/{word_id}", response_model=schemas.Word)
def update_word(
    word_id: int,
    word_update: schemas.WordUpdate,
    db: Session = Depends(get_db),
):
    db_word = (
        db.query(models.Word)
        .filter(models.Word.id == word_id)
        .first()
    )
    if not db_word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="수정할 단어를 찾을 수 없습니다.",
        )

    db_word.word = word_update.word
    db_word.meaning = word_update.meaning
    db_word.examples = word_update.examples
    db.commit()
    db.refresh(db_word)
    return db_word


@app.delete("/words/{word_id}")
def delete_word(word_id: int, db: Session = Depends(get_db)):
    word = (
        db.query(models.Word)
        .filter(models.Word.id == word_id)
        .first()
    )
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="삭제할 단어를 찾을 수 없습니다.",
        )

    db.delete(word)
    db.commit()
    return {"message": "단어가 삭제되었습니다."}
