$blogDir = "c:\Users\Asus\.gemini\antigravity\scratch\wisma-apollo\dist\blog"
$affected = @("batu-suli-desa-upon-batu", "bundaran-kuala-kurun", "hotel-di-kuala-kurun", "hotel-kuala-kurun-kalimantan-tengah", "penginapan-murah-kuala-kurun")

foreach ($name in $affected) {
    $file = Join-Path $blogDir "$name\index.html"
    $bytes = [System.IO.File]::ReadAllBytes($file)
    # Decode the bytes as Latin-1 (which is what caused the mojibake)
    $latin1 = [System.Text.Encoding]::GetEncoding(28591)
    $contentLatin1 = $latin1.GetString($bytes)
    # Re-encode as UTF-8 bytes then decode as UTF-8
    $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($contentLatin1)
    # This won't work for true double-encoding. Let's try another approach.
    
    # Actually, the issue is simpler: the files have UTF-8 bytes but some parts 
    # were double-encoded. Let's just do byte-level replacements.
    
    # Read as UTF-8 string
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    
    # The mojibake sequences are UTF-8 bytes misinterpreted. 
    # We need to find these specific byte sequences and replace them.
    # Since PowerShell is having trouble with the literal chars, 
    # let's use hex byte patterns instead.
    
    # Calendar emoji (U+1F4C5): UTF-8 = F0 9F 93 85
    # When double-encoded via Latin-1: C3 B0 C5 B8 E2 80 9C C2 85
    # The mojibake string "ðŸ"…" 
    
    # Actually let's just do simple string replacement using the actual bytes
    $content = $content -replace [char]0x00F0 + [char]0x0178 + [char]0x201C + [char]0x0085, [char]0xD83D + [char]0xDCC5
    
    Write-Host "Processing: $name"
    
    # Simpler: just replace the known bad text with good text
    # Read file bytes, try to detect and fix
    $rawContent = Get-Content $file -Raw -Encoding UTF8
    Write-Host "  Length: $($rawContent.Length)"
}
