$files = Get-ChildItem -Path "c:\Users\Asus\.gemini\antigravity\scratch\wisma-apollo" -File -Recurse -Include *.html

$replacements = @{
    '<span class="promo-fire">.*?</span>' = '<span class="promo-fire">🔥</span>'
    '<div class="usp-icon">.*?</div>\s*<h3>Lokasi Strategis</h3>' = '<div class="usp-icon">📍</div>`n                    <h3>Lokasi Strategis</h3>'
    '<div class="usp-icon">.*?</div>\s*<h3>Kedap Suara</h3>' = '<div class="usp-icon">🔇</div>`n                    <h3>Kedap Suara</h3>'
    '<div class="usp-icon">.*?</div>\s*<h3>Kasur Premium</h3>' = '<div class="usp-icon">🛏️</div>`n                    <h3>Kasur Premium</h3>'
    '<div class="usp-icon">.*?</div>\s*<h3>Kebersihan</h3>' = '<div class="usp-icon">🧹</div>`n                    <h3>Kebersihan</h3>'
    '<span>.*?</span>Air Conditioner' = '<span>❄️</span>Air Conditioner'
    '<span>.*?</span>TV Android' = '<span>📺</span>TV Android'
    '<span>.*?</span>Handuk' = '<span>🛁</span>Handuk'
    '<span>.*?</span>Bathroom Amenities' = '<span>🧴</span>Bathroom Amenities'
    '<span>.*?</span>Kamar Mandi Dalam' = '<span>🚿</span>Kamar Mandi Dalam'
    '<span>.*?</span>Kamar Bersih' = '<span>🔇</span>Kamar Bersih'
    '<span>.*?</span>Free Wi-Fi' = '<span>📶</span>Free Wi-Fi'
    '<span>.*?</span>Free Coffee' = '<span>☕</span>Free Coffee'
    '<span>.*?</span>Air Mineral' = '<span>💧</span>Air Mineral'
    '<span>.*?</span>Parkir Luas' = '<span>🅿️</span>Parkir Luas'
    '<span>.*?</span>Keamanan' = '<span>🛡️</span>Keamanan'
    '<span>.*?</span>Resepsionis' = '<span>😊</span>Resepsionis'
    '<span>.*?</span>Sarapan' = '<span>🍳</span>Sarapan'
    '<span>.*?</span>Tambahan' = '<span>🛌</span>Tambahan'
    '<div class="testi-stars">.*?</div>' = '<div class="testi-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
    'Maret 2025(.*?)</span>' = 'Maret 2025$1</span>'
}

foreach ($file in $files) {
    if ($file.FullName -match "node_modules") { continue }
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $modified = $false
    
    foreach ($key in $replacements.Keys) {
        if ($content -match $key) {
            $content = $content -replace $key, $replacements[$key]
            $modified = $true
        }
    }
    
    # Also fix blog date emoji which was U+1F4C5
    if ($content -match '<span class="date">.*?(\d{1,2} [A-Za-z]+ \d{4})') {
        $content = [regex]::Replace($content, '<span class="date">.*?(\d{1,2} [A-Za-z]+ \d{4})', '<span class="date">📅 $1')
        $modified = $true
    }

    if ($modified) {
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        Write-Host "Fixed: $($file.Name)"
    }
}
