"""
extractor.py - Groq (무료, 초고속) 버전
"""
import json
import time
import pandas as pd
from groq import Groq
from tqdm import tqdm
from config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

# 무료 + 한국어 지원이 좋은 모델들
MODEL_NAME = "llama-3.3-70b-versatile"   # 추천: 똑똑하고 빠름
# MODEL_NAME = "llama-3.1-8b-instant"     # 더 빠름 (속도 우선)
# MODEL_NAME = "openai/gpt-oss-20b"       # GPT 계열 무료

SYSTEM_PROMPT = """당신은 범죄 데이터 분석 및 정보 추출 전문가입니다.
제공된 보이스피싱 뉴스 기사 본문을 읽고, 아래 정의된 추출 기준에 따라 정확하게 정보를 파싱하여 지정된 JSON 형식으로만 출력하십시오.
기사 내용에 없는 정보는 절대로 유추하지 말고, 반드시 null로 처리하십시오.

[추출 기준 및 JSON 키]
{
  "crime_type": "기관사칭형" | "대출빙자형" | "메신저피싱(지인사칭)" | "기타",
  "demographics": {
    "age": "20대" 등 문자열 또는 null,
    "gender": "남성"|"여성" 또는 null,
    "occupation": 직업 문자열 또는 null
  },
  "incident_count": 정수 또는 null,
  "incident_year": YYYY 정수 또는 null,
  "psychological_trigger": 피해자가 송금하게 된 결정적 심리/상황 원인 한 문장
}

[Few-Shot Examples]

## Example 1
Input: "서울 서초경찰서는 15일, 검사를 사칭해 20대 취업준비생 B씨로부터 5000만원을 가로챈 보이스피싱 수거책을 구속했다고 밝혔다. 범인들은 '계좌가 대포통장 범죄에 연루됐다'며 가짜 구속영장을 카카오톡으로 보내 극도의 공포감을 조성한 뒤 안전 계좌로 이체하게 했다."
Output:
{"crime_type":"기관사칭형","demographics":{"age":"20대","gender":null,"occupation":"취업준비생"},"incident_count":1,"incident_year":2024,"psychological_trigger":"대포통장 연루 협박과 가짜 구속영장 전송을 통한 극도의 공포감 조성"}

## Example 2
Input: "어제 오후, 저금리 대출을 미끼로 수백만 원을 뜯어낸 사기범이 검거됐다. 기존 대출금을 갚으면 더 낮은 이자로 대환대출 해주겠다며 선입금을 요구했다."
Output:
{"crime_type":"대출빙자형","demographics":{"age":null,"gender":null,"occupation":null},"incident_count":null,"incident_year":2024,"psychological_trigger":"저금리 대환 대출을 미끼로 한 경제적 절박함 악용"}

반드시 위 JSON 객체만 출력하십시오. 마크다운, 설명, 코드블록 절대 금지.
"""


def extract_info(article_text, pub_year=None):
    """단일 기사 → 구조화된 dict (Groq API)"""
    hint = f"(참고: 기사 발행 연도는 {pub_year}년입니다.)" if pub_year else ""
    user_prompt = f"{hint}\n\n[기사 본문]\n{article_text[:4000]}"

    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},  # JSON 강제
            temperature=0.1,
            max_tokens=600,
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"[추출 실패] {e}")
        return None


def batch_extract(df, text_col="FullText", year_col="Year", sleep=0.3):
    """DataFrame 전체에 적용 (Groq는 30/분이라 sleep 짧게)"""
    results = []
    for _, row in tqdm(df.iterrows(), total=len(df), desc="LLM 추출"):
        text = row.get(text_col) or row.get("Description", "")
        if not text or len(str(text)) < 50:
            results.append(None)
            continue
        info = extract_info(str(text), pub_year=row.get(year_col))
        results.append(info)
        time.sleep(sleep)
    return results


def flatten_results(df, results):
    """JSON 결과 평탄화"""
    df = df.copy().reset_index(drop=True)

    norm_rows = []
    for r in results:
        if r is None:
            norm_rows.append({
                "crime_type": None, "age": None, "gender": None,
                "occupation": None, "incident_count": None,
                "incident_year": None, "psychological_trigger": None,
            })
            continue
        demo = r.get("demographics") or {}
        if not isinstance(demo, dict):
            demo = {}
        norm_rows.append({
            "crime_type": r.get("crime_type"),
            "age": demo.get("age"),
            "gender": demo.get("gender"),
            "occupation": demo.get("occupation"),
            "incident_count": r.get("incident_count"),
            "incident_year": r.get("incident_year"),
            "psychological_trigger": r.get("psychological_trigger"),
        })

    norm_df = pd.DataFrame(norm_rows)
    return pd.concat([df, norm_df], axis=1)


if __name__ == "__main__":
    sample = "서울 강남경찰서는 60대 자영업자 A씨가 검찰을 사칭한 보이스피싱 일당에게 3억원을 송금당했다고 20일 밝혔다."
    result = extract_info(sample, pub_year=2026)
    print(json.dumps(result, ensure_ascii=False, indent=2))
