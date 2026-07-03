# backend/main.py
from fastapi import FastAPI
from .database import engine, Base
from . import models

# 테이블 생성 (DB 파일이 없으면 생성됨)
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "단어장 서비스 시작!"}