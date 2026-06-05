"""
judge.py — LLM Judge 모듈
고객 발화가 금융상품 위험성을 진정으로 이해·동의한 것인지 판별합니다.

우선순위:
  1. Gemini API (GEMINI_API_KEY 설정 시)
  2. 로컬 휴리스틱 fallback (API 키 없거나 호출 실패 시)
"""

from __future__ import annotations

import json
import os
import re
import logging
from typing import TypedDict

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# 결과 타입                                                                     #
# --------------------------------------------------------------------------- #

class JudgeResult(TypedDict):
    result: str        # "PASS" | "FAIL"
    reason: str
    suggestion: str | None


# --------------------------------------------------------------------------- #
# Gemini 클라이언트 (지연 초기화)                                                #
# --------------------------------------------------------------------------- #

_gemini_client = None

def _get_gemini_client():
    global _gemini_client
    if _gemini_client is not None:
        return _gemini_client
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
        _gemini_client = genai.GenerativeModel(model_name)
        logger.info("Gemini 클라이언트 초기화 완료: %s", model_name)
    except Exception as e:
        logger.warning("Gemini 초기화 실패: %s — 휴리스틱 fallback 사용", e)
        _gemini_client = None
    return _gemini_client


# --------------------------------------------------------------------------- #
# 시스템 프롬프트                                                               #
# --------------------------------------------------------------------------- #

SYSTEM_PROMPT = """너는 금융 완전판매 검증 AI야. 고객의 발화가 상품 위험성을 진정으로 이해하고 동의한 것인지 판별해.

[절대 규칙]
1. "네", "이해했습니다", "알겠습니다", "네 알겠어요", "예", "맞습니다", "그렇습니다" 등 명확한 긍정 표현 → PASS
2. "아마도요", "잘 모르겠는데요", "그러니까요?", "뭐라고요?", "다시 말씀해주세요", "잘 안 들려요" → FAIL
3. 단순 반복·메아리 발화 (예: 기계음 그대로 따라 말하기) → FAIL
4. 약관에 없는 내용에 대한 질문 → FAIL + suggestion: "해당 약관에 명시되지 않은 내용은 안내해 드릴 수 없습니다"
5. 침묵·빈 발화·알아들을 수 없는 소음 → FAIL
6. "싫어요", "아니요", "거부합니다", "모르겠어요" → FAIL
7. 긍정 + 조건 ("네, 근데...") → FAIL (조건부는 완전 동의 아님)

[판단 기준]
- 발화가 짧아도 진정한 긍정 의사면 PASS (예: "네" 한 마디도 PASS)
- 문맥(context)에서 제시한 위험 내용을 부정하거나 회피하면 FAIL
- 한국어·영어 혼용 발화도 의미 파악 후 판단

[응답 형식 — 반드시 JSON만 출력, 다른 텍스트 금지]
{
  "result": "PASS" | "FAIL",
  "reason": "판단 근거 (1-2문장)",
  "suggestion": "FAIL 시 AI가 재설명할 문구 (PASS면 null). 고객에게 직접 말하는 형식으로."
}"""


# --------------------------------------------------------------------------- #
# Gemini 호출                                                                   #
# --------------------------------------------------------------------------- #

async def _judge_with_gemini(transcript: str, context: str) -> JudgeResult:
    client = _get_gemini_client()
    if client is None:
        raise RuntimeError("Gemini 클라이언트 없음")

    user_message = f"""[검증 요청]
투자 위험 안내 내용(context):
{context}

고객 발화(transcript):
"{transcript}"

위 발화가 투자 위험성을 진정으로 이해·동의한 것인지 판별해주세요."""

    try:
        # Gemini는 system instruction을 별도로 지원하지 않으므로 합쳐서 전송
        full_prompt = SYSTEM_PROMPT + "\n\n" + user_message
        response = client.generate_content(
            full_prompt,
            generation_config={
                "temperature": 0.1,
                "max_output_tokens": 300,
                "response_mime_type": "application/json",
            }
        )
        raw = response.text.strip()
        # JSON 파싱
        data = json.loads(raw)
        return JudgeResult(
            result=data.get("result", "FAIL"),
            reason=data.get("reason", "판단 오류"),
            suggestion=data.get("suggestion"),
        )
    except json.JSONDecodeError as e:
        logger.error("Gemini JSON 파싱 실패: %s — raw: %s", e, response.text[:200])
        raise
    except Exception as e:
        logger.error("Gemini 호출 실패: %s", e)
        raise


# --------------------------------------------------------------------------- #
# 로컬 휴리스틱 fallback                                                        #
# --------------------------------------------------------------------------- #

# 긍정 키워드 패턴
_POSITIVE_PATTERNS = re.compile(
    r"(네|예|응|어|맞아|맞습니다|알겠습니다|알겠어요|이해했습니다|이해했어요|"
    r"이해합니다|동의합니다|동의해요|확인했습니다|확인해요|인지했습니다|"
    r"인지합니다|ok|okay|yes|sure|그렇습니다|그렇죠|맞죠|알고있어요|알고\s*있습니다)",
    re.IGNORECASE
)

# 부정·회피 패턴
_NEGATIVE_PATTERNS = re.compile(
    r"(모르겠|잘\s*모르|아마도|혹시|그러니까요|뭐라고|다시\s*말|못\s*들|"
    r"안\s*들려|싫어|아니요|아니오|거부|반대|이해\s*안|모르는데|그게|"
    r"잠깐|잠시|왜요|그래서|뭔데|뭐예요|어렵|복잡)",
    re.IGNORECASE
)


def _judge_heuristic(transcript: str, context: str) -> JudgeResult:
    """API 없을 때 사용하는 키워드 기반 간단 판별"""
    text = transcript.strip()

    if not text or len(text) < 1:
        return JudgeResult(
            result="FAIL",
            reason="발화 내용이 비어있거나 인식되지 않았습니다.",
            suggestion="죄송합니다, 답변이 잘 인식되지 않았습니다. '네, 이해했습니다'라고 말씀해 주시겠어요?"
        )

    has_negative = bool(_NEGATIVE_PATTERNS.search(text))
    has_positive = bool(_POSITIVE_PATTERNS.search(text))

    if has_negative:
        return JudgeResult(
            result="FAIL",
            reason=f"부정적이거나 불확실한 표현이 감지되었습니다: '{text}'",
            suggestion="원금 손실 가능성을 명확히 이해하셨나요? '네, 이해했습니다'라고 말씀해 주시겠어요?"
        )

    if has_positive:
        return JudgeResult(
            result="PASS",
            reason=f"명확한 긍정 표현이 확인되었습니다: '{text}'",
            suggestion=None
        )

    # 긍정도 부정도 아닌 경우
    return JudgeResult(
        result="FAIL",
        reason=f"명확한 동의 표현을 확인하지 못했습니다: '{text}'",
        suggestion="상품의 위험성을 이해하셨다면 '네, 이해했습니다'라고 말씀해 주세요."
    )


# --------------------------------------------------------------------------- #
# 공개 인터페이스                                                               #
# --------------------------------------------------------------------------- #

async def judge(transcript: str, context: str) -> JudgeResult:
    """
    고객 발화(transcript)가 투자 위험(context)을 이해·동의한 것인지 판별합니다.

    Returns:
        JudgeResult with keys: result, reason, suggestion
    """
    if not transcript or not transcript.strip():
        return JudgeResult(
            result="FAIL",
            reason="발화 내용이 비어있습니다.",
            suggestion="죄송합니다, 답변이 인식되지 않았습니다. '네, 이해했습니다'라고 다시 말씀해 주세요."
        )

    # 1. Gemini 시도
    client = _get_gemini_client()
    if client is not None:
        try:
            return await _judge_with_gemini(transcript, context)
        except Exception as e:
            logger.warning("Gemini 판단 실패, 휴리스틱으로 fallback: %s", e)

    # 2. 휴리스틱 fallback
    return _judge_heuristic(transcript, context)
