import json
import time
import urllib.request
import urllib.parse
import requests
import pandas as pd
from bs4 import BeautifulSoup
from tqdm import tqdm
from woori_idea.docs.research.현황.뉴스.config import NAVER_CLIENT_ID, NAVER_CLIENT_SECRET


def get_naver_news(keyword, client_id, client_secret, display=100, start=1):
    """네이버 뉴스 검색 API 단일 요청"""
    enc = urllib.parse.quote(keyword)
    url = f"https://openapi.naver.com/v1/search/news.json?query={enc}&display={display}&start={start}&sort=date"

    req = urllib.request.Request(url)
    req.add_header("X-Naver-Client-Id", client_id)
    req.add_header("X-Naver-Client-Secret", client_secret)

    try:
        res = urllib.request.urlopen(req)
        if res.getcode() == 200:
            return json.loads(res.read().decode("utf-8"))
    except Exception as e:
        print(f"[API 오류] {e}")
    return None


def collect_news(keyword, max_count=300):
    """페이지네이션을 통한 대량 수집 (최대 1000건)"""
    all_items = []
    for start in range(1, min(max_count, 1000) + 1, 100):
        data = get_naver_news(keyword, NAVER_CLIENT_ID, NAVER_CLIENT_SECRET,
                              display=100, start=start)
        if not data or "items" not in data or len(data["items"]) == 0:
            break
        all_items.extend(data["items"])
        time.sleep(0.3)  # API 호출 제한 회피
    return all_items


def clean_html(text):
    """HTML 태그 및 엔티티 제거"""
    return (text.replace("<b>", "").replace("</b>", "")
                .replace("&quot;", '"').replace("&amp;", "&")
                .replace("&lt;", "<").replace("&gt;", ">"))


def parse_results(items):
    """JSON → DataFrame 변환 + 날짜 파싱"""
    rows = []
    for it in items:
        rows.append({
            "Title": clean_html(it["title"]),
            "Link": it["link"],
            "OriginalLink": it.get("originallink", ""),
            "Description": clean_html(it["description"]),
            "PubDate": it["pubDate"],
        })
    df = pd.DataFrame(rows)
    if not df.empty:
        df["PubDate"] = pd.to_datetime(df["PubDate"], errors="coerce")
        df["Year"] = df["PubDate"].dt.year
        df = df.drop_duplicates(subset=["Title"]).reset_index(drop=True)
    return df


def fetch_full_text(url, timeout=5):
    """네이버 뉴스 본문 크롤링 (그 외 매체는 일반 파싱 시도)"""
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        r = requests.get(url, headers=headers, timeout=timeout)
        soup = BeautifulSoup(r.text, "html.parser")

        # 네이버 뉴스 본문
        article = soup.select_one("#dic_area") or soup.select_one("#articleBodyContents")
        if article:
            return article.get_text(separator=" ", strip=True)

        # 일반 매체 대응 (article 태그 우선)
        article = soup.find("article")
        if article:
            return article.get_text(separator=" ", strip=True)

        # fallback: 모든 <p> 태그
        ps = soup.find_all("p")
        return " ".join(p.get_text(strip=True) for p in ps)[:3000]
    except Exception:
        return ""


def enrich_with_fulltext(df, limit=None):
    """본문을 크롤링하여 FullText 컬럼 추가"""
    df = df.copy()
    targets = df.head(limit) if limit else df
    full_texts = []
    for url in tqdm(targets["Link"], desc="본문 크롤링"):
        full_texts.append(fetch_full_text(url))
        time.sleep(0.2)
    df.loc[targets.index, "FullText"] = full_texts
    return df


if __name__ == "__main__":
    from woori_idea.docs.research.현황.뉴스.config import SEARCH_KEYWORDS, MAX_NEWS_PER_KEYWORD

    all_df = []
    for kw in SEARCH_KEYWORDS:
        print(f"\n🔍 '{kw}' 수집 중...")
        items = collect_news(kw, MAX_NEWS_PER_KEYWORD)
        df = parse_results(items)
        df["Keyword"] = kw
        all_df.append(df)
        print(f"  → {len(df)}건 수집")

    merged = pd.concat(all_df, ignore_index=True).drop_duplicates(subset=["Title"])
    print(f"\n✅ 중복 제거 후 총 {len(merged)}건")

    merged = enrich_with_fulltext(merged, limit=50)  # 테스트로 50건만
    merged.to_csv("voice_phishing_news.csv", index=False, encoding="utf-8-sig")
    print("💾 voice_phishing_news.csv 저장 완료")
