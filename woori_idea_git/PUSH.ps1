Set-Location $PSScriptRoot
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host " Woori - 한마디 GitHub 푸시" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "폴더: $PSScriptRoot"
Write-Host "원격: https://github.com/404h1/Woori.git"
Write-Host ""
Write-Host "푸시 시작..." -ForegroundColor Yellow
Write-Host "처음이면 브라우저가 뜰 수 있어요. GitHub 로그인만 해주세요." -ForegroundColor Yellow
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host " 성공! https://github.com/404h1/Woori" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host " 실패. 아래 중 하나일 가능성:" -ForegroundColor Red
    Write-Host " 1. GitHub에 Woori 레포가 아직 없음" -ForegroundColor Red
    Write-Host "    - https://github.com/new 에서 'Woori' 만들기 (README 체크 해제)" -ForegroundColor Red
    Write-Host " 2. 인증 필요" -ForegroundColor Red
    Write-Host "    - 브라우저에서 GitHub 로그인" -ForegroundColor Red
    Write-Host " 3. 충돌" -ForegroundColor Red
    Write-Host "    - git pull origin main --allow-unrelated-histories --no-edit" -ForegroundColor Red
    Write-Host "    - 다시 PUSH.ps1 실행" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
}
Write-Host ""
Read-Host "Enter 누르면 종료"
