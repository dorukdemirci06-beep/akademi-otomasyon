$WshShell = New-Object -comObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$Shortcut = $WshShell.CreateShortcut("$DesktopPath\KUYO - Akademi Otomasyon.lnk")
$Shortcut.TargetPath = "c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon\sistemi_baslat.bat"
$Shortcut.WorkingDirectory = "c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon"
$Shortcut.IconLocation = "c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon\icon.ico"
$Shortcut.Description = "KUYO - Akademi Yönetim Sistemi"
$Shortcut.Save()
Write-Host "Kısayol oluşturuldu: $DesktopPath\KUYO - Akademi Otomasyon.lnk"
