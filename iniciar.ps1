# Levanta todo con Docker y abre la web. Ejecutar desde la carpeta del proyecto:  .\iniciar.ps1
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
docker info *> $null
if ($LASTEXITCODE -ne 0) { Write-Host 'Docker Desktop no esta en ejecucion. Abrelo y vuelve a intentar.' -ForegroundColor Red; exit 1 }
docker compose up -d --build
Write-Host 'Esperando a que la API responda (la primera vez puede tardar 1-2 minutos)...'
$ok = $false
for ($i = 0; $i -lt 90; $i++) {
  try { if ((Invoke-WebRequest -UseBasicParsing http://localhost:8080/api/health -TimeoutSec 3).StatusCode -eq 200) { $ok = $true; break } } catch { Start-Sleep -Seconds 2 }
}
if (-not $ok) { Write-Host 'La API no respondio. Revisa:  docker compose logs server' -ForegroundColor Red; exit 1 }
Start-Process 'http://localhost:8080'
Write-Host 'Listo.  Web: http://localhost:8080   Admin: http://localhost:8080/admin  (admin@local.test / AdminLocal12345)' -ForegroundColor Green
