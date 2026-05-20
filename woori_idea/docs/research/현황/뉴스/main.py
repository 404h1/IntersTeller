"""
보이스피싱 뉴스 자동 분석 파이프라인
실행: python main.py
"""
import pandas as pd
from config import SEARCH_KEYWORDS, MAX_NEWS_PER_KEYWORD
from crawler import collect_news, parse_results, enrich_with_fulltext
from extractor import batch_extract, flatten_results
from analyzer import summary_report, yearly_trend, demographic_heatmap, trigger_wordcloud


def run_pipeline(fulltext_limit=100, llm_limit=50):
    # === STEP 1. 뉴스 수집 ===
    print("\n[STEP 1] 네이버 뉴스 수집")
    all_df = []
    for kw in SEARCH_KEYWORDS:
        items = collect_news(kw, MAX_NEWS_PER_KEYWORD)
        df = parse_results(items)
        df["Keyword"] = kw
        all_df.append(df)
        print(f"  '{kw}': {len(df)}건")

    merged = (pd.concat(all_df, ignore_index=True)
                .drop_duplicates(subset=["Title"])
                .reset_index(drop=True))
    print(f"  → 중복 제거 후 총 {len(merged)}건")
    merged.to_csv("step1_news_raw.csv", index=False, encoding="utf-8-sig")

    # === STEP 2. 본문 크롤링 ===
    print(f"\n[STEP 2] 본문 크롤링 (상위 {fulltext_limit}건)")
    merged = enrich_with_fulltext(merged, limit=fulltext_limit)
    merged.to_csv("step2_news_fulltext.csv", index=False, encoding="utf-8-sig")

    # === STEP 3. LLM 정보 추출 ===
    print(f"\n[STEP 3] LLM 정보 추출 (상위 {llm_limit}건)")
    target = merged.dropna(subset=["FullText"]).head(llm_limit).reset_index(drop=True)
    results = batch_extract(target)
    final_df = flatten_results(target, results)
    final_df.to_csv("step3_extracted.csv", index=False, encoding="utf-8-sig")

    # === STEP 4. 분석 & 시각화 ===
    print("\n[STEP 4] 분석 & 시각화")
    summary_report(final_df)
    yearly_trend(final_df)
    demographic_heatmap(final_df)
    trigger_wordcloud(final_df)

    print("\n🎉 파이프라인 완료!")
    return final_df


if __name__ == "__main__":
    run_pipeline(fulltext_limit=100, llm_limit=50)
