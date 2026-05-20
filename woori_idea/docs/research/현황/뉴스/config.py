import os
from dotenv import load_dotenv

load_dotenv()

# 네이버 뉴스 API
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID", "YOUR_NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET", "YOUR_NAVER_CLIENT_SECRET")

# LLM API (Gemini 또는 OpenAI 선택)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "YOUR_OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "YOUR_GROQ_API_KEY")

# 검색 설정
SEARCH_KEYWORDS = ["보이스피싱 피해", "보이스피싱 검거", "전화금융사기"]
MAX_NEWS_PER_KEYWORD = 300  # 키워드당 최대 수집 건수 (100단위로 페이지네이션)
