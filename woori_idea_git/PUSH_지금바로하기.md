# 깨자마자 30초로 푸시 끝내기

## 상황
- 모든 산출물 작성·커밋까지 완료됨 (이 폴더의 `.git` 안에 들어 있음)
- 푸시만 남았는데, GitHub은 인증 토큰이 필요해서 자동으로 못 끝냄
- 토큰만 있으면 한 줄로 끝남

## 푸시 방법 — 둘 중 하나 고르세요

### 방법 A. PowerShell + Personal Access Token (PAT) — 30초

1. **PAT 발급** (한 번만):
   - https://github.com/settings/tokens 접속
   - "Generate new token (classic)" 클릭
   - Scope에서 `repo` 체크
   - "Generate token" 클릭 → 토큰 복사 (예: `ghp_xxxx...`)

2. **PowerShell에서 실행**:
   ```powershell
   cd C:\Users\SAMSUNG\Desktop\Woori\woori_idea_git
   git push -u origin main
   ```
   - Username: `404h1`
   - Password: `ghp_xxxx...` (방금 발급한 토큰을 그대로 붙여넣기)

   끝.

### 방법 B. GitHub Desktop — 10초 (가장 쉬움)

1. GitHub Desktop 열기 (없으면 https://desktop.github.com/ 설치)
2. **File → Add Local Repository** 선택
3. 폴더 선택: `C:\Users\SAMSUNG\Desktop\Woori\woori_idea_git`
4. **Publish repository** 또는 **Push origin** 클릭 → 끝.

GitHub Desktop이 자동으로 인증을 처리해줍니다.

---

## 푸시 후 확인

푸시 성공하면 https://github.com/404h1/Woori 에서 확인:
- `README.md` (진입점)
- `아이디어/00_FINAL_한마디.md` (메인 아이디어)
- `아이디어/01_평가기준_1등공식.md`
- `아이디어/02_구현_기술스택_데모.md`
- `아이디어/03_PPT_15분_골격.md`
- `docs/research/*` (모든 리서치 자료)

---

## 폴더 정리 (선택)

푸시가 끝나면:
- **이 폴더 `woori_idea_git`이 진짜 작업 폴더입니다** (깨끗한 .git 포함, 원격 origin 설정됨)
- 원래 `woori_idea` 폴더의 `.git`은 NTFS 권한 충돌로 망가져 있어요. 다음 둘 중 하나:
  - (권장) `woori_idea` 폴더를 통째로 백업 후 삭제, `woori_idea_git`을 `woori_idea`로 이름 변경
  - 그냥 `woori_idea_git`을 메인으로 사용

---

## 만약 충돌이 나면 (이미 GitHub repo에 뭔가 있을 때)

```powershell
cd C:\Users\SAMSUNG\Desktop\Woori\woori_idea_git
git pull origin main --allow-unrelated-histories
# 충돌 해결 후
git push -u origin main
```

또는 force push (조심해서):
```powershell
git push -u origin main --force
```

---

## 안 되는 경우

`woori.bundle` 파일이 같이 들어 있어요. 이걸 다른 사람한테 보내거나, 새 PC에서:
```bash
git clone woori.bundle 새폴더
cd 새폴더
git remote set-url origin https://github.com/404h1/Woori.git
git push -u origin main
```

---

**아침에 봤을 때 푸시 끝나 있을 게 아니라서 미안해요. GitHub 인증 토큰이 없으면 진짜 자동으로 못 끝내요. 위 방법 A로 30초면 됩니다. 화이팅!**
