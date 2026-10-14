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

start "" "http://localhost:3000"
start "" "http://localhost:3000/admin"

node server.js

pause
