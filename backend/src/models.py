#DB 스키마를 정의하는 코드
from .database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users" #DB에서 사용될 테이블명
    id = Column(Integer, primary_key=True, index=True) #기본키 (고유키)
    username = Column(String, unique=True, nullable=False) 
    hashed_password = Column(String, nullable=False)

    # 한 User이 가진 모든 Vocabulary들을 종속적으로 저장해서 한번에 불러오게 하고 계정 삭제시 모두 삭제되도록 함
    vocabs = relationship(
        "Vocabulary",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

class Vocabulary(Base):
    __tablename__ = "vocabularies"
    id = Column(Integer, primary_key=True, index=True) #얘도 고유키
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False) #다른 객체(users)의 id를 참고해서 owner id 작성
    title = Column(String, nullable=False)

    owner = relationship("User", back_populates="vocabs")
    words = relationship(
        "Word",
        back_populates="vocab",
        cascade="all, delete-orphan",
    )

class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True, index=True) #고유키
    vocab_id = Column(Integer, ForeignKey("vocabularies.id"), nullable=False) #어떤 단어장?
    # 기존 SQLite의 term 컬럼은 유지하면서 Python/API에서는 word로 사용합니다. - front와 term 동일시를 위한 변경
    word = Column("term", String, nullable=False)
    meaning = Column(String, nullable=False)
    examples = Column(String, nullable= True)

    #vocab를 구성하는 요소로 words가 사용된다는 의미
    vocab = relationship("Vocabulary", back_populates="words")
