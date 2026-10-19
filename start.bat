@echo off
cd /d "%~dp0"
chcp 65001 > nul
title Kitten Cake CMS Server

echo =======================================================
echo    🍰 KITTEN CAKE - HỆ THỐNG QUẢN TRỊ WEBSITE
echo =======================================================
echo.
echo Đang khởi động hệ thống máy chủ...
echo.

set PATH=C:\Program Files\nodejs;%PATH%

:: Đợi 2 giây cho server Node.js sẵn sàng lắng nghe cổng 3000 rồi mới mở trình duyệt
start /b cmd /c "timeout /t 2 /nobreak > nul & start http://localhost:3000 & start http://localhost:3000/admin"

node server.js

pause
