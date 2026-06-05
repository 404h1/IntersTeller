"""
tts.py — TTS(Text-to-Speech) 모듈
gTTS를 기본 엔진으로 사용하여 텍스트를 음성으로 변환합니다.

엔진 우선순위:
  1. gTTS (기본, 즉시 동작, 인터넷 필요)
  2. [주석 처리] Qwen3-TTS (오프라인 고품질, RTX 5060 Ti 권장)

gTTS 특성:
  - Google TTS API 기반, 별도 API 키 불필요
  - 한국어 지원 우수
  - 응답 지연: ~1-2초 (네트워크 상태에 따라)
  - 오프라인 환경 불가

[Qwen3-TTS 대안 — 오프라인 고품질 음성 합성]
  RTX 5060 Ti 8GB VRAM에서 Qwen3-TTS 0.6B 모델 동작 가능 (~2GB VRAM)
  설치: pip install torch torchaudio transformers soundfile
  아래 주석 처리된 코드 블록을 활성화하면 됩니다.
"""

from __future__ import annotations

import io
import logging

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------- #
# [비활성화] Qwen3-TTS — 오프라인 고품질 음성 합성                               #
# RTX 5060 Ti 8GB 환경에서 동작 가능                                            #
# 활성화하려면 아래 주석을 해제하고 gTTS 섹션을 주석 처리하세요.                   #
# --------------------------------------------------------------------------- #

# import torch
# from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor
# import soundfile as sf
#
# _qwen_model = None
# _qwen_processor = None
# _QWEN_MODEL_ID = "Qwen/Qwen3-TTS-0.6B"
#
# def _init_qwen():
#     global _qwen_model, _qwen_processor
#     if _qwen_model is not None:
#         return
#     device = "cuda" if torch.cuda.is_available() else "cpu"
#     torch_dtype = torch.float16 if device == "cuda" else torch.float32
#     logger.info("Qwen3-TTS 모델 로드 중... (device=%s)", device)
#     _qwen_processor = AutoProcessor.from_pretrained(_QWEN_MODEL_ID)
#     _qwen_model = AutoModelForSpeechSeq2Seq.from_pretrained(
#         _QWEN_MODEL_ID,
#         torch_dtype=torch_dtype,
#         low_cpu_mem_usage=True,
#     ).to(device)
#     logger.info("Qwen3-TTS 로드 완료")
#
# async def synthesize_qwen(text: str) -> bytes:
#     import asyncio
#     _init_qwen()
#     def _synth():
#         inputs = _qwen_processor(text=text, return_tensors="pt")
#         inputs = {k: v.to(_qwen_model.device) for k, v in inputs.items()}
#         with torch.no_grad():
#             output = _qwen_model.generate(**inputs)
#         wav = output.cpu().numpy().squeeze()
#         buf = io.BytesIO()
#         sf.write(buf, wav, samplerate=22050, format="WAV")
#         buf.seek(0)
#         return buf.read()
#     loop = asyncio.get_event_loop()
#     return await loop.run_in_executor(None, _synth)


# --------------------------------------------------------------------------- #
# gTTS — 기본 엔진 (인터넷 필요, 즉시 동작)                                     #
# --------------------------------------------------------------------------- #

async def synthesize_speech(text: str, lang: str = "ko") -> bytes:
    """
    텍스트를 MP3 음성으로 변환합니다.

    Args:
        text: 변환할 텍스트 (한국어)
        lang: 언어 코드 (기본: "ko")

    Returns:
        MP3 바이트 데이터 (audio/mpeg)

    Raises:
        RuntimeError: gTTS 호출 실패 또는 미설치 시
    """
    if not text or not text.strip():
        raise ValueError("변환할 텍스트가 비어있습니다.")

    text = text.strip()

    # 너무 긴 텍스트는 앞부분만 사용 (gTTS 제한 고려)
    MAX_CHARS = 500
    if len(text) > MAX_CHARS:
        text = text[:MAX_CHARS] + "..."
        logger.warning("텍스트가 너무 길어 %d자로 잘랐습니다.", MAX_CHARS)

    try:
        from gtts import gTTS  # type: ignore
        import asyncio

        def _synth():
            tts = gTTS(text=text, lang=lang, slow=False)
            buf = io.BytesIO()
            tts.write_to_fp(buf)
            buf.seek(0)
            return buf.read()

        loop = asyncio.get_event_loop()
        audio_bytes = await loop.run_in_executor(None, _synth)
        logger.info("gTTS 합성 완료: %d자 → %d bytes", len(text), len(audio_bytes))
        return audio_bytes

    except ImportError:
        raise RuntimeError(
            "gTTS가 설치되지 않았습니다. 'pip install gTTS' 실행 후 서버를 재시작하세요."
        )
    except Exception as e:
        logger.error("gTTS 합성 실패: %s", e)
        raise RuntimeError(f"음성 합성 실패: {e}") from e
