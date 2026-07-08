# 26s-w1-c2-04

## 공통과제 I : 웹 기반 프로젝트 (2인 1팀)

**목적:** 공통 과제를 함께 수행하며 웹 개발의 전체 흐름을 빠르게 익히고 협업에 적응하기

**결과물:** 기획부터 배포까지 완료된 웹 서비스와 관련 문서 일체

---

## 팀원

| 이름 | GitHub | 역할 |
|---|---|---|
| 이예지 | yeochi369 | back 개발, front 수정 |
| 황시우 | ssiuuuuuu | front 개발, back 수정, 배포 |

---

## 기획안

> 프로젝트 주제, 목적, 핵심 기능, 예상 사용자, 팀원별 역할 등 정리

- **주제: 나만의 사전 웹사이트 **
- **목적: 논문을 읽거나 외국인과 대화할 때 자주 등장하지만 모르거나 헷갈리는 표현을 저장해두고 공부할 수 있는 사이트 **
- **핵심 기능: 사용자별 단어장 (작은 사전) 생성, 단어 추가 및 삭제, 단어 검색 **
- **예상 사용자: 세부적 분야에서의 외국어 단어를 반복적으로 학습하고 싶은 사람 및 학생 **

---

## 기능 명세서

> 구현할 기능을 사용자 관점에서 정리하고, 필수 기능과 선택 기능을 구분

### 필수 기능

- [x] 영어 단어

### 선택 기능

- [단어 검색: 나의 단어장 내에서 단어 뜻 검색]
- [퀴즈 모드: 플래시카드 형태로 단어장 내 단어들을 공부]

---

## IA 및 화면 설계서

> 서비스의 전체 페이지 구조와 페이지 간 이동 흐름; 각 페이지의 주요 UI 구성, 입력 요소, 버튼, 사용자 행동 흐름 등을 간단한 와이어프레임 형태로 정리

<!-- Figma 링크 또는 이미지 첨부 -->
https://www.notion.so/IA-392e1fcea5b180b6ad5fd4a646694833?source=copy_link

---

## DB 스키마

> 필요한 테이블, 주요 필드, 데이터 타입, 테이블 간 관계를 정리

<!-- ERD 이미지 또는 테이블 정의 -->

1. Users table
- ID: Integer / Username: String / Password: String (암호화)
- 사용자 정보 저장
- 고유번호 (PK) 부여
- Vocabulary table의 Owner 역할

2. Vocabulary table
- ID: Integer / Owner_id: Integer / Title: String
- 단어장 저장
- 여러개의 Word 저장

3. Word table
- ID: Integer / Vocab_id: Integer / Term: String / Meaning: String
- 단어와 단어 뜻, 단어 예문, 그리고 어떤 단어장의 일부인지를 저장
- 현재까지 가장 세부적 단계


---

## API 문서

> API 주소, 요청 방식, 요청값, 응답값, 에러 상황을 정리

| Method | Endpoint | 설명 | 요청 | 응답 |
|---|---|---|---|---|
| POST | /vocabs/ | 단어장 생성 | title | db_vocab 저장 |
| GET | /vocabs/ | 단어장 조회 | 없음 | 단어장 title 조회 |
| DELETE | /vocabs/{vocabulary_id} | 단어장 삭제 | word_id | 단어장 삭제 성공 |
| POST | /words/ | 단어 생성 | term, meaning, example | db_word 저장 |
| GET | /words/ | 단어 조회 | 없음 | word (term, meaning) 조회 |
| PUT | /words{word_id}/ | 단어 수정 | word_id | 단어 수정 성공 |
| DELETE | /words{word_id}/ | 단어 삭제 | word_id | 단어 삭제 성공 |
| POST | /users/ | 회원가입 | username, 비밀번호 | db_user 저장 |
| POST | /login/ | 로그인 | username, 비밀번호 | 로그인 성공/실패 여부 |
| POST | /logout/ | 로그아웃 | 로그인 시 받은 access token | 로그아웃 |
| PUT | /users/{userId}/password/ | 비밀번호 변경 | user ID, 비밀번호 | 비밀번호 변경 여부 |
| DELETE | /users/{userId}/ | 회원탈퇴 | user ID | 회원정보 삭제 |

