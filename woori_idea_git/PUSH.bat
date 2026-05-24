@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo ======================================
echo  Woori - 한마디 GitHub 푸시
echo ======================================
echo.
echo 폴더: %CD%
echo 원격: https://github.com/404h1/Woori.git
echo.
echo 푸시를 시작합니다...
echo 처음이면 브라우저가 뜰 수 있어요. GitHub 로그인만 해주세요.
echo.
git push -u origin main
echo.
if %errorlevel% equ 0 (
    echo ======================================
    echo  성공! https://github.com/404h1/Woori
    echo ======================================
) else (
    echo ======================================
    echo  실패. 아래 중 하나일 가능성:
    echo  1. GitHub에 Woori 레포가 아직 없음
    echo     - https://github.com/new 에서 "Woori" 만들기 (README 체크 해제)
    echo  2. 인증 필요
    echo     - 브라우저 창에서 GitHub 로그인
    echo  3. 충돌
    echo     - git pull origin main --allow-unrelated-histories --no-edit
    echo     - 그 다음 다시 PUSH.bat 더블클릭
    echo ======================================
)
echo.
pause
