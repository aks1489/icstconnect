Add-Type -AssemblyName System.Drawing

$sourcePath = "E:\Project\icstconnect\src\components\icons\Futuristic_Circuit_Cursor_Icon.png"
$bmp = New-Object System.Drawing.Bitmap($sourcePath)

Write-Host "Original dimensions: $($bmp.Width) x $($bmp.Height)"

# Find the bounding box and the tip (uppermost non-transparent pixel)
$minX = $bmp.Width
$minY = $bmp.Height
$maxX = 0
$maxY = 0
$tipX = 0
$tipY = $bmp.Height

for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -gt 30) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { 
                $minY = $y
                $tipX = $x
                $tipY = $y
            }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Bounding box: minX=$minX, minY=$minY, maxX=$maxX, maxY=$maxY"
Write-Host "Tip position: x=$tipX, y=$tipY"

# Create a cropped bitmap tightly around the cursor so the tip is at the top-left
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1
$cropRect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
$croppedBmp = $bmp.Clone($cropRect, $bmp.PixelFormat)

# Make the cropped image square so proportions are preserved
$maxDim = [Math]::Max($cropW, $cropH)
$squareBmp = New-Object System.Drawing.Bitmap($maxDim, $maxDim, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gSquare = [System.Drawing.Graphics]::FromImage($squareBmp)
$gSquare.Clear([System.Drawing.Color]::Transparent)
$gSquare.DrawImage($croppedBmp, 0, 0, $cropW, $cropH)
$gSquare.Dispose()

# Create sizes: 32x32 (standard CSS cursor), 48x48, 64x64, 128x128
$sizes = @(32, 48, 64, 128)
$publicDir = "E:\Project\icstconnect\public"
if (-not (Test-Path "$publicDir\icons")) {
    New-Item -ItemType Directory -Path "$publicDir\icons" | Out-Null
}

foreach ($s in $sizes) {
    $resized = New-Object System.Drawing.Bitmap($s, $s, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($resized)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($squareBmp, 0, 0, $s, $s)
    $g.Dispose()

    $destPath = "$publicDir\icons\cursor-$($s).png"
    $resized.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $resized.Dispose()
    Write-Host "Saved $destPath ($s x $s)"
}

# Also copy primary cursor as public/icons/Futuristic_Circuit_Cursor_Icon.png (32px or 64px optimized for cursor)
Copy-Item "$publicDir\icons\cursor-32.png" "$publicDir\icons\cursor.png" -Force
Copy-Item "$sourcePath" "$publicDir\icons\Futuristic_Circuit_Cursor_Icon.png" -Force

$bmp.Dispose()
$croppedBmp.Dispose()
$squareBmp.Dispose()
Write-Host "Done!"
