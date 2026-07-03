from .database import Base
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)

class Vocabulary(Base):
    __tablename__ = "vocabularies"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)

class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True, index=True)
    vocab_id = Column(Integer, ForeignKey("vocabularies.id"))
    term = Column(String, nullable=False)
    definition = Column(String, nullable=False)