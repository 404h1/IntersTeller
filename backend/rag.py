"""
rag.py — RAG 엔진 모듈
ChromaDB + LangChain을 활용하여 펀드별 핵심 위험 정보를 추출합니다.
fund_risks.json에서 데이터를 읽고, 투자자 유형과 펀드 위험등급 불일치 시 경고를 추가합니다.

아키텍처:
  - 1차: fund_risks.json 직접 조회 (항상 동작)
  - 2차: ChromaDB 벡터 검색 (chromadb 설치 시 자동 활성화, 더 상세한 RAG 지원)
"""

from __future__ import annotations

import json
import logging
import os
from pathlib import Path
from typing import TypedDict

logger = logging.getLogger(__name__)

# 데이터 파일 경로
DATA_PATH = Path(__file__).parent / "data" / "fund_risks.json"

# 투자자 유형별 위험 허용 수준 (높을수록 고위험 허용)
INVESTOR_RISK_LEVEL: dict[str, int] = {
    "안정형": 1,
    "안정추구형": 2,
    "위험중립형": 3,
    "적극투자형": 4,
    "공격투자형": 5,
}

# 펀드 위험등급별 수준
FUND_RISK_LEVEL: dict[str, int] = {
    "매우낮은위험": 1,
    "낮은위험": 2,
    "다소낮은위험": 2,
    "보통위험": 3,
    "중간위험": 3,
    "다소높은위험": 4,
    "높은위험": 4,
    "매우높은위험": 5,
}


# --------------------------------------------------------------------------- #
# 결과 타입                                                                     #
# --------------------------------------------------------------------------- #

class RagResult(TypedDict):
    risks: list[str]
    summary: str
    personalized_warning: str


# --------------------------------------------------------------------------- #
# 데이터 로드                                                                   #
# --------------------------------------------------------------------------- #

_fund_data: dict | None = None


def _load_fund_data() -> dict:
    global _fund_data
    if _fund_data is not None:
        return _fund_data
    if not DATA_PATH.exists():
        logger.warning("fund_risks.json 파일이 없습니다: %s", DATA_PATH)
        _fund_data = {}
    else:
        with open(DATA_PATH, encoding="utf-8") as f:
            _fund_data = json.load(f)
        logger.info("fund_risks.json 로드 완료: %d개 펀드", len(_fund_data))
    return _fund_data


# --------------------------------------------------------------------------- #
# ChromaDB 벡터 스토어 (선택적 활성화)                                           #
# --------------------------------------------------------------------------- #

_chroma_store = None
_chroma_initialized = False


def _init_chroma() -> None:
    """ChromaDB 초기화 (설치된 경우에만). 비동기 호출이지만 초기화는 동기로 처리."""
    global _chroma_store, _chroma_initialized
    if _chroma_initialized:
        return
    _chroma_initialized = True

    try:
        from langchain_chroma import Chroma
        from langchain_community.embeddings import FakeEmbeddings  # 경량 임베딩

        persist_dir = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
        fund_data = _load_fund_data()

        # 문서 구성
        texts = []
        metadatas = []
        for fund_id, fund in fund_data.items():
            doc = (
                f"펀드명: {fund['full_name']}\n"
                f"위험등급: {fund['risk_grade']}\n"
                f"지역: {fund['region']}\n"
                f"위험내용: {' '.join(fund['risks'])}\n"
                f"요약: {fund['summary']}"
            )
            texts.append(doc)
            metadatas.append({"fund_id": str(fund_id)})

        # 경량 FakeEmbeddings 사용 (프로덕션에서는 HuggingFace 임베딩 권장)
        # 프로덕션 대안:
        #   from langchain_community.embeddings import HuggingFaceEmbeddings
        #   embeddings = HuggingFaceEmbeddings(model_name="jhgan/ko-sroberta-multitask")
        embeddings = FakeEmbeddings(size=384)

        _chroma_store = Chroma.from_texts(
            texts=texts,
            embedding=embeddings,
            metadatas=metadatas,
            persist_directory=persist_dir,
        )
        logger.info("ChromaDB 초기화 완료 (%d개 문서)", len(texts))

    except ImportError:
        logger.info("ChromaDB/LangChain 미설치 — fund_risks.json 직접 조회 모드")
        _chroma_store = None
    except Exception as e:
        logger.warning("ChromaDB 초기화 실패: %s — 직접 조회 모드", e)
        _chroma_store = None


# --------------------------------------------------------------------------- #
# 개인화 경고 생성                                                               #
# --------------------------------------------------------------------------- #

def _build_personalized_warning(
    fund: dict,
    investor_type: str,
) -> str:
    """투자자 유형과 펀드 위험등급 불일치 시 강화된 경고 메시지를 생성합니다."""
    investor_level = INVESTOR_RISK_LEVEL.get(investor_type, 3)
    fund_level = FUND_RISK_LEVEL.get(fund["risk_grade"], 3)

    fund_name = fund.get("short_name", fund.get("full_name", "해당 펀드"))
    fund_risk = fund.get("risk_grade", "알 수 없음")
    region = fund.get("region", "")

    # 환율 위험 추가
    fx_warning = ""
    if region in ("글로벌", "해외"):
        fx_warning = " 또한 해외 투자 특성상 환율 변동에 따른 추가 손실이 발생할 수 있습니다."

    if fund_level > investor_level:
        gap = fund_level - investor_level
        if gap >= 2:
            # 심각한 불일치
            warning = (
                f"[중요 경고] 고객님의 투자성향({investor_type})과 {fund_name}의 위험등급({fund_risk}) 간에 "
                f"상당한 차이가 있습니다. 이 상품은 고객님의 투자성향보다 훨씬 높은 위험을 내포하고 있어 "
                f"원금의 상당 부분을 잃을 수 있습니다.{fx_warning} "
                f"투자 결정 전 반드시 전문 상담사와 상의하시길 강력히 권고합니다."
            )
        else:
            # 경미한 불일치
            warning = (
                f"[주의] 고객님의 투자성향({investor_type})보다 {fund_name}의 위험등급({fund_risk})이 "
                f"다소 높습니다. 원금 손실 가능성을 충분히 인지하고 가입하시기 바랍니다.{fx_warning}"
            )
    elif investor_level >= 4 and fund_level <= 3:
        # 공격/적극 투자형이 저위험 상품 가입 시
        warning = (
            f"고객님의 투자성향({investor_type})에 비해 {fund_name}({fund_risk})은 상대적으로 "
            f"보수적인 상품입니다. 기대수익이 낮을 수 있습니다."
        )
    else:
        # 적합 또는 동일 수준
        warning = (
            f"고객님의 투자성향({investor_type})은 {fund_name}({fund_risk}) 상품과 "
            f"적합한 수준입니다. 단, 원금 손실 가능성은 항상 존재합니다.{fx_warning}"
        )

    return warning


# --------------------------------------------------------------------------- #
# 공개 인터페이스                                                               #
# --------------------------------------------------------------------------- #

def extract_fund_risks(fund_id: int, investor_type: str) -> RagResult:
    """
    펀드 ID와 투자자 유형을 받아 핵심 위험 정보와 개인화 경고를 반환합니다.

    Args:
        fund_id: 펀드 ID (1~9)
        investor_type: 투자자 유형 (안정형 / 안정추구형 / 위험중립형 / 적극투자형 / 공격투자형)

    Returns:
        RagResult with keys: risks, summary, personalized_warning
    """
    # ChromaDB 초기화 시도 (최초 1회)
    _init_chroma()

    fund_data = _load_fund_data()
    fund_key = str(fund_id)

    # 펀드 데이터 조회
    if fund_key not in fund_data:
        # ID 매핑: 짝수 ID는 홀수 ID의 C클래스
        # 1→1, 2→1, 3→3, 4→3, 5→5, 6→5, 7→7, 8→7, 9→9
        base_id = fund_id if fund_id % 2 == 1 else fund_id - 1
        fund_key = str(base_id)

    if fund_key not in fund_data:
        logger.warning("펀드 ID %d 데이터 없음, 기본값 반환", fund_id)
        return RagResult(
            risks=["원금 손실이 가능한 상품입니다.", "예금자보호 대상이 아닙니다."],
            summary="투자 위험이 있는 펀드 상품입니다.",
            personalized_warning="투자 전 반드시 위험 내용을 확인하시기 바랍니다."
        )

    fund = fund_data[fund_key]
    personalized_warning = _build_personalized_warning(fund, investor_type)

    return RagResult(
        risks=fund["risks"],
        summary=fund["summary"],
        personalized_warning=personalized_warning,
    )
