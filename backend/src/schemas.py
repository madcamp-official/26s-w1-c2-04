from pydantic import BaseModel, ConfigDict, Field


class WordCreate(BaseModel):
    word: str
    meaning: str


class WordUpdate(WordCreate):
    pass


class Word(WordCreate):
    model_config = ConfigDict(from_attributes=True)

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


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str


class LoginResponse(UserResponse):
    message: str
