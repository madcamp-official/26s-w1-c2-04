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

    vocab_columns = connection.execute(
        text("PRAGMA table_info(vocabularies)")
    ).fetchall()
    vocab_column_names = {column[1] for column in vocab_columns}
    if "description" not in vocab_column_names:
        connection.execute(
            text("ALTER TABLE vocabularies ADD COLUMN description VARCHAR NOT NULL DEFAULT ''")
        )
    if "tags" not in vocab_column_names:
        connection.execute(
            text("ALTER TABLE vocabularies ADD COLUMN tags VARCHAR NOT NULL DEFAULT ''")
        )
    if "is_public" not in vocab_column_names:
        connection.execute(
            text("ALTER TABLE vocabularies ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT 0")
        )
#engine을 이용해서 생성된 모든 테이블을 DB에 저장

app = FastAPI()
#FastAPI app 생성, FastAPI를 실행시키기 위함.

#middleware: 요청받은 도메인을 확인하는 역할 (일반적으로 중간역할을 미들웨어라고 지칭)
#Front와의 연결을 위해 CORS허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.madcamp-kaist\.org",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.put("/users/{userId}/password/")
def change_password(userId:int,
                    password_update: schemas.PasswordUpdate,
                    db: Session = Depends(get_db)):
    user = (db.query(models.User).filter(models.User.id == userId).first())

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    
    user.hashed_password = pwd_context.hash(password_update.new_password)
    db.commit()

    return {"message": "비밀번호가 변경되었습니다."}

@app.delete("/users/{userId}/")
def delete_user(userId:int, 
                db: Session = Depends(get_db)):
    user = (db.query(models.User).filter(models.User.id == userId).first())
    
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    
    db.delete(user)
    db.commit()
    return {"message": "회원 탈퇴가 완료되었습니다."}
    

@app.get("/vocabs/", response_model=list[schemas.Vocabulary])
def read_vocabs(owner_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.Vocabulary)
        .filter(models.Vocabulary.owner_id == owner_id) #해당 사용자의 단어장만 검색 및 조회
        .all()
    )


@app.get("/shared-vocabs/", response_model=list[schemas.Vocabulary])
def read_shared_vocabs(owner_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(models.Vocabulary).filter(models.Vocabulary.is_public == True)
    if owner_id is not None:
        query = query.filter(models.Vocabulary.owner_id != owner_id)
    return query.all()


@app.post(
    "/vocabs/",
    response_model=schemas.Vocabulary,
    status_code=status.HTTP_201_CREATED,
)
def create_vocab(vocab: schemas.VocabCreate, db: Session = Depends(get_db)):
    title = vocab.title.strip()
    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="단어장 이름을 입력해 주세요.",
        )

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

    existing_vocab = (
        db.query(models.Vocabulary)
        .filter(
            models.Vocabulary.owner_id == vocab.owner_id,
            models.Vocabulary.title == title,
        )
        .first()
    )
    if existing_vocab:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 존재하는 단어장 이름입니다.",
        )

    db_vocab = models.Vocabulary(
        title=title,
        owner_id=vocab.owner_id,
    )
    db.add(db_vocab)

    try:
        db.commit() #진짜 저장
    except IntegrityError: #중복아이디라면 에러 발송
        db.rollback() #실패된 작업 취소
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="새로운 단어장 이름을 선택해주세요.",
        )

    db.refresh(db_vocab)
    return db_vocab


@app.put("/vocabs/{vocabulary_id}/description/", response_model=schemas.Vocabulary)
def update_vocab_description(
    vocabulary_id: int,
    description_update: schemas.VocabDescriptionUpdate,
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
            detail="수정할 단어장을 찾을 수 없습니다.",
        )

    vocabulary.description = description_update.description.strip()
    vocabulary.tags = description_update.tags.strip()
    db.commit()
    db.refresh(vocabulary)
    return vocabulary


@app.put("/vocabs/{vocabulary_id}/public/", response_model=schemas.Vocabulary)
def update_vocab_public(
    vocabulary_id: int,
    public_update: schemas.VocabPublicUpdate,
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
            detail="수정할 단어장을 찾을 수 없습니다.",
        )

    vocabulary.is_public = public_update.is_public
    db.commit()
    db.refresh(vocabulary)
    return vocabulary


@app.post(
    "/vocabs/{vocabulary_id}/copy/",
    response_model=schemas.Vocabulary,
    status_code=status.HTTP_201_CREATED,
)
def copy_shared_vocab(
    vocabulary_id: int,
    copy_request: schemas.VocabCopyRequest,
    db: Session = Depends(get_db),
):
    owner = (
        db.query(models.User)
        .filter(models.User.id == copy_request.owner_id)
        .first()
    )
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다.",
        )

    source_vocab = (
        db.query(models.Vocabulary)
        .filter(
            models.Vocabulary.id == vocabulary_id,
            models.Vocabulary.is_public == True,
        )
        .first()
    )
    if not source_vocab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="공유된 단어장을 찾을 수 없습니다.",
        )

    base_title = source_vocab.title.strip()
    new_title = base_title
    suffix = 1
    while (
        db.query(models.Vocabulary)
        .filter(
            models.Vocabulary.owner_id == copy_request.owner_id,
            models.Vocabulary.title == new_title,
        )
        .first()
    ):
        new_title = f"{base_title} ({suffix})"
        suffix += 1

    copied_vocab = models.Vocabulary(
        title=new_title,
        owner_id=copy_request.owner_id,
        description=source_vocab.description,
        tags=source_vocab.tags,
        is_public=False,
    )
    db.add(copied_vocab)
    db.flush()

    for source_word in source_vocab.words:
        db.add(
            models.Word(
                vocab_id=copied_vocab.id,
                word=source_word.word,
                meaning=source_word.meaning,
                examples=source_word.examples or "",
            )
        )

    db.commit()
    db.refresh(copied_vocab)
    return copied_vocab


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
    term = word.word.strip()
    meaning = word.meaning.strip()
    examples = word.examples.strip()
    if not term or not meaning:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="단어와 뜻을 모두 입력해 주세요.",
        )

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

    existing_word = (
        db.query(models.Word)
        .filter(
            models.Word.vocab_id == vocabulary_id,
            models.Word.word == term,
        )
        .first()
    )
    if existing_word:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 존재하는 단어입니다.",
        )

    db_word = models.Word(
        vocab_id=vocabulary_id,
        word=term,
        meaning=meaning,
        examples=examples,
    )
    db.add(db_word)

    try:
        db.commit() 
    except IntegrityError: 
        db.rollback() 
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="이미 존재하는 단어입니다.",
        )

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

