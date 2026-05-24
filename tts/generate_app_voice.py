"""
Qwen3-TTS CustomVoice 모델 + preset 여성 화자로 7개 페이지 TTS 생성.
→ woori_app_ai/public/audio/page0X.mp3 자동 저장

CustomVoice 모델은 preset 화자 리스트 제공 (Cherry, Chelsie 등).
첫 실행 시 모델 다운로드 (~3GB).
"""
import os, sys, subprocess, shutil
import soundfile as sf
import torch
import imageio_ffmpeg


# ── 경로 ──────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
OUT_DIR     = os.path.join(BASE_DIR, "app_outputs_v2")
APP_AUDIO_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "woori_app_ai", "public", "audio"))

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(APP_AUDIO_DIR, exist_ok=True)

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()


# ── 화자 우선순위 (한국어 발음 품질 우선) ────────────────
# Supported: aiden, dylan, eric, ono_anna, ryan, serena, sohee, uncle_fu, vivian
# sohee = 한국 여성 (한국어 발음 최적), serena/vivian = 영어 여성
FEMALE_PREFERENCES = ["sohee", "serena", "vivian", "ono_anna"]

# 발음 품질 향상을 위한 instruct (CustomVoice가 지원하는 경우)
INSTRUCT = "차분하고 또박또박, 신뢰감 있는 한국 은행 행원 톤. 천천히 명확하게 발음."


# ── 7개 페이지 대본 ───────────────────────────────────────
SCRIPTS = {
    "page02": "결과가 나왔어요. 본인 투자성향이 어떻게 나왔는지, 그리고 그 뜻이 무엇인지 한 번 더 확인해보세요. 성향과 맞지 않는 상품에 가입하면 금융소비자보호법에 따라 부적합 안내가 나갈 수 있어요.",
    "page03": "여기 보이는 펀드는 모두 매우높은위험 등급이에요. 수익률 숫자가 커 보여도, 과거 수익률이 미래를 보장하지는 않아요. 예금자보호 대상이 아니라는 점도 기억하세요. 펀드 이름을 누르면 자세한 내용을 보실 수 있어요.",
    "page03c": "이 펀드는 엔비디아, TSMC 같은 글로벌 AI 반도체 기업에 투자해요. 최근 3개월 수익률이 +46%라는 건, 같은 폭으로 떨어질 수도 있다는 뜻이에요. 환매수수료가 있어서 중간에 빼면 손실이 생길 수 있고, 해외 주식이라 환율에 따라 추가 손익도 발생해요. 장점, 주의, 적합한 분 탭을 하나씩 읽어보시고 본인에게 맞는지 직접 판단해주세요.",
    "page05": "가입 전 두 가지를 확인하는 단계예요. 첫 번째는 최근 1개월 안에 대출을 받으셨거나 받을 예정인지, 두 번째는 증권사에서 확인받은 전문 금융소비자인지 묻는 거예요. 본인 상황을 떠올려보시고 직접 답해주세요.",
    "page06": "가입할 금액을 입력하는 단계예요. 출금가능금액 안에서, 본인이 잃어도 생활에 지장이 없는 금액만 입력해주세요. 한 번 가입하면 매수예정일에 자동으로 빠져나가요.",
    "page07": "상품설명서예요. 원금 손실 가능성, 환매 조건, 청약철회가 가능한 기간이 적혀 있어요. 끝까지 직접 읽어보셔야 가입이 진행돼요. 시간이 걸려도 천천히 보시고, 이해 안 되는 부분은 상담을 요청하세요.",
    "page08": "해피콜이에요. 가입한 상품의 위험성, 설명서 확인 여부, 가입 강요 여부를 본인이 실제로 어떻게 인지하고 가입했는지 확인하는 단계예요. 8개 질문을 하나씩 읽어보시고, 본인이 직접 느낀 대로 답해주세요.",
}


def pick_female_speaker(supported):
    """preset 리스트에서 여성 우선 화자 선택."""
    for name in FEMALE_PREFERENCES:
        if name in supported:
            return name
    # fallback: 첫 번째
    return supported[0] if supported else None


def main():
    print("=" * 60)
    print("Qwen3-TTS CustomVoice (preset 여성 화자) TTS 7개 생성")
    print("=" * 60)

    print(f"\n[1] CustomVoice 모델 로드 (CUDA: {torch.cuda.is_available()})...")
    from qwen_tts import Qwen3TTSModel
    model = Qwen3TTSModel.from_pretrained(
        "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
        dtype=torch.bfloat16,
        device_map="cuda:0" if torch.cuda.is_available() else "cpu",
    )
    print("    -> 로드 완료")

    supported = model.get_supported_speakers() or []
    print(f"\n[2] Supported speakers: {supported}")
    speaker = pick_female_speaker(supported)
    if not speaker:
        print("[FAIL] No supported speakers found. Aborting.")
        sys.exit(1)
    print(f"    -> 선택 화자: {speaker}")

    print(f"\n[3] 7개 페이지 합성 시작 (instruct + 화자={speaker})...\n")
    wav_paths = {}
    for page_id, script_text in SCRIPTS.items():
        print(f"  [{page_id}] {script_text[:40]}...")
        try:
            wavs, sr = model.generate_custom_voice(
                text=script_text,
                speaker=speaker,
                language="korean",
                instruct=INSTRUCT,
            )
            wav_path = os.path.join(OUT_DIR, f"{page_id}.wav")
            sf.write(wav_path, wavs[0], sr)
            wav_paths[page_id] = wav_path
            dur = len(wavs[0]) / sr
            print(f"     -> {wav_path} ({dur:.1f}s)\n")
        except Exception as e:
            # instruct 미지원 시 fallback
            try:
                print(f"     instruct 실패, instruct 없이 재시도...")
                wavs, sr = model.generate_custom_voice(
                    text=script_text,
                    speaker=speaker,
                    language="korean",
                )
                wav_path = os.path.join(OUT_DIR, f"{page_id}.wav")
                sf.write(wav_path, wavs[0], sr)
                wav_paths[page_id] = wav_path
                dur = len(wavs[0]) / sr
                print(f"     -> {wav_path} ({dur:.1f}s)\n")
            except Exception as e2:
                print(f"     [FAIL] {e2}\n")

    print(f"\n[4] MP3 변환 + 앱 폴더로 복사...")
    for page_id, wav_path in wav_paths.items():
        mp3_local = os.path.join(OUT_DIR, f"{page_id}.mp3")
        mp3_app   = os.path.join(APP_AUDIO_DIR, f"{page_id}.mp3")
        r = subprocess.run([
            ffmpeg, "-y", "-i", wav_path,
            "-ar", "22050", "-ac", "1", "-b:a", "128k",
            mp3_local,
        ], capture_output=True)
        if r.returncode != 0:
            print(f"  [FAIL] {page_id} mp3 conversion failed")
            continue
        shutil.copy(mp3_local, mp3_app)
        size_kb = os.path.getsize(mp3_app) / 1024
        print(f"  [OK] {page_id}.mp3 -> {size_kb:.0f} KB")

    print("\n" + "=" * 60)
    print(f"완료! 화자: {speaker}")
    print(f"  WAV: {OUT_DIR}/")
    print(f"  MP3: {APP_AUDIO_DIR}/")
    print("=" * 60)


if __name__ == "__main__":
    main()
