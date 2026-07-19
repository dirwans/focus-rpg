Write-Host "=== FILE BESAR DI public/ ==="
Get-ChildItem public -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer } | Sort-Object Length -Descending | Select-Object -First 20 | ForEach-Object {
    $relPath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host ("{0,-80} {1,10:N2} MB" -f $relPath, ($_.Length/1MB))
}

Write-Host ""
Write-Host "=== FILE BESAR DI references_backup/ ==="
Get-ChildItem references_backup -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer } | Sort-Object Length -Descending | Select-Object -First 20 | ForEach-Object {
    $relPath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host ("{0,-80} {1,10:N2} MB" -f $relPath, ($_.Length/1MB))
}

Write-Host ""
Write-Host "=== FILE BESAR DI android/ ==="
Get-ChildItem android -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer } | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
    $relPath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host ("{0,-80} {1,10:N2} MB" -f $relPath, ($_.Length/1MB))
}

Write-Host ""
Write-Host "=== FILE BESAR DI scripts/ ==="
Get-ChildItem scripts -Recurse -ErrorAction SilentlyContinue | Where-Object { -not $_.PSIsContainer } | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
    $relPath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host ("{0,-80} {1,10:N2} MB" -f $relPath, ($_.Length/1MB))
}
