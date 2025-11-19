# BPJS Blockchain - Real-Time Monitoring Script
# Press Ctrl+C to stop

Write-Host "Starting Real-Time Monitoring..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    Clear-Host
    
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║     BPJS BLOCKCHAIN - LIGHTWEIGHT NETWORK MONITOR        ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    # System Memory
    Write-Host "📊 SYSTEM MEMORY" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    $os = Get-CimInstance Win32_OperatingSystem
    $totalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $freeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $usedGB = $totalGB - $freeGB
    $usedPercent = [math]::Round(($usedGB / $totalGB) * 100, 1)
    
    Write-Host "Total: $totalGB GB | Used: $usedGB GB ($usedPercent%) | Free: $freeGB GB"
    
    if ($usedPercent -gt 90) {
        Write-Host "⚠️  CRITICAL: Memory usage is very high!" -ForegroundColor Red
    } elseif ($usedPercent -gt 80) {
        Write-Host "⚠️  Warning: Memory usage is high" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Memory usage is healthy" -ForegroundColor Green
    }
    
    Write-Host ""
    
    # Container Status
    Write-Host "🐳 DOCKER CONTAINERS" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    $containers = docker ps --format "{{.Names}}|{{.Status}}" 2>$null
    
    if ($containers) {
        foreach ($container in $containers) {
            $parts = $container -split '\|'
            $name = $parts[0]
            $status = $parts[1]
            
            if ($name -like "*orderer*") {
                $icon = "📋"
                $type = "Orderer"
            } elseif ($name -like "*bpjs*") {
                $icon = "🏥"
                $type = "BPJS Peer"
            } elseif ($name -like "*rumahsakit*") {
                $icon = "🏨"
                $type = "Hospital Peer"
            } else {
                $icon = "📦"
                $type = "Container"
            }
            
            Write-Host "$icon $type" -ForegroundColor Cyan -NoNewline
            Write-Host " - " -NoNewline
            if ($status -like "*Up*") {
                Write-Host "$status" -ForegroundColor Green
            } else {
                Write-Host "$status" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ No containers running" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Container Memory Usage
    Write-Host "💾 CONTAINER MEMORY USAGE" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    
    $stats = docker stats --no-stream --format "{{.Name}}|{{.MemUsage}}" 2>$null
    
    if ($stats) {
        foreach ($stat in $stats) {
            $parts = $stat -split '\|'
            $name = $parts[0]
            $mem = $parts[1]
            
            if ($name -like "*orderer*") {
                $shortName = "Orderer"
            } elseif ($name -like "*bpjs*") {
                $shortName = "BPJS Peer"
            } elseif ($name -like "*rumahsakit*") {
                $shortName = "Hospital Peer"
            } else {
                $shortName = $name
            }
            
            Write-Host "$shortName`.PadRight(20) : $mem" -ForegroundColor White
        }
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor DarkGray
    Write-Host "Refreshing in 5 seconds... (Ctrl+C to stop)" -ForegroundColor DarkGray
    
    Start-Sleep -Seconds 5
}
