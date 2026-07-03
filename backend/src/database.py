# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite를 사용할 경우의 설정 (파일 기반 DB)
SQLALCHEMY_DATABASE_URL = "sqlite:///./wordnote.db"

# 엔진 생성
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# 세션 생성 (DB와 통신하는 통로)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 핵심! 이 Base를 상속받아야 models.py에서 테이블 인식이 가능합니다.
Base = declarative_base()

