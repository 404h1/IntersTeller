"""
가이드 jpg에서 캐릭터·일러스트 부분을 잘라서
slides/assets/ 로 저장. HTML 슬라이드에서 재사용.
"""
from PIL import Image
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'slides', 'assets')
os.makedirs(OUT_DIR, exist_ok=True)

# ── 이미지 2 (4명 캐릭터) — 1964 x 1308
im2 = Image.open('ppt_guide/KakaoTalk_20260524_220629896.jpg')
# 좌하단 4명 캐릭터 영역 (대략 x=70~700, y=720~1290)
chars_4 = im2.crop((70, 700, 720, 1290))
chars_4.save(os.path.join(OUT_DIR, 'characters_4.png'))
print(f"characters_4.png saved: {chars_4.size}")

# ── 이미지 3 (3명 캐릭터 + 도시 실루엣) — 1964 x 1318
im3 = Image.open('ppt_guide/KakaoTalk_20260524_220640471.jpg')
# 좌하단 캐릭터 (3명) + 도시 (대략 x=80~780, y=700~1280)
chars_3 = im3.crop((80, 670, 800, 1280))
chars_3.save(os.path.join(OUT_DIR, 'characters_3.png'))
print(f"characters_3.png saved: {chars_3.size}")

# 도시 실루엣만 (배경)
city = im3.crop((40, 720, 780, 1080))
city.save(os.path.join(OUT_DIR, 'city_silhouette.png'))
print(f"city_silhouette.png saved: {city.size}")

# ── 이미지 1 (표지) — 868 x 570
im1 = Image.open('ppt_guide/KakaoTalk_20260524_220620427.jpg')
# 우측 폰 미리보기 3개 영역 (대략 x=330~830, y=60~470)
phones = im1.crop((330, 50, 830, 480))
phones.save(os.path.join(OUT_DIR, 'phones_preview.png'))
print(f"phones_preview.png saved: {phones.size}")

# 우하단 큰 캐릭터 (벌)
bee_big = im1.crop((550, 380, 800, 570))
bee_big.save(os.path.join(OUT_DIR, 'bee_big.png'))
print(f"bee_big.png saved: {bee_big.size}")

print("\n[OK] All assets cropped to slides/assets/")
