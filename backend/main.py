"""
main.py — FastAPI 진입점
우리은행 AI 완전판매 검증 에이전트 백엔드 서버

실행:
  uvicorn main:app --reload --port 8000

환경변수 (.env):
  GEMINI_API_KEY   — Gemini LLM Judge 사용 시 필수
  WHISPER_MODEL    — STT 모델 크기 (기본: base)
  PORT             — 서버 포트 (기본: 8000)
  ALLOWED_ORIGINS  — CORS 허용 오리진 (쉼표 구분)
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

# .env 파일 로드 (서버 시작 시 가장 먼저)
load_dotenv()

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel, Field

from judge import judge
from rag import extract_fund_risks
from stt import transcribe_audio
from tts import synthesize_speech

# --------------------------------------------------------------------------- #
# 로깅 설정                                                                     #
# --------------------------------------------------------------------------- #

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
# 앱 초기화                                                                     #
# --------------------------------------------------------------------------- #

@asynccontextmanager
async def lifespan(app: FastAPI):
    """서버 시작/종료 시 실행되는 컨텍스트 매니저"""
    logger.info("=" * 60)
    logger.info("우리은행 AI 완전판매 검증 에이전트 서버 시작")
    logger.info("Gemini API 키: %s", "설정됨" if os.getenv("GEMINI_API_KEY") else "미설정 (휴리스틱 fallback)")
    logger.info("Whisper 모델: %s", os.getenv("WHISPER_MODEL", "base"))
    logger.info("=" * 60)
    yield
    logger.info("서버 종료")


app = FastAPI(
    title="우리은행 AI 완전판매 검증 에이전트",
    description="RAG 기반 위험 추출 + LLM Judge + 음성 서명(STT/TTS) API",
    version="1.0.0",
    lifespan=lifespan,
)


# --------------------------------------------------------------------------- #
# CORS 설정                                                                     #
# React 앱(localhost:5173) + Capacitor(capacitor://localhost) 허용              #
# --------------------------------------------------------------------------- #

_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,capacitor://localhost"
)
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- #
# 요청/응답 스키마                                                               #
# --------------------------------------------------------------------------- #

class JudgeRequest(BaseModel):
    transcript: str = Field(..., description="고객 발화 텍스트")
    context: str = Field(..., description="AI가 안내한 위험 내용")


class JudgeResponse(BaseModel):
    result: str          # "PASS" | "FAIL"
    reason: str
    suggestion: str | None = None


class TTSRequest(BaseModel):
    text: str = Field(..., description="변환할 텍스트")
    lang: str = Field(default="ko", description="언어 코드")


class RAGRequest(BaseModel):
    fund_id: int = Field(..., ge=1, le=9, description="펀드 ID (1-9)")
    investor_type: str = Field(..., description="투자자 유형")


class RAGResponse(BaseModel):
    risks: list[str]
    summary: str
    personalized_warning: str


# --------------------------------------------------------------------------- #
# 엔드포인트                                                                    #
# --------------------------------------------------------------------------- #

@app.get("/api/health", tags=["system"])
async def health():
    """서버 상태 확인"""
    return {
        "status": "ok",
        "gemini": "available" if os.getenv("GEMINI_API_KEY") else "fallback",
        "whisper_model": os.getenv("WHISPER_MODEL", "base"),
    }


@app.post("/api/judge", response_model=JudgeResponse, tags=["judge"])
async def api_judge(req: JudgeRequest):
    """
    고객 발화가 투자 위험성을 진정으로 이해·동의한 것인지 판별합니다.

    - GEMINI_API_KEY 설정 시: Gemini LLM으로 판별
    - 미설정 시: 키워드 기반 휴리스틱 판별
    """
    try:
        result = await judge(req.transcript, req.context)
        return JudgeResponse(**result)
    except Exception as e:
        logger.error("Judge 처리 오류: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/stt", tags=["stt"])
async def api_stt(audio: UploadFile = File(...)):
    """
    음성 파일을 텍스트로 변환합니다.

    - faster-whisper 설치 시: GPU/CPU Whisper 모델 사용
    - 미설치 시: {"transcript": "__USE_WEB_SPEECH__"} 반환
      (프론트엔드에서 Web Speech API로 fallback 처리)

    지원 포맷: webm, wav, mp3, ogg, m4a
    """
    try:
        audio_bytes = await audio.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="음성 파일이 비어있습니다.")

        transcript = await transcribe_audio(audio_bytes, audio.filename or "audio.webm")
        return {"transcript": transcript}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("STT 처리 오류: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tts", tags=["tts"])
async def api_tts(req: TTSRequest):
    """
    텍스트를 MP3 음성으로 변환하여 스트리밍 반환합니다.

    - gTTS 사용 (Google TTS, 인터넷 필요)
    - Content-Type: audio/mpeg
    """
    try:
        audio_bytes = await synthesize_speech(req.text, req.lang)
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=tts_output.mp3",
                "Cache-Control": "no-cache",
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("TTS 처리 오류: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/rag/extract", response_model=RAGResponse, tags=["rag"])
async def api_rag_extract(req: RAGRequest):
    """
    펀드 ID와 투자자 유형을 받아 핵심 위험 정보를 추출합니다.

    - fund_risks.json에서 펀드별 위험 정보 조회
    - 투자자 유형과 펀드 위험등급 불일치 시 경고 추가
    - ChromaDB 설치 시 벡터 기반 RAG 검색 활성화
    """
    try:
        result = extract_fund_risks(req.fund_id, req.investor_type)
        return RAGResponse(**result)
    except Exception as e:
        logger.error("RAG 처리 오류: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


# --------------------------------------------------------------------------- #
# 직접 실행 시 uvicorn 서버 시작                                                #
# --------------------------------------------------------------------------- #

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
