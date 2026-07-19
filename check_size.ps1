$folders = @('node_modules','android','public','src','server','scripts','references_backup','dbase-guides','.git')
foreach ($f in $folders) {
    if (Test-Path $f) {
        $size = (Get-ChildItem $f -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($size) {
            Write-Host ("{0,-25} {1,10:N2} MB" -f $f, ($size/1MB))
        } else {
            Write-Host ("{0,-25} {1,10} MB" -f $f, 0)
        }
    }
}
