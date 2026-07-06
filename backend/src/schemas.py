from pydantic import BaseModel, ConfigDict, Field
# pydantic - 데이터 출입문 역할/ fastAPI에 속해있음
# 데이터 검증 및 변환 담당

#BaseModel을 상속받으면 데이터 검증기로 작동
class WordCreate(BaseModel):
    word: str
    meaning: str
    examples: str = ""


class WordUpdate(WordCreate):
    pass


class Word(WordCreate):
    model_config = ConfigDict(from_attributes=True) 
    #작동방식을 딕셔너리가 아닌 객체 속성을 많이 만들 수 있는 형태로 만듦

    id: int
    vocab_id: int


class VocabCreate(BaseModel):
    title: str
    owner_id: int


class Vocabulary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    owner_id: int
    words: list[Word] = Field(default_factory=list)


class UserLogin(BaseModel):
    username: str
    password: str


class UserCreate(UserLogin):
    pass

class PasswordUpdate(BaseModel):
    new_password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str


class LoginResponse(UserResponse):
    message: str