---

## 배포 결과물

> 접속 가능한 링크, 실행 방법, 주요 구현 내용

- **서비스 URL: https://bamtivocab.madcamp-kaist.org/**
- **실행 방법: **

```bash
# 실행 방법 작성
1. 신규회원일 경우 회원가입을 한다.
2. 회원정보로 로그인하면 나의 단어장들이 등장한다
3. 상단에 새로운 단어장의 이름을 입력하여 단어장을 추가할 수 있으며, 각 단어장 하단에 있는 버튼으로 단어장에 들어가거나 단어장을 삭제할 수 있다. 
4. 단어장에서는 단어를 추가, 수정, 삭제할 수 있다. 단어를 추가하기 위해서는 필수적으로 단어와 뜻이 요구되며 선택적으로 예문을 추가할 수 있다.
5. 만들어둔 단어장에서는 단어를 검색하거나 단어 복습 퀴즈를 진행할 수 있다.
6. 회원정보 및 비밀번호를 바꾸거나 회원탈퇴를 하고 싶다면 메인 페이지 우측 상단의 회원정보 버튼을 눌러서 진행할 수 있다. 

```

---

## 회고 문서

> 개발 과정에서의 어려움, 해결 방법, 역할 분담, 다음에 개선할 점 (KPT 방법론 참고)

### Keep
- 먼저 간단한 틀을 만들고 MVP를 보완하면서 보완의 방향이 더 잘 보였던 것 같다.
- 역할을 중간에 바꿈으로써 학습효과와 함께 기존 코드 보완의 장점도 커졌다.

### Problem
- 초반에 프론트/백 변수명을 통일하지 않아 합치는 과정에서 어려움이 있었다.
- AI의 도움을 받은 항목들을 검토하는데에 생각보다 오래 걸렸다.

### Try
- 기획 단계에서 프론트와 백의 변수명을 통일되게 약속하고 개발을 시작하면 합칠 때 덜 힘들었을 것 같다.
- 조금 더 많은 기능을 시도해보고 싶다.

---

## 참고 자료

- [SDD(스펙 주도 개발) 이해하기](https://news.hada.io/topic?id=21338)
- [Software Design Document Best Practices](https://www.atlassian.com/work-management/project-management/design-document)
- [IA 정보구조도 작성 방법](https://brunch.co.kr/@nyonyo/7)
- [기획자 화면설계서 작성법](https://brunch.co.kr/@soup/10)
- [Figma 와이어프레임 가이드](https://www.figma.com/ko-kr/resource-library/what-is-wireframing/)
- [무료 Figma 와이어프레임 키트](https://www.figma.com/ko-kr/templates/wireframe-kits/)
- [ERD/DB 설계 총정리](https://inpa.tistory.com/entry/DB-%F0%9F%93%9A-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EB%AA%A8%EB%8D%B8%EB%A7%81-%EA%B0%9C%EB%85%90-ERD-%EB%8B%A4%EC%9D%B4%EC%96%B4%EA%B7%B8%EB%9E%A8)
- [API 명세서 작성 가이드라인](https://velog.io/@sebinChu/BackEnd-API-%EB%AA%85%EC%84%B8%EC%84%9C-%EC%9E%91%EC%84%B1-%EA%B0%80%EC%9D%B4%EB%93%9C-%EB%9D%BC%EC%9D%B8)
- [좋은 README 작성하는 방법](https://velog.io/@sabo/good-readme)
- [단기 프로젝트 회고 KPT 방법론](https://velog.io/@habwa/%EB%8B%A8%EA%B8%B0-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8-%ED%9A%8C%EA%B3%A0-KPT-%EB%B0%A9%EB%B2%95%EB%A1%A0)
