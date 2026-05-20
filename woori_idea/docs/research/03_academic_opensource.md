# 학술·오픈소스 기술 동향 (2026.05 기준)

> 우리은행 SSAFY AI 금융소비자보호 아이디어 경진대회 사전조사 보고서
> 작성일: 2026-05-20
> 조사 범위: arXiv, GitHub, Papers with Code(2025.07 종료), Google Scholar, DBpia, 컨퍼런스(AAAI 2026 / KDD 2026 / NeurIPS 2025 / ICML 2025)

---

## 개요

본 보고서는 금융사기 탐지(FDS), 자금세탁방지(AML), 보이스피싱 탐지 분야의 학계·오픈소스 커뮤니티 최신 동향을 정리한다. 핵심 흐름은 다음 네 가지로 요약된다.

1. **그래프 신경망(GNN)의 산업 표준화**: AML/FDS 양 영역에서 GNN이 사실상 SOTA(state-of-the-art)로 자리잡았다. 특히 multi-view, line-graph, hypergraph 기반 변형이 2025–2026 사이 주류를 이뤘다.
2. **LLM의 양면성**: LLM은 의심거래보고서(SAR/STR) 자동 작성, 실시간 통화 분석 같은 방어 도구로도, GPT-4o 기반 보이스피싱 스크립트 생성 같은 공격 도구로도 동시에 발전 중이다 (arXiv 2507.16291).
3. **한국어 특화 데이터셋 부족**: KorCCViD(2,927개 통화) 한 개가 사실상 유일한 공개 한국어 보이스피싱 데이터셋이다. 한국어 금융사기 LLM 학습 자원은 여전히 빈약하다.
4. **XAI 의무화**: 금융권 규제(EU AI Act, 한국 금융 AI 가이드라인 등) 영향으로 SHAP/LIME에서 LLM 기반 자연어 설명으로 진화 중이다.

---

## 1. 보이스피싱·음성 사기 탐지

### 1-1. 딥보이스 탐지 SOTA

**핵심 아키텍처 계보**: RawNet2 → AASIST(2021) → AASIST2(2023) → Scalable AASIST(2025)

| 모델 | 발표 | arXiv | 특징 |
|---|---|---|---|
| AASIST | INTERSPEECH 2022 | https://arxiv.org/abs/2110.01200 | RawNet2 인코더 + spectro-temporal graph attention. 최초로 raw waveform과 graph attention을 결합. |
| AASIST2 | 2023 | https://arxiv.org/abs/2309.08279 | Res2Net 블록, 동적 청크 크기로 짧은 발화(short utterance) 강화. |
| Scalable AASIST | 2025-07 | https://arxiv.org/abs/2507.11777 | Graph attention 레이어 경량화, on-device 배포 가능 수준 파라미터 감축. |
| "It's All in the Presentation" | 2025-09 | https://arxiv.org/abs/2509.26471 | 실험실 EER이 좋아도 실제 전화 채널(코덱·노이즈) 통과 시 성능 폭락 문제 지적. 채널 시뮬레이션 데이터 증강으로 실환경 벤치마크 +57%. |
| Non-Semantic Representations | 2025-09 | https://arxiv.org/abs/2509.00186 | TRILL/YAMNet 같은 음향 임베딩이 의미적 특징보다 일반화 우수. |

**시사점**: 단순 AASIST 그대로 갖다 쓰면 한국 통신망(SK/KT/LGU+) PCM 코덱과 잡음에서 정확도가 30–50% 떨어질 가능성 큼. 채널 증강(codec augmentation)이 PoC 필수.

### 1-2. 한국어 통화 LLM 분류 (KorCCViD 기반)

**데이터셋**: **KorCCViD (Korean Call Content Vishing Dataset)**
- GitHub: https://github.com/selfcontrol7/Korean_Voice_Phishing_Detection
- 구성: 보이스피싱 통화 전사 695건 + 정상 통화 2,232건 = 총 2,927개 entry
- 주제: 여행, 음식, 영화, 반려동물 등 일상 통화와 검찰·금감원 사칭, 대출 사기, 가족 사칭 등 vishing
- 폴더: `ML_Models`, `DL_Models`, `Language_Models`, `Hybrid_Models`, `Federated_Learning` 별로 구현체 포함

**파생 데이터셋**: https://github.com/Ez-Sy01/KOR_phishing_Detect-Dataset — 한국어 피싱 메시지 분류, 극단적 클래스 불균형 대응(BDA 사용).

**주요 한국어 모델 논문**:
- **Attention-Based 1D CNN-BiLSTM + FastText** (Mathematics 2023, https://www.mdpi.com/2227-7390/11/14/3217) — 비-LLM 시절 KorCCViD SOTA, F1 0.97대.
- **"Detecting Voice Phishing with Precision: Fine-Tuning Small Language Models"** (arXiv 2025-06, https://arxiv.org/abs/2506.06180) — Llama-3-Korean-Bllossom-8B 파인튜닝, 적은 데이터로도 99% F1 보고.
- **"Enhanced Voice Phishing Detection Using an LLM-Based Framework for Data Augmentation and Classification"** (ResearchGate 2025) — LLM으로 합성 통화 생성 → 분류기 데이터 증강.
- **Multimodal KoBERT + CNN-BiLSTM** (Applied Sciences 2025, https://www.mdpi.com/2076-3417/15/20/11170) — 텍스트는 KoBERT self-attention, 오디오는 MFCC+CNN-BiLSTM, late fusion.

### 1-3. LLM 적대적 공격 (방어 모델의 약점)

- **"Talking Like a Phisher: LLM-Based Attacks on Voice Phishing Classifiers"** (arXiv 2507.16291, https://arxiv.org/abs/2507.16291)
  - KorCCViD로 학습된 ML 분류기들에 GPT-4o로 생성한 피싱 스크립트 테스트
  - **분류기 정확도 최대 30.96% 하락**, 의미적 유사도는 유지
  - 의미: 현재 학계 SOTA 분류기도 LLM 생성 신종 시나리오엔 무력
- **"ScamAgents: How AI Agents Can Simulate Human-Level Scam Calls"** (arXiv 2508.06457, CAMLIS'25) — 멀티턴 사기 전화 자동 시뮬레이션 에이전트.
- **"SoK: LLM-Generated Textual Phishing Campaigns"** (arXiv 2508.21457) — LLM 피싱 생성·탐지 전반 서베이.

### 1-4. 온디바이스 / 실시간 음성 분석

- **"Exploring LLM-based Real-time Detection of Phone Scams"** (arXiv 2502.03964, https://arxiv.org/abs/2502.03964) — ASR + LLM으로 통화 중 실시간 사기 의심 점수 출력. 학부생 PoC가 가장 베끼기 쉬운 구조.
- **MASK: Modular Adaptive Sanitization Kit** (arXiv 2510.18493, https://arxiv.org/abs/2510.18493) — 통화 전사를 LLM에 보내기 전 개인정보 마스킹. 사용자별 프라이버시 강도 조절 가능. **금융권 컴플라이언스 핵심 키워드**.
- **"Privacy Preserving Real-time Scam Detection and Conversational Scambaiting"** (arXiv 2509.05362) — 실시간 탐지 + 챗봇으로 사기범 시간 끌기.

---

## 2. FDS / 이상거래탐지

### 2-1. 그래프 신경망(GNN) — 사실상 표준

**필독 큐레이션 리포**:
- **safe-graph/graph-fraud-detection-papers**: https://github.com/safe-graph/graph-fraud-detection-papers
  - 2025년 추가 논문: Global Attribute-Association Pattern Aggregation (AAAI 2025), Federated Graph Anomaly Detection (TheWebConf 2025), SmoothGNN (TheWebConf 2025), Cluster Aware GAD (TheWebConf 2025)
  - 자체 RAG 챗봇 250편 논문 검색 제공
- **AI4Risk/awesome-graph-based-fraud-detection**: https://github.com/AI4Risk/awesome-graph-based-fraud-detection — Frontiers of Computer Science 2024 survey 공식 코드
- **AI4Risk/antifraud**: https://github.com/AI4Risk/antifraud — MCNN(2016), STAN(AAAI 2020), STAGN(TKDE 2020), GTAN(AAAI 2023), **RGTAN(TKDE 2025)**, HOGRL(IJCAI 2024) 구현체 모두 포함. **PoC 베이스라인으로 가장 추천**.
- **safe-graph/DGFraud-TF2**: https://github.com/safe-graph/DGFraud-TF2 — TF2 기반 GNN 사기 탐지 툴박스
- **benedekrozemberczki/awesome-fraud-detection-papers**: https://github.com/benedekrozemberczki/awesome-fraud-detection-papers — 클래식 데이터마이닝 정리

**2025–2026 핵심 모델**:
| 모델 | 발표 | URL | 메모 |
|---|---|---|---|
| LineMVGNN | AI 2025 | https://www.mdpi.com/2673-2688/6/4/69 | Line graph + Multi-view, 송금·수금 양방향 메시지 패싱. AML에 직접 적용. |
| RGTAN | TKDE 2025 | AI4Risk/antifraud | Relation-aware Graph Transformer, 신용카드 사기. |
| Layer-Weighted GCN | Springer 2025 | https://link.springer.com/article/10.1007/s44230-025-00097-3 | 거래 네트워크 패턴별 레이어 가중. |
| Hypergraph contrastive | PMC12690648 (2025) | https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12690648 | 하이퍼그래프로 다자거래 관계 표현. |
| DGP (Dual-Granularity Prompting) | AAAI 2026 | safe-graph 큐레이션 | Graph-enhanced LLM 프롬프트로 사기 탐지. |
| Multi-View Hypergraph + LLM Contrastive | AAAI 2026 | safe-graph 큐레이션 | 경계 사기범(borderline) 타게팅. |

**산업 통계 (참고)**: Gartner 2025 — graph + ML 하이브리드가 단일 ML 대비 검출률 +35%. Visa 2025 — graph 기반 시스템이 미발견 mule account +26% 식별.

### 2-2. 시계열 Self-supervised / Transformer

| 모델 | 발표 | URL | 메모 |
|---|---|---|---|
| Anomaly Transformer | ICLR 2022 | https://arxiv.org/abs/2110.02642 | Association discrepancy. 여전히 비교군. |
| AnomalyBERT | 2023, IEEE 2024 | https://arxiv.org/abs/2305.04468 | Self-supervised, 4종 합성 outlier로 BERT-style 사전학습. |
| SSL TSAD Survey 2025 | arXiv 2501.15196 | https://arxiv.org/html/2501.15196v1 | self-supervised 시계열 이상탐지 최신 서베이. |
| MAAT | 2024-2025 | (Multi-scale Anomaly Attention Transformer) | 다중 스케일 시계열 fraud. |

### 2-3. 대규모 거래 사전학습 / 기타

- **"Big Data-Driven Fraud Detection Using Machine Learning and Real-Time Stream Processing"** (arXiv 2506.02008) — Kafka+Flink+ML 실시간 파이프라인.
- **Customer Level Fraud Benchmark** (arXiv 2404.14746) — 고객 단위 벤치마크.
- Papers with Code Amazon-Fraud 리더보드: **LEX-GNN** SOTA. BAF Base: **LightGBM** (단순 모델이 여전히 강함을 시사). 단, Papers with Code는 2025-07 Meta가 서비스 종료, 현재는 Hugging Face/CodeSOTA(https://www.codesota.com/papers-with-code)로 이전.

---

## 3. AML / 자금세탁

### 3-1. GNN + AML

- **LineMVGNN** (위 표 참고) — 송금·수금 이중 그래프, AML 특화.
- **Bitcoin Wavelet-Temporal Graph Transformer** (Nature Sci Rep 2025-2026, https://www.nature.com/articles/s41598-025-23901-3) — "ChronoWave-GNN", wavelet + temporal GT로 비트코인 illicit tx 탐지.
- **ETHIAD** (PMC12698024) — Ethereum illicit account 탐지, XAI 지원.
- **"Exploring In-Context Learning of LLMs for Money Laundering Detection in Financial Graphs"** (arXiv 2507.14785, Vanguard) — 그래프 → 텍스트 직렬화 → LLM few-shot.

### 3-2. LLM 기반 STR/SAR 자동 작성

- **Co-Investigator AI** (arXiv 2509.08380, https://arxiv.org/abs/2509.08380) — 에이전트 프레임워크로 규제 준수 SAR 작성. LLM 환각·범죄 유형 미스매치 문제 해결 시도.
- **AMLNet** (arXiv 2509.11595, https://arxiv.org/abs/2509.11595) — 멀티에이전트로 합성 AML 거래 생성 + 탐지. 데이터셋 부족 우회.
- **RiskTagger** (arXiv 2510.17848) — Web3 크립토 자금세탁 자동 라벨링 에이전트.
- **"AI Application in AML for Sustainable Financial Systems"** (arXiv 2512.06240) — RAG 기반 SAR 초안 작성 + 설명가능 레이어.

### 3-3. 연합학습 기반 은행간 AML

- **"The Role of Federated Learning in Improving Financial Security: A Survey"** (arXiv 2510.14991) — FL × 금융보안 서베이.
- **FedNovaAML** (ACM MLSC 2025, https://dl.acm.org/doi/10.1145/3778450.3778532) — 다국가 법규 NLP 정렬 + 시간 이종 그래프 + FedNova-Adaptive 정규화.
- **DPxFin** (arXiv 2603.19314) — 평판 가중 FL + differential privacy AML.
- **"AML ML Pipelines: Technical Analysis on Identifying High-risk Bank Clients"** (arXiv 2509.09127).
- **"AML Systems Using Deep Learning"** (arXiv 2509.19359).

**성능 보고**: 연합 AML이 단독 학습 대비 의심거래 탐지 정확도 +30%.

---

## 4. 멀티모달 사기 탐지

- **Multimodal Voice Phishing (Text+Audio)** (Applied Sciences 2025) — KoBERT + MFCC+CNN-BiLSTM. **한국어 학부생 PoC에 가장 직접적인 레퍼런스**.
- **Multimodal DeepFake Detection via Audio-Visual Feature Fusion and Temporal Attention** (2025).
- **SVC 2025 Multimodal Deception Detection Challenge** (arXiv 2508.04129) — 음성+영상+텍스트 거짓 탐지 첫 챌린지.
- **"Beyond Metadata: Multimodal Policy-Aware Detection of YouTube Scam Videos"** (arXiv 2509.23418).
- **MASK** (arXiv 2510.18493) — privacy-preserving 멀티모달 sanitization.

**빈틈**: "음성 + 모바일뱅킹 화면 + 거래 시도"를 동시에 보는 멀티모달 모델은 학계 논문이 거의 없음. 우리은행 PoC 차별화 포인트.

---

## 5. XAI (설명가능 AI)

### 5-1. 전통적 XAI 금융 적용

- **"Financial Fraud Detection Using Explainable AI and Stacking Ensemble"** (arXiv 2505.10050, https://arxiv.org/abs/2505.10050) — XGBoost+LightGBM+CatBoost 스태킹, SHAP 피처선택 + LIME 설명, IEEE-CIS 590k 거래, AUC 0.99.
- **"Explainable AI in Big Data Fraud Detection"** (arXiv 2512.16037) — LIME/SHAP/counterfactual/attention 서베이, 그래프·시계열 모델의 설명 부족 지적.
- **CFA Institute "Explainable AI in Finance"** (2025) — 이해관계자별 설명 차별화 가이드라인.

### 5-2. LLM 기반 설명 생성

- HSBC, American Express 같은 글로벌 은행이 LLM으로 SHAP 값 → 자연어 변환 사례를 KDD/FinTech 워크숍에서 발표 중.
- Co-Investigator AI(위)가 대표적: 규제 보고서 자체가 설명문 역할.

### 5-3. AAAI 2026 / KDD 2026 채택 논문 (사기·XAI 관련)

- **AAAI 2026** "DGP: A Dual-Granularity Prompting Framework for Fraud Detection with Graph-Enhanced LLMs"
- **AAAI 2026** "Targeting Borderline Fraudsters: Multi-View Hypergraph Fraud Detection with LLM-Guided Contrastive Learning"
- **KDD 2026 AI-FA 워크숍** "AI for Fraud and Abuse" (https://sites.google.com/view/kdd-fraud-abuse-2026/home) — 은행, 핀테크, 암호화폐, 이커머스 전 도메인.

---

## 6. 한국어 데이터셋·모델

### 6-1. 데이터셋

| 데이터셋 | 규모 | 링크 | 비고 |
|---|---|---|---|
| KorCCViD | 2,927 통화 | https://github.com/selfcontrol7/Korean_Voice_Phishing_Detection | 사실상 표준. IEEE DataPort에 SMOTE 증강 버전도 존재. |
| KOR_phishing_Detect-Dataset | 피싱 메시지(SMS/카톡) | https://github.com/Ez-Sy01/KOR_phishing_Detect-Dataset | BDA로 클래스 불균형 처리. |
| AI Hub "보이스피싱 음성 데이터" | 수만 건(비공개 일부) | aihub.or.kr | 신청 승인 필요. |
| 금융보안원 FDS 합성 데이터 | 비공개 | — | 산업 협력 필요. |

### 6-2. 한국어 모델

- **KoBERT** (SKTBrain, https://github.com/SKTBrain/KoBERT) — 가장 보편적 한국어 BERT.
- **KLUE-BERT / KLUE-RoBERTa** (https://github.com/KLUE-benchmark/KLUE) — 8개 한국어 NLU 태스크 벤치마크.
- **KB-ALBERT** (https://github.com/sackoh/pycon-korea-2020-kb-albert) — KB금융 금융 도메인 사전학습. **금융 도메인 한국어 모델로 거의 유일한 공개판**.
- **Llama-3-Korean-Bllossom-8B** — 2025년 보이스피싱 분류 SOTA 베이스 (arXiv 2506.06180).
- **KoGPT (Kakao)**, **Polyglot-Ko**, **EXAONE 3.5** (LG AI Research) — 한국어 LLM 옵션.
- **HyperCLOVA X** (NAVER) — API only, 비공개.

### 6-3. 한국어 금융 특화 모델 — 빈틈

- KoFinBERT, KoFinGPT 같은 공개 금융 한국어 모델은 **존재하지 않음**. 산업 차별화 기회.

---

## 7. 컨퍼런스 트렌드

### AAAI 2026 (2026.02)
- Graph-enhanced LLM + fraud detection 두드러짐 (DGP, Multi-View Hypergraph)
- "Borderline fraudster" 같은 hard sample 마이닝이 키워드

### KDD 2026 (2026.08)
- **AI-FA 워크숍 (AI for Fraud and Abuse)** 신설: https://sites.google.com/view/kdd-fraud-abuse-2026/home
- 산업계(Visa, PayPal, Alipay) 참여 활발

### NeurIPS 2025 (2025.12)
- "Federated Graph Anomaly Detection via Disentangled Representation Learning"
- Time-series Self-Supervised Learning Survey (arXiv 2501.15196)

### ICML 2025
- Mechanistic Interpretability 워크숍 — XAI 일반론, 금융 직접 적용은 적음

### 기타
- **CAMLIS'25** (Conference on Applied Machine Learning for Information Security) — ScamAgents 같은 산업 실전 논문
- **TheWebConf 2025** — Federated GAD, Cluster Aware GAD, SmoothGNN 등 GNN fraud 다수

---

## 종합 — 기술 성숙도 등급표

| 분야 | 학계 성숙도 | 오픈소스 성숙도 | 한국어/국내 자원 | 종합 |
|---|---|---|---|---|
| 딥보이스(TTS) 탐지 | A (AASIST 계보 확립) | A (RawNet/AASIST 코드 공개) | C (한국어 보이스 데이터 부족) | B |
| 보이스피싱 텍스트 분류 | A (LLM 파인튜닝 99% F1) | A (KorCCViD 공개) | B (KorCCViD 한 개 의존) | A- |
| 그래프 FDS | A+ (산업 표준) | A+ (DGFraud, antifraud) | C (한국 거래 그래프 비공개) | B+ |
| 시계열 이상탐지 | A (Transformer 계보) | A (AnomalyBERT 등) | B (KB-ALBERT 외 부재) | B+ |
| GNN AML | A (LineMVGNN, ChronoWave) | B+ | D (한국 다은행 협력 사례 거의 없음) | B |
| LLM 기반 STR 자동작성 | B+ (Co-Investigator AI 등) | C (대부분 비공개) | D | C+ |
| 연합학습 AML | B (FedNovaAML) | C | D | C |
| 멀티모달(음성+거래+화면) | C (논문 거의 없음) | D | D | D |
| 실시간 LLM 통화 개입 | B+ (2502.03964) | C (PoC 수준) | D | C+ |
| XAI 금융 | A (SHAP/LIME 정착) | A | B (규제 가이드는 있음) | B+ |
| Privacy-preserving sanitization | B (MASK 등 신규) | C | D | C |

A+ = 산업 즉시 도입, A = 학계 SOTA 정착, B = 활발, C = 초기, D = 빈틈

---

## 종합 — "빈틈" 분석 (학부생 5일 PoC로 가능한 영역)

### 추천 1순위: **음성 + 모바일뱅킹 화면 + 거래시도 멀티모달 사기 차단**
- **빈틈**: 학계에 직접 논문 거의 없음 (텍스트+오디오까지만 존재). 모바일 뱅킹 화면 OCR + 통화 ASR + 거래 패턴을 동시에 보는 모델이 사실상 없음.
- **PoC 구성안**:
  - 음성: KorCCViD로 KoBERT 분류기 학습 (24h)
  - 화면: 안드로이드 AccessibilityService로 보이스피싱 의심 키워드/앱(원격제어) 탐지 (12h)
  - 거래: GTAN 베이스라인 간이 구현 또는 룰 기반 (12h)
  - 융합: 단순 weighted ensemble + LLM(GPT-4o-mini)으로 자연어 경고 생성 (8h)
- **차별점**: 우리은행 앱 시연 시나리오와 직결.

### 추천 2순위: **LLM 적대적 공격에 강건한 한국어 보이스피싱 분류기**
- **빈틈**: arXiv 2507.16291이 지적한 GPT-4o 생성 스크립트에 SOTA가 30% 떨어지는 문제. 적대적 증강 학습 시도 적음.
- **PoC**: KorCCViD + GPT-4o로 합성 변형 데이터 생성 → adversarial training → robust 분류기. 2일 가능.

### 추천 3순위: **MASK + 한국어 PII 마스킹**
- **빈틈**: MASK(arXiv 2510.18493)는 영어 기반. 한국어 주민번호/계좌번호/금융 PII 마스킹 룰·모델 결합판 부재.
- **PoC**: KoELECTRA NER + 정규식 + LLM 호출 전 sanitization 파이프라인. 컴플라이언스 어필.

### 추천 4순위: **실시간 통화 LLM 코파일럿 (시니어 사용자용)**
- **빈틈**: arXiv 2502.03964 영어 기반 PoC만 존재. 한국어 실시간 ASR(Whisper-large-v3) + 경량 LLM(EXAONE 3.5 / Bllossom) 결합 시 데모 임팩트 큼.

### 추천 5순위: **연합학습 기반 멀티 은행 mule 계좌 탐지**
- **빈틈**: FedNovaAML 등 해외 사례만. 한국 5대 은행 모의 시나리오로 PoC 가능.
- 단, 5일 내 구현은 도전적. flwr(Flower) + GNN 베이스라인 사용 권장.

### 비추천
- 순수 GNN AML 모델 SOTA 경쟁 (학계 경쟁 너무 치열, 데이터·컴퓨팅 한계)
- 딥보이스 탐지 처음부터 학습 (사전학습 모델 사용해야 의미 있음)
- 영어 데이터셋 기반 PoC (우리은행 심사 임팩트 약함)

---

## 참고 — 핵심 GitHub 리포 요약

| 리포 | URL | 용도 |
|---|---|---|
| selfcontrol7/Korean_Voice_Phishing_Detection | https://github.com/selfcontrol7/Korean_Voice_Phishing_Detection | KorCCViD 데이터셋·베이스라인 |
| Ez-Sy01/KOR_phishing_Detect-Dataset | https://github.com/Ez-Sy01/KOR_phishing_Detect-Dataset | 한국어 피싱 메시지 |
| safe-graph/graph-fraud-detection-papers | https://github.com/safe-graph/graph-fraud-detection-papers | GNN 사기탐지 큐레이션 + RAG 챗봇 |
| AI4Risk/awesome-graph-based-fraud-detection | https://github.com/AI4Risk/awesome-graph-based-fraud-detection | FCS 2024 survey 코드 |
| AI4Risk/antifraud | https://github.com/AI4Risk/antifraud | GTAN/RGTAN/STAGN 구현체 ★ |
| safe-graph/DGFraud-TF2 | https://github.com/safe-graph/DGFraud-TF2 | TF2 GNN 툴박스 |
| benedekrozemberczki/awesome-fraud-detection-papers | https://github.com/benedekrozemberczki/awesome-fraud-detection-papers | 클래식 데이터마이닝 |
| SKTBrain/KoBERT | https://github.com/SKTBrain/KoBERT | 한국어 BERT |
| KLUE-benchmark/KLUE | https://github.com/KLUE-benchmark/KLUE | 한국어 NLU |
| sackoh/pycon-korea-2020-kb-albert | https://github.com/sackoh/pycon-korea-2020-kb-albert | 한국어 금융 ALBERT |

---

## 핵심 arXiv 논문 한눈에 (북마크용)

1. https://arxiv.org/abs/2507.16291 — Talking Like a Phisher (LLM 공격, KorCCViD)
2. https://arxiv.org/abs/2506.06180 — Detecting Voice Phishing with Precision (Bllossom 8B)
3. https://arxiv.org/abs/2502.03964 — LLM Real-time Phone Scam Detection
4. https://arxiv.org/abs/2510.18493 — MASK (Privacy-preserving sanitization)
5. https://arxiv.org/abs/2509.05362 — Privacy-Preserving Scambaiting
6. https://arxiv.org/abs/2508.06457 — ScamAgents
7. https://arxiv.org/abs/2507.11777 — Scalable AASIST
8. https://arxiv.org/abs/2509.26471 — Deepfake Voice: It's All in the Presentation
9. https://arxiv.org/abs/2509.00186 — Generalizable Audio Spoofing
10. https://arxiv.org/abs/2110.01200 — AASIST 원본
11. https://arxiv.org/abs/2309.08279 — AASIST2
12. https://arxiv.org/abs/2305.04468 — AnomalyBERT
13. https://arxiv.org/abs/2110.02642 — Anomaly Transformer
14. https://arxiv.org/abs/2501.15196 — SSL TSAD Survey 2025
15. https://arxiv.org/abs/2509.08380 — Co-Investigator AI (SAR 자동작성)
16. https://arxiv.org/abs/2509.11595 — AMLNet
17. https://arxiv.org/abs/2510.17848 — RiskTagger (Web3 AML)
18. https://arxiv.org/abs/2507.14785 — Vanguard LLM In-Context AML
19. https://arxiv.org/abs/2510.14991 — FL Financial Security Survey
20. https://arxiv.org/abs/2509.09127 — AML ML Pipelines
21. https://arxiv.org/abs/2509.19359 — AML Deep Learning
22. https://arxiv.org/abs/2505.10050 — XAI Stacking Ensemble Fraud
23. https://arxiv.org/abs/2512.16037 — XAI Big Data Fraud Survey
24. https://arxiv.org/abs/2506.02008 — Real-time Stream Fraud
25. https://arxiv.org/abs/2508.04129 — SVC 2025 Deception Challenge

---

## 결론

2026년 5월 현재, 학계·오픈소스 커뮤니티는 **GNN(거래) + LLM(통화/보고서) + XAI(규제 대응)** 의 3축으로 수렴하고 있다. 한국어 자원, 특히 KorCCViD 한 개에 의존하는 보이스피싱 데이터 생태계와, **음성·화면·거래를 동시에 보는 멀티모달 부재**가 우리은행 PoC에 명확한 차별화 공간을 제공한다. LLM 적대적 공격(2507.16291)이 학계 SOTA를 무력화한다는 점은 "단순 분류 정확도"가 아닌 "강건성·설명력·개인정보"를 강조해야 심사위원에게 어필 가능함을 시사한다.
