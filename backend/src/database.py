#Sqlalchemy: sql database의 각 테이블과 프로그램의 클래스를 1:1 매칭해주는 역할
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite를 사용할 경우의 설정 (파일 기반 DB)
SQLALCHEMY_DATABASE_URL = "sqlite:///./wordnote.db"

# 엔진 (실제로 DB와 소통하는 담당) 생성
# 주어진 url 경로를 이용, check_same_thread로 sql_lite에서 금지된 중복 접속을 방지
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# DB와 소통하는 세션, engine을 통해 연결, 자동저장 방지
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 핵심! 이 Base를 상속받아야 models.py에서 테이블 인식이 가능합니다.
# Base는 파이썬을 객체를 테이블 형태 데이터로 바꿔줌 -> DB에서도 인식 가능
Base = declarative_base()

