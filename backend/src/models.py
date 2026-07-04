from .database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    vocabs = relationship(
        "Vocabulary",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

class Vocabulary(Base):
    __tablename__ = "vocabularies"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)

    owner = relationship("User", back_populates="vocabs")
    words = relationship(
        "Word",
        back_populates="vocab",
        cascade="all, delete-orphan",
    )

class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True, index=True)
    vocab_id = Column(Integer, ForeignKey("vocabularies.id"), nullable=False)
    # 기존 SQLite의 term 컬럼은 유지하면서 Python/API에서는 word로 사용합니다.
    word = Column("term", String, nullable=False)
    meaning = Column(String, nullable=False)

    vocab = relationship("Vocabulary", back_populates="words")
