# v1. 지정된 경로에 폴더 및 빈 파일 생성 스크립트 작성됨
from pathlib import Path

# 대상 경로 (Windows 경로를 안전하게 처리하기 위해 raw string r"" 사용)
target_path = Path(r"C:\Users\SSAFY\Desktop\hwlee\projects\20260520_woori\docs\research\현황\뉴스")

# 생성할 파일 목록
files = [
    "config.py",
    "crawler.py",
    "extractor.py",
    "analyzer.py",
    "main.py",
    "requirements.txt"
]

# 1. 폴더 생성 (이미 존재하면 무시, 상위 폴더가 없으면 함께 생성)
target_path.mkdir(parents=True, exist_ok=True)

# 2. 빈 파일 생성
for file in files:
    file_path = target_path / file
    file_path.touch(exist_ok=True)
    print(f"생성 완료: {file_path}")

print("\n모든 작업이 완료되었습니다.")