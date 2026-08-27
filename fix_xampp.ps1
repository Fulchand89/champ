# Stop services if they are running
Write-Host "Stopping MySQL service..."
Stop-Service -Name mysql -Force -ErrorAction SilentlyContinue

Write-Host "Stopping Apache service..."
Stop-Service -Name Apache2.4 -Force -ErrorAction SilentlyContinue

# Wait a moment for services to stop completely
Start-Sleep -Seconds 2

# Remove old services
Write-Host "Removing old services..."
sc.exe delete mysql
sc.exe delete Apache2.4

# Register new services with the correct path from c:\xampp_new
Write-Host "Registering Apache2.4 service with new path..."
New-Service -Name "Apache2.4" -BinaryPathName '"c:\xampp_new\apache\bin\httpd.exe" -k runservice' -StartupType Automatic -DisplayName "Apache2.4"

Write-Host "Registering mysql service with new path..."
New-Service -Name "mysql" -BinaryPathName 'c:\xampp_new\mysql\bin\mysqld.exe --defaults-file=c:\xampp_new\mysql\bin\my.ini mysql' -StartupType Automatic -DisplayName "mysql"

Write-Host "`nServices have been successfully updated to xampp_new!"
Write-Host "Press Enter to exit..."
Read-Host
