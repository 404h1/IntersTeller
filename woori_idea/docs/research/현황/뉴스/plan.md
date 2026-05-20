좋은 발견이에요! 네이버는 **"뉴스 API"라는 별도 항목을 만들지 않았고**, 대신 **"검색" API 안에 뉴스 검색 기능이 포함**되어 있습니다.

## ✅ 정답: "검색"을 선택하세요

스크린샷의 드롭다운에서 **"검색"** 을 고르시면 됩니다. 이 안에 뉴스/블로그/카페/쇼핑/책 등 모든 검색 API가 포함되어 있어요.

---

## 📝 네이버 개발자 센터 등록 단계별 가이드

### 1. Application 등록
👉 https://developers.naver.com/apps/#/register

| 항목 | 입력값 |
|------|--------|
| **애플리케이션 이름** | 예) `voice_phishing_analyzer` |
| **사용 API** | ✅ **검색** 선택 |
| **비로그인 오픈 API 서비스 환경** | ✅ **WEB 설정** 선택 |
| **웹 서비스 URL** | `http://localhost` (로컬 테스트용이면 OK) |

### 2. 등록 완료 후
- **Client ID**, **Client Secret** 발급됨
- 이 두 개를 `.env` 파일에 넣으면 끝!

```env
NAVER_CLIENT_ID=발급받은_ID
NAVER_CLIENT_SECRET=발급받은_Secret
```

---

## 🔍 "검색" API로 뉴스가 가능한 이유

네이버 검색 API는 하나의 인증으로 아래 엔드포인트를 **모두** 호출할 수 있습니다:

| 엔드포인트 | 용도 |
|------------|------|
| `/v1/search/news.json` | **📰 뉴스 검색 ← 우리가 쓸 것** |
| `/v1/search/blog.json` | 블로그 |
| `/v1/search/cafearticle.json` | 카페 |
| `/v1/search/webkr.json` | 웹문서 |
| `/v1/search/encyc.json` | 백과사전 |

즉, **"검색" API 하나만 신청하면 뉴스도 자동으로 됩니다.** 제가 드린 코드의 `news.json` URL이 그대로 동작합니다.

---

## ⚠️ 주의사항

1. **일일 호출 한도**: 25,000회/일 (충분합니다)
2. **한 번에 최대 100건**, **start는 최대 1000까지** → 키워드당 최대 1,000건 수집 가능
3. **정렬**: `sort=date`(최신순) 또는 `sort=sim`(정확도순)

---

## 🧪 빠른 동작 테스트

API 키를 받았다면 아래 코드로 1분 안에 테스트 가능합니다:

```python
import urllib.request
import urllib.parse
import json

CLIENT_ID = "여기에_본인_ID"
CLIENT_SECRET = "여기에_본인_Secret"

query = urllib.parse.quote("보이스피싱")
url = f"https://openapi.naver.com/v1/search/news.json?query={query}&display=5&sort=date"

req = urllib.request.Request(url)
req.add_header("X-Naver-Client-Id", CLIENT_ID)
req.add_header("X-Naver-Client-Secret", CLIENT_SECRET)

res = urllib.request.urlopen(req)
data = json.loads(res.read().decode("utf-8"))

for item in data["items"]:
    print("📰", item["title"].replace("<b>", "").replace("</b>", ""))
    print("   🔗", item["link"])
    print()
```

**예상 출력:**
```
📰 보이스피싱 일당 검거…20대 피해자 5천만원 가로채
   🔗 https://n.news.naver.com/...

📰 검찰 사칭 보이스피싱 주의보…
   🔗 https://...
```

---

등록 후에도 문제가 있으면 알려주세요! 혹시 **"검색" 외에 다른 데이터 소스(빅카인즈, RSS 등)** 가 더 편하실지도 같이 안내해드릴 수 있어요.