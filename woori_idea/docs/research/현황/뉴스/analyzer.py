import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from wordcloud import WordCloud
import platform

# 한글 폰트 설정
if platform.system() == "Darwin":
    plt.rcParams["font.family"] = "AppleGothic"
elif platform.system() == "Windows":
    plt.rcParams["font.family"] = "Malgun Gothic"
plt.rcParams["axes.unicode_minus"] = False


def yearly_trend(df):
    """연도별 범죄 유형 추이"""
    pivot = (df.dropna(subset=["incident_year", "crime_type"])
               .groupby(["incident_year", "crime_type"]).size().unstack(fill_value=0))
    pivot.plot(kind="bar", stacked=True, figsize=(10, 5), colormap="Set2")
    plt.title("연도별 보이스피싱 범죄 유형 추이")
    plt.ylabel("기사 건수")
    plt.xticks(rotation=0)
    plt.tight_layout()
    plt.savefig("trend_yearly.png", dpi=150)
    plt.close()
    print("📊 trend_yearly.png 저장")


def demographic_heatmap(df):
    """연령대 × 범죄 유형 히트맵"""
    sub = df.dropna(subset=["age", "crime_type"])
    if sub.empty:
        print("⚠️ 인구통계 데이터 부족")
        return
    ct = pd.crosstab(sub["age"], sub["crime_type"])
    plt.figure(figsize=(8, 5))
    sns.heatmap(ct, annot=True, fmt="d", cmap="YlOrRd")
    plt.title("연령대별 잘 당하는 범죄 유형")
    plt.tight_layout()
    plt.savefig("heatmap_demo.png", dpi=150)
    plt.close()
    print("📊 heatmap_demo.png 저장")


def trigger_wordcloud(df, font_path=None):
    """심리적 트리거 워드클라우드"""
    text = " ".join(df["psychological_trigger"].dropna().astype(str))
    if not text.strip():
        print("⚠️ 트리거 데이터 없음")
        return

    wc_args = dict(width=1200, height=600, background_color="white",
                   colormap="Reds", max_words=80)
    if font_path:
        wc_args["font_path"] = font_path
    elif platform.system() == "Windows":
        wc_args["font_path"] = "C:/Windows/Fonts/malgun.ttf"
    elif platform.system() == "Darwin":
        wc_args["font_path"] = "/System/Library/Fonts/AppleSDGothicNeo.ttc"

    wc = WordCloud(**wc_args).generate(text)
    plt.figure(figsize=(12, 6))
    plt.imshow(wc, interpolation="bilinear")
    plt.axis("off")
    plt.title("피해자가 속아넘어간 핵심 포인트", fontsize=15)
    plt.tight_layout()
    plt.savefig("wordcloud_trigger.png", dpi=150)
    plt.close()
    print("📊 wordcloud_trigger.png 저장")


def summary_report(df):
    """텍스트 요약 리포트"""
    print("\n" + "=" * 50)
    print("📌 보이스피싱 분석 요약")
    print("=" * 50)
    print(f"총 분석 기사: {len(df)}건")
    print(f"\n[범죄 유형 분포]\n{df['crime_type'].value_counts()}")
    print(f"\n[연령대 분포]\n{df['age'].value_counts()}")
    print(f"\n[연도별 분포]\n{df['incident_year'].value_counts().sort_index()}")
    print("\n[상위 심리 트리거 예시]")
    for i, t in enumerate(df["psychological_trigger"].dropna().head(5), 1):
        print(f"  {i}. {t}")


if __name__ == "__main__":
    df = pd.read_csv("voice_phishing_extracted.csv")
    summary_report(df)
    yearly_trend(df)
    demographic_heatmap(df)
    trigger_wordcloud(df)
