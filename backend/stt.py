"""
stt.py — STT(Speech-to-Text) 모듈
faster-whisper를 사용한 음성 → 텍스트 변환

하드웨어 전략:
  - RTX 5060 Ti 8GB VRAM 환경 기준
  - WHISPER_MODEL=large-v3: 약 3GB VRAM, 고정밀 한국어 인식
  - WHISPER_MODEL=base: 약 150MB VRAM, 빠른 속도 (데모 권장)
  - GPU 미지원 시 자동으로 CPU + int8 fallback

fallback:
  - faster-whisper 미설치 시 Web Speech API 사용 안내 반환
  - 파일 디코딩 실패 시 명확한 오류 메시지 반환
"""

from __future__ import annotations

import io
import logging
import os
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# Whisper 모델 (지연 초기화)                                                    #
# --------------------------------------------------------------------------- #

_whisper_model = None
_whisper_initialized = False


def _get_whisper_model():
    global _whisper_model, _whisper_initialized

    if _whisper_initialized:
        return _whisper_model

    _whisper_initialized = True
    model_size = os.getenv("WHISPER_MODEL", "base")

    try:
        from faster_whisper import WhisperModel  # type: ignore

        # GPU 우선, VRAM 부족 시 CPU fallback
        # RTX 5060 Ti (8GB): large-v3 = ~3GB, medium = ~2GB, base = ~150MB
        try:
            _whisper_model = WhisperModel(
                model_size,
                device="cuda",
                compute_type="float16",   # VRAM 절약: float16
                # num_workers=2,           # 병렬 워커 (메모리 여유 시 활성화)
            )
            logger.info("Whisper 모델 로드 완료: %s (CUDA/float16)", model_size)
        except Exception as gpu_err:
            logger.warning("GPU 로드 실패(%s), CPU fallback: %s", model_size, gpu_err)
            _whisper_model = WhisperModel(
                model_size,
                device="cpu",
                compute_type="int8",      # CPU: int8 최적화
            )
            logger.info("Whisper 모델 로드 완료: %s (CPU/int8)", model_size)

    except ImportError:
        logger.info("faster-whisper 미설치 — STT endpoint는 fallback 안내 반환")
        _whisper_model = None

    return _whisper_model


# --------------------------------------------------------------------------- #
# 공개 인터페이스                                                               #
# --------------------------------------------------------------------------- #

async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.webm") -> str:
    """
    음성 데이터를 텍스트로 변환합니다.

    Args:
        audio_bytes: 음성 파일 바이트 (webm / wav / mp3 / ogg 지원)
        filename: 원본 파일명 (확장자로 포맷 추론)

    Returns:
        인식된 텍스트 문자열.
        faster-whisper 미설치 시 "__USE_WEB_SPEECH__" 반환 (프론트에서 처리)

    Raises:
        RuntimeError: 음성 인식 처리 실패 시
    """
    model = _get_whisper_model()

    if model is None:
        # faster-whisper 미설치 → 프론트엔드에서 Web Speech API로 fallback
        return "__USE_WEB_SPEECH__"

    if not audio_bytes:
        raise RuntimeError("음성 데이터가 비어있습니다.")

    # 임시 파일에 저장 후 Whisper에 전달
    suffix = Path(filename).suffix or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        # faster-whisper 동기 호출 (비동기 래퍼)
        import asyncio
        loop = asyncio.get_event_loop()
        transcript = await loop.run_in_executor(
            None,
            lambda: _run_transcription(model, tmp_path)
        )
        return transcript
    finally:
        # 임시 파일 정리
        try:
            os.unlink(tmp_path)
        except OSError:
            pass


def _run_transcription(model, audio_path: str) -> str:
    """동기 Whisper 추론 (executor에서 실행)"""
    segments, info = model.transcribe(
        audio_path,
        language="ko",              # 한국어 고정 (인식 속도 향상)
        beam_size=5,
        vad_filter=True,            # 음성 구간 자동 감지 (잡음 제거)
        vad_parameters=dict(
            min_silence_duration_ms=500,
        ),
        word_timestamps=False,      # 단어별 타임스탬프 불필요
    )

    parts = [seg.text.strip() for seg in segments]
    transcript = " ".join(parts).strip()
    logger.info("STT 완료 (언어: %s, 확률: %.2f): '%s'", info.language, info.language_probability, transcript[:100])
    return transcript
