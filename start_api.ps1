# API 서버 시작 스크립트 (PowerShell)
Set-Location $PSScriptRoot

# .env 파일 확인
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env 파일이 없습니다." -ForegroundColor Yellow
    Write-Host "📝 .env 파일을 생성하고 OPENAI_API_KEY를 설정해주세요." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "예시:" -ForegroundColor Yellow
    Write-Host "Set-Content -Path .env -Value 'OPENAI_API_KEY=your-api-key-here'" -ForegroundColor Yellow
    exit 1
}

# .env 파일에서 환경 변수 로드
Get-Content .env | ForEach-Object {
    $line = $_.Trim()
    # 주석과 빈 줄 제외
    if ($line -and -not $line.StartsWith('#')) {
        if ($line -match '^([^=]+)\s*=\s*(.+)$') {
            $key = $matches[1].Trim() -replace '-', '_'
            $value = $matches[2].Trim() -replace '^["'']|["'']$', ''
            [Environment]::SetEnvironmentVariable($key, $value, 'Process')
        }
    }
}

# API 서버 실행
Write-Host "🚀 API 서버를 시작합니다..." -ForegroundColor Green
Write-Host "📍 서버 주소: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 API 문서: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
uv run python api_server.py






