from sqlalchemy.orm import Session

from . import models


SEED_USERNAME = "__shared_vocab_seed__"

SHARED_VOCAB_SETS = [
    {
        "title": "영어 초급 단어 30",
        "description": "처음 영어 단어장을 가져가는 사용자를 위한 초급 공유 세트입니다.",
        "tags": "영어, 초급, 기본",
        "words": [
            ("apple", "사과", "I eat an apple every morning."),
            ("book", "책", "This book is easy to read."),
            ("water", "물", "Please drink some water."),
            ("friend", "친구", "My friend lives near my house."),
            ("school", "학교", "She goes to school by bus."),
            ("house", "집", "Our house has a small garden."),
            ("family", "가족", "My family eats dinner together."),
            ("happy", "행복한", "I feel happy today."),
            ("small", "작은", "The cat is small."),
            ("big", "큰", "That is a big tree."),
            ("food", "음식", "Korean food is delicious."),
            ("music", "음악", "I listen to music at night."),
            ("day", "하루, 날", "Have a nice day."),
            ("night", "밤", "The stars shine at night."),
            ("morning", "아침", "I study in the morning."),
            ("work", "일하다, 일", "They work in an office."),
            ("play", "놀다", "Children play in the park."),
            ("walk", "걷다", "We walk after lunch."),
            ("run", "달리다", "He can run fast."),
            ("read", "읽다", "I read a story."),
            ("write", "쓰다", "Please write your name."),
            ("listen", "듣다", "Listen to the teacher."),
            ("speak", "말하다", "Can you speak English?"),
            ("open", "열다", "Open the door, please."),
            ("close", "닫다", "Close the window."),
            ("clean", "깨끗한, 청소하다", "Keep your room clean."),
            ("cold", "추운, 차가운", "The water is cold."),
            ("hot", "더운, 뜨거운", "The soup is hot."),
            ("easy", "쉬운", "This question is easy."),
            ("new", "새로운", "I bought a new bag."),
        ],
    },
    {
        "title": "영어 중급 단어 30",
        "description": "일상 독해와 회화에서 자주 쓰는 중급 공유 단어 세트입니다.",
        "tags": "영어, 중급, 회화",
        "words": [
            ("improve", "향상시키다", "Practice can improve your skills."),
            ("prepare", "준비하다", "We need to prepare for the test."),
            ("decide", "결정하다", "She decided to study abroad."),
            ("explain", "설명하다", "Can you explain the rule again?"),
            ("suggest", "제안하다", "He suggested a new idea."),
            ("compare", "비교하다", "Compare the two answers carefully."),
            ("support", "지원하다, 지지하다", "My parents support my dream."),
            ("develop", "발전시키다, 개발하다", "The team will develop an app."),
            ("increase", "증가하다", "Prices may increase next month."),
            ("reduce", "줄이다", "We should reduce waste."),
            ("require", "요구하다, 필요로 하다", "This job requires experience."),
            ("include", "포함하다", "The price includes breakfast."),
            ("provide", "제공하다", "The school provides lunch."),
            ("consider", "고려하다", "Please consider my opinion."),
            ("describe", "묘사하다, 설명하다", "Describe the picture in English."),
            ("purpose", "목적", "What is the purpose of this meeting?"),
            ("reason", "이유", "Tell me the reason."),
            ("result", "결과", "The result was surprising."),
            ("opinion", "의견", "Everyone has a different opinion."),
            ("experience", "경험", "Travel gives us experience."),
            ("environment", "환경", "We must protect the environment."),
            ("culture", "문화", "I want to learn about Korean culture."),
            ("community", "공동체, 지역사회", "The community helped each other."),
            ("available", "이용 가능한", "The room is available now."),
            ("necessary", "필요한", "Sleep is necessary for health."),
            ("possible", "가능한", "It is possible to finish today."),
            ("simple", "간단한", "Use a simple sentence."),
            ("similar", "비슷한", "These two words are similar."),
            ("different", "다른", "They have different tastes."),
            ("important", "중요한", "This is an important lesson."),
        ],
    },
    {
        "title": "영어 고급 단어 30",
        "description": "고급 독해, 발표, 에세이에 쓰기 좋은 공유 단어 세트입니다.",
        "tags": "영어, 고급, 독해",
        "words": [
            ("analyze", "분석하다", "Researchers analyze the collected data."),
            ("evaluate", "평가하다", "We need to evaluate the results."),
            ("interpret", "해석하다", "Students interpret the poem differently."),
            ("demonstrate", "입증하다, 보여주다", "The chart demonstrates a clear trend."),
            ("establish", "설립하다, 확립하다", "The company established a new policy."),
            ("maintain", "유지하다", "It is hard to maintain balance."),
            ("obtain", "얻다", "You must obtain permission first."),
            ("significant", "중요한, 상당한", "There was a significant change."),
            ("consequence", "결과, 영향", "Every decision has a consequence."),
            ("approach", "접근법", "We need a different approach."),
            ("assumption", "가정", "Your assumption may be wrong."),
            ("perspective", "관점", "Try to see it from another perspective."),
            ("evidence", "증거", "The evidence supports the claim."),
            ("hypothesis", "가설", "The experiment tested the hypothesis."),
            ("strategy", "전략", "Their strategy worked well."),
            ("fundamental", "근본적인", "Trust is fundamental to teamwork."),
            ("complex", "복잡한", "This is a complex problem."),
            ("efficient", "효율적인", "The new system is more efficient."),
            ("consistent", "일관된", "Be consistent with your practice."),
            ("potential", "잠재적인", "The idea has great potential."),
            ("crucial", "중대한", "Timing is crucial in this case."),
            ("inevitable", "피할 수 없는", "Change is inevitable."),
            ("temporary", "일시적인", "This is only a temporary solution."),
            ("permanent", "영구적인", "The damage may be permanent."),
            ("emphasize", "강조하다", "The teacher emphasized the key point."),
            ("illustrate", "설명하다, 예시하다", "This example illustrates the concept."),
            ("justify", "정당화하다", "Can you justify your decision?"),
            ("criticize", "비판하다", "It is easy to criticize others."),
            ("negotiate", "협상하다", "They tried to negotiate a deal."),
            ("resolve", "해결하다", "We must resolve the conflict."),
        ],
    },
]


def seed_shared_vocab_sets(db: Session, seed_password_hash: str) -> None:
    seed_user = (
        db.query(models.User)
        .filter(models.User.username == SEED_USERNAME)
        .first()
    )
    if seed_user is None:
        seed_user = models.User(
            username=SEED_USERNAME,
            hashed_password=seed_password_hash,
        )
        db.add(seed_user)
        db.flush()

    for vocab_set in SHARED_VOCAB_SETS:
        vocab = (
            db.query(models.Vocabulary)
            .filter(
                models.Vocabulary.owner_id == seed_user.id,
                models.Vocabulary.title == vocab_set["title"],
            )
            .first()
        )
        if vocab is None:
            vocab = models.Vocabulary(
                owner_id=seed_user.id,
                title=vocab_set["title"],
                share_count=0,
            )
            db.add(vocab)
            db.flush()

        vocab.description = vocab_set["description"]
        vocab.tags = vocab_set["tags"]
        vocab.is_public = True

        existing_words = {word.word: word for word in vocab.words}
        expected_words = {word for word, _, _ in vocab_set["words"]}
        for old_word in list(vocab.words):
            if old_word.word not in expected_words:
                db.delete(old_word)

        for word, meaning, examples in vocab_set["words"]:
            db_word = existing_words.get(word)
            if db_word is None:
                db.add(
                    models.Word(
                        vocab_id=vocab.id,
                        word=word,
                        meaning=meaning,
                        examples=examples,
                    )
                )
            else:
                db_word.meaning = meaning
                db_word.examples = examples

    db.commit()
