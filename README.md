# WON AI 뱅커 — 불완전판매 예방을 위한 옆자리 행원 AI

> 챗봇이 아니라, 옆에 앉아서 같이 고민해 주는 행원처럼.

**우리은행 × SSAFY AI-금융소비자보호 아이디어 경진대회 2026 출품작**
응모분야: 불완전판매 예방

---

## 🔗 데모

| | 링크 | 설명 |
|---|---|---|
| ❌ Before | [기존 앱 보기](https://404h1.github.io/Woori/before/) | AI 없는 기존 펀드 가입 플로우 |
| ✅ After  | [WON AI 뱅커 보기](https://404h1.github.io/Woori/after/) | 동적 펀드 데이터 · 음성 안내 · AI 사전 경고 |

랜딩 페이지: https://404h1.github.io/Woori/

---

## 💡 핵심 기능 한눈에

| # | 기능 | 설명 |
|---|---|---|
| 1 | **투자성향 실제 점수화** | 12문항 답변에 따라 5가지 유형(안정형~공격투자형) 자동 분류. 강제 룰(원금보존 절대 → 안정형 등)도 반영 |
| 2 | **펀드별 개별 상세** | 5개 펀드(미래에셋 코어테크 / 삼성 글로벌 반도체 / 한국투자 테크 / 우리삼성그룹 / 한화 그린히어로) 각각 PROS·CONS·FIT·맞춤 추천금액 데이터 |
| 3 | **마이데이터 기반 맞춤 조언** | 월 여유자금·비상금·추천 투자금을 시각화. "마이데이터 연동" 라벨로 출처 명시 |
| 4 | **AI 사전 경고 다이얼로그** | 가입 직전 3개 경고를 채팅 대화로 던짐 — 유동성·변동성 시뮬레이션·집중도. 하나라도 "다시 생각" 누르면 가입 취소 |
| 5 | **상세한 상품설명서 9섹션** | 기본정보 / 수수료 / 손실 시나리오 / 환매 / 숙려·청약철회 / 위법계약해지권 / 분쟁조정 / 부적합 안내 |
| 6 | **음성 안내 (mp3 + TTS)** | 한국 여성 화자(sohee) Qwen3-TTS 합성. 단어별 하이라이트 + 정지 버튼 |
| 7 | **음성 질문** | 마이크로 "비교", "가입" 같은 명령 입력 가능 (Web Speech Recognition) |
| 8 | **직접 터치 보호** | 약관·설명서·해피콜은 사용자가 끝까지 스크롤하고 직접 답해야만 진행 |

---

## 🗂 프로젝트 구조

```
Woori/
├── woori-app/            ← Before (AI 없는 기존 펀드 가입 플로우)
├── woori_app_ai/         ← After (WON AI 뱅커)
│   ├── src/
│   │   ├── App.jsx              ← 페이지 전환 + 전역 state
│   │   ├── pages/
│   │   │   ├── Page00_Home.jsx
│   │   │   ├── Page00b_AIChat.jsx
│   │   │   ├── Page01_InvestorInfo.jsx     ← 12문항 설문 + 점수 계산
│   │   │   ├── Page02_InvestmentResult.jsx ← 동적 투자성향 결과
│   │   │   ├── Page03_FundList.jsx         ← 펀드 목록 (5종)
│   │   │   ├── Page03b_FundDetail.jsx      ← 펀드별 상세 (동적)
│   │   │   ├── Page03c_FundAI.jsx          ← AI 펀드 설명 (동적)
│   │   │   ├── Page04_FundCompare.jsx      ← 2펀드 비교 (동적)
│   │   │   ├── Page05_InvestorCheck.jsx
│   │   │   ├── Page06_FundJoin.jsx         ← 가입 금액 + 최종 점검 카드 + AI 경고 트리거
│   │   │   ├── Page07_Document.jsx         ← 상품설명서 (9섹션)
│   │   │   └── Page08_HappyCall.jsx        ← 해피콜 (선택 펀드 동적)
│   │   ├── components/
│   │   │   ├── VoiceGuide.jsx              ← 하단 음성 가이드 (재생/정지/질문)
│   │   │   ├── AIWarningDialog.jsx         ← 가입 직전 AI 사전 경고 모달
│   │   │   ├── ConsultSheet.jsx
│   │   │   └── StatusBar.jsx
│   │   ├── context/
│   │   │   └── VoiceContext.jsx            ← mp3 우선, Web Speech API fallback
│   │   └── data/
│   │       ├── funds.js                    ← 5개 펀드 데이터
│   │       └── investorScore.js            ← 12문항 점수화 + 5유형 분류
│   ├── public/audio/                       ← Qwen3-TTS 생성 mp3 7개
│   └── vite.config.js                      ← docs/after 로 빌드
├── tts/                  ← Qwen3-TTS 합성 파이프라인 (Python)
│   ├── generate_app_voice.py   ← CustomVoice 모델 + sohee 화자로 7개 mp3 생성
│   ├── clone_for_app.py        ← 클로닝 모드 (참고용)
│   └── 준엽_목소리.m4a          ← 초기 reference (현재 미사용)
├── idea/                 ← 경쟁 아이디어 문서 (HanMadi, Woori Advocate)
├── docs/                 ← GitHub Pages 배포 빌드
└── intervention_psychology.md  ← 행동경제학 논문 정리 (30개)
```

---

## 🛠 기술 스택

| 영역 | 기술 |
|---|---|
| Frontend | React 19 + Vite 8 |
| 음성 합성 | **Qwen3-TTS 12Hz 1.7B CustomVoice** (preset 화자 `sohee`) |
| 음성 fallback | Web Speech API (`SpeechSynthesisUtterance`) |
| 음성 인식 | Web Speech API (`SpeechRecognition`) |
| 빌드/배포 | GitHub Pages (`docs/after`) |
| 자산 분석 라벨 | "마이데이터 연동" 표시 (실데이터 연동은 추후 우리은행 인프라 활용) |

---

## 📝 이번 세션 작업 일지

### 1단계 — 코드 베이스 파악
프로젝트 전체 파일을 읽어 구조와 의도를 정리. `idea/` 안에 3가지 경쟁 아이디어(내 편인 AI / 한마디 / Woori Advocate)가 공존함을 발견. 데모는 "내 편인 AI" 방향으로 진행 중.

### 2단계 — 명백한 버그 수정
- Page00b의 **"AI청약상담원과 상담하기" 버튼이 클릭되지 않던 문제** — `onClick` 핸들러 누락. 와이어업.
- Page03 펀드 목록에서 **3번 펀드만 상세로 갈 수 있던 문제** — 모든 카드를 클릭 가능하게 변경.

### 3단계 — TTS 톤 전면 재작성
기존 안내가 "아니요만 누르면 돼요", "10만원 버튼 누르세요" 식의 **답 지시형**이라 불완전판매 예방 취지와 정면 충돌했음. 7개 SCRIPT 전체를 "**의미·맥락만 설명, 답은 고객이 직접**" 톤으로 재작성:
- Page02 결과 / Page03 목록 / Page03c AI 설명 / Page05 투자자 확인 / Page06 가입 / Page07 설명서 / Page08 해피콜

### 4단계 — Page06 시각화 카드 추가
가입금액 입력 화면 위에 **"가입 전 최종 점검"** 카드 신설:
- 펀드 요약 (이름·위험등급·3개월 수익률)
- 자산 vs 투자금 시각화 (월 여유자금 중 비상금·투자 비율 막대 그래프)
- 장단점 3줄 요약 (✅장점 + ⚠️주의)

### 5단계 — TTS 인프라 구축 (Qwen3-TTS)
- **VoiceContext 리팩토링** — mp3 우선 재생, 실패 시 Web Speech API로 자동 fallback. 사전 `fetch HEAD`로 mp3 존재 체크, double-fire 방지, autoplay block 처리.
- **VoiceGuide에 ⏹ 정지 버튼** 추가 — 재생 중일 때만 빨간색 정지로 전환.
- **Qwen3-TTS 파이프라인** — `tts/generate_app_voice.py`로 7개 페이지 mp3 자동 생성·변환·앱 폴더 복사.

### 6단계 — 음성 모델 시행착오
- 1차: `준엽_목소리.m4a` 클로닝 → 작동했지만 톤이 데모용으로 부적절(숙취 청년 목소리).
- 2차: Cherry/Ethan 같은 preset 보이스 시도 → **`Qwen3-TTS-1.7B-Base`는 preset 화자 리스트가 비어 있음** 확인. `generate_voice_design`도 미지원.
- 3차: 다른 모델 변종 탐색 → **`Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice`** 가 preset 9명 (`sohee`, `serena`, `vivian` 등) 제공함을 발견.
- 4차: `sohee` (한국 여성 화자) 선택 — 한국어 발음 품질 최적. 7개 mp3 재생성 완료.

### 7단계 — 펀드 데이터 분리 & 동적 라우팅
하드코딩되어 있던 "삼성 글로벌 반도체" 한 펀드의 데이터를 `src/data/funds.js`로 분리하고 **5개 펀드** 각자 고유 데이터로 확장:
- 미래에셋 코어테크 / 삼성 글로벌 반도체 / 한국투자 테크 / 우리삼성그룹 / 한화 그린히어로
- 각 펀드별 PROS·CONS·FIT·Top5 종목·맞춤 추천금액·맞춤 메시지·CTA 라벨

App.jsx에 `selectedFundId`, `compareFundIds`, `investorType` 전역 state 추가. Page03 → Page03b/Page03c/Page06/Page08 로 fund id 전달, Page04 비교는 사용자가 선택한 2개 id 전달.

### 8단계 — 투자성향 실제 점수 계산
기존엔 무조건 "공격투자형"으로 나오던 문제 해결.
- `src/data/investorScore.js` 신설 — 12개 질문 각 옵션 점수 매핑 + 강제 룰 5종 + 캡 1종.
- Page01에서 `answers` state로 옵션 인덱스 추적 → 완료 시 `calculateInvestorType()` 호출 → Page02에 결과 전달.
- Page02는 유형별로 색상·강조 막대·설명 텍스트 모두 동적 변경.

### 9단계 — AI 사전 경고 다이얼로그 (불완전판매 예방의 핵심)
`src/components/AIWarningDialog.jsx` 신규.
- Page06 최종 "가입하기" 클릭 시 **풀스크린 채팅 모달** 등장.
- WON AI 뱅커가 사용자 자산·펀드 데이터·입력 금액 기반으로 **3개 경고를 순차적으로** 던짐:
  1. **유동성 경고** — 비상금 부족, 환매 지연, 수수료 발생
  2. **변동성 시뮬레이션** — 과거 최악 사례(-34%) 적용 시 손실 금액 구체 표시
  3. **집중도 경고** — 월 여유자금 대비 비중 + 분산 추천
- 각 경고마다 **"다시 생각해볼게요"** / **"네, 그래도 진행할게요"** 선택.
- 하나라도 "다시 생각" 누르면 가입 취소 → 펀드 목록으로 돌아감.
- 3개 모두 confirm 해야 다음 단계 진행.

### 10단계 — 설명서 보강 (Page07)
4문단짜리 빈약한 설명서를 **9개 섹션 구조**로 확장:
1. 상품 기본 정보 / 2. 수수료 및 보수 / 3. 원금 손실 가능성 (4단계 시나리오) / 4. 환매 절차 / 5. 숙려·청약철회 / 6. 위법계약해지권 / 7. 분쟁조정 / 8. 부적합 안내 / 9. 마지막 확인.
- "끝까지 스크롤해야 확인 버튼 활성화" 기믹이 실제로 작동하는 분량.
- 우측 하단 "↓ 끝까지 읽으세요" 플로팅 힌트 추가.

### 11단계 — 명칭 통일 & 마이데이터 라벨
- 앱 안에 흩어져 있던 "내 편인 AI" / "AI챗봇" / "AI청약상담원" 4개 명칭을 **"WON AI 뱅커"** 로 통일.
- Page03c 맞춤 조언 카드 + Page06 자산 시각화에 **"마이데이터 연동 · 최근 6개월 거래 내역 기반 분석"** 라벨 추가 — 개인화 데이터 출처를 명시.
- 출금가능금액을 10,001원 → 300,001원으로 현실화 (시각화 비율과 정합성).

### 12단계 — 빌드/배포 자동화
- `woori_app_ai/vite.config.js`에 `build.outDir`을 `../docs/after`로 설정. 이제 `npm run build` 한 번에 `docs/after`로 자동 출력.

### 13단계 — Git 정리 및 push
- `.gitignore`에 TTS 생성물(wav, app_outputs/) 제외 추가.
- `sangyong` 브랜치로 commit 2개:
  - `25ee19f` "Add WON AI 뱅커: dynamic funds, investor scoring, AI warning dialog, voice TTS"
  - `6f5b838` "Switch TTS to CustomVoice model with sohee (Korean female) speaker"
- 원격 https://github.com/404h1/Woori/tree/sangyong 에 push 완료.

---

## 💭 배운 점

### 1. 데모와 컨셉의 정합성이 가장 중요하다
초기 안내 톤이 "예만 누르면 돼요" 식 답 지시형이라, **데모 자체가 불완전판매를 부추기는 모순**이 있었음. 컨셉이 아무리 좋아도 데모가 컨셉을 배신하면 무의미함. 톤·UX·문구 하나하나가 컨셉을 입증해야 함.

### 2. "AI가 권유"가 아니라 "AI가 경고"가 더 강력하다
처음엔 이해도 퀴즈를 생각했지만, 사용자 의견을 듣고 **"너 진짜 이거 할거냐?" 식 경고 톤**으로 전환. 행동경제학 관점에서도 마찰(friction)·자기설명(self-explanation)·인지부조화(hypocrisy induction)가 단순 정보 제공보다 효과적이라는 근거가 있음(Aronson 1991; Chi 1989; Egelman 2008 등).

### 3. 가짜 개인화는 즉시 들통난다
"월 여유자금 30만원" 같은 숫자를 어디서도 묻지 않고 보여주는 건 심사위원 첫 질문감. 실제 우리은행에선 마이데이터 연동으로 분석 가능하지만, **데모에는 출처 라벨이라도 명시**해야 신뢰감이 생김.

### 4. Qwen3-TTS의 모델 변종을 정확히 알아야 한다
하나의 모델로 끝나는 게 아니라:
- `Base` — 클로닝 전용
- `CustomVoice` — preset 화자 (`sohee`, `serena` 등)
- `VoiceDesign` — 자연어로 보이스 묘사
- `0.6B` vs `1.7B` 크기 옵션

각 변종이 다른 API 메서드를 노출하기 때문에 모델 선택이 곧 기능 선택임. 또 supported speaker 이름은 **정확한 대소문자**(소문자 'sohee')로 매칭됨.

### 5. 작은 디테일이 신뢰를 만든다
- 명칭 일관성 4종 → 1종
- 출금가능금액과 시각화 숫자의 정합성
- 음성 재생 중 ⏹ 정지 버튼 (사용자 통제권)
- 끝까지 스크롤 강제 + 그에 걸맞은 실제 콘텐츠 분량

이런 사소한 정합성·통제권이 모이면 "이 팀이 진지하다"는 인상.

### 6. 상태 들어 올리기(lifting state up)는 데모에서도 필수
하드코딩 1펀드 → 5펀드 동적으로 갈 때, 각 페이지가 독립적으로 펀드를 알면 안 됨. App.jsx가 `selectedFundId`를 들고 prop으로 내려야 일관성 유지됨. 데모도 결국 소프트웨어니까.

### 7. 음성 자동재생은 환경마다 다르게 막힌다
브라우저 autoplay policy 때문에 mp3 `.play()`가 거부될 수 있음. `play().catch()` + `audio.onerror` 둘 다 fire 가능 → **double-fire 방지 플래그** 필요. 또 mp3 404 가능성도 항상 사전 `fetch HEAD`로 체크하는 게 안전.

---

## ⚠️ 아직 개선해야 할 점

### 발표 직전 우선순위

| 순위 | 항목 | 비고 |
|---|---|---|
| 1 | **데모 vs 아이디어 정합성 재검토** | 레포에 한마디(취약계층) / Woori Advocate(좌우 분할 대립 AI) 등 더 강한 컨셉이 같이 있음. 현재 데모(WON AI 뱅커)가 1등 콘셉트인지 자문 필요 |
| 2 | **#12 Before/After 라벨** | 같은 페이지에 Before("여기서 사용자 막막함") vs After("AI가 어떻게 해결") 캡션 — 아직 미구현 |
| 3 | **시연 스크립트** | 12문항 설문은 시연에 길음. 어떤 답을 미리 선택할지, 어떤 펀드를 클릭할지 시나리오 확정 필요 |
| 4 | **TTS 발음 추가 튜닝** | `sohee` 결과를 실제 들어보고 부자연스러운 부분 있으면 `serena` / `vivian` 비교 |

### 추가 개선 여지

- **Page08 해피콜 단조로움** — 8문항 모두 예/아니요라 클릭만 하면 끝. 한두 개에 "방금 가입한 상품의 위험을 본인 말로 한 줄 작성" 같은 텍스트 입력 강제 필요 (Comprehension Verification).
- **AIWarningDialog 톤 검증** — 너무 강압적이지는 않은지, 진짜 사용자 입장에서 들어보고 다듬기.
- **단어 하이라이트 정확도** — 현재 `duration / wordCount`로 균등 분할. 단어마다 길이가 달라서 음성과 ±1단어 어긋날 수 있음. Qwen3-TTS의 timestamp 출력을 활용하거나 forced alignment 라이브러리 도입 검토.
- **마이데이터 연동 실제 구현 흐름** — 라벨만 추가했지 실제 마이데이터 권한 동의 화면은 없음. PT에서 "이건 시연용이고 실제론 동의 받아 분석합니다"를 명확히.
- **다양한 시나리오 데이터** — 5개 펀드는 추가했지만, 모두 "이혜원 고객님" 한 페르소나. 다른 성향(예: 안정형, 60대)을 한 번에 보여주는 사례 추가하면 임팩트 ↑.
- **글로벌 배포 자동화** — `npm run build` 후 `docs/after`에 자동 출력은 되지만, `git add docs/ && commit && push`까지 가는 스크립트는 없음. 마지막 push 전에 빌드본 갱신 잊기 쉬움.
- **README 자체** — 이 문서가 결국 첫인상. PT 자료에 들어갈 다이어그램·스크린샷이 README에도 있으면 좋음.

---

## 🚀 실행 방법

### 개발 서버 (변경 즉시 반영)
```powershell
cd woori_app_ai
npm install
npm run dev
```
→ `http://localhost:5173` 에서 확인.

### 배포 빌드 (GitHub Pages용)
```powershell
cd woori_app_ai
npm run build       # docs/after 로 자동 출력
git add ../docs/after
git commit -m "Update docs/after build"
git push
```

### TTS mp3 재생성 (Qwen3-TTS + GPU 권장)
```powershell
cd tts
python generate_app_voice.py
```
→ `sohee` 화자로 7개 mp3 생성 → `woori_app_ai/public/audio/` 자동 복사.
필요 패키지: `torch` (CUDA), `qwen_tts`, `soundfile`, `imageio-ffmpeg`.

mp3가 없거나 로딩 실패 시 앱은 자동으로 Web Speech API TTS로 fallback 됩니다.

---

## 📜 라이선스 / 참고

- 행동경제학·심리학 근거: `intervention_psychology.md` (Kahneman, Thaler, Madrian 등 30개 논문)
- 경쟁 아이디어 문서: `idea/HanMadi/` (시니어 SOS), `idea/woori-advocate-demo/` (좌우 분할 대립 AI)
- 보이스피싱 통계·뉴스 분석 파이프라인: `docs/research/`

---

**팀 — SSAFY · 우리은행 해커톤 2026**
