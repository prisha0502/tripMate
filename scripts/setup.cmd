@echo off
setlocal
set CI=true
call pnpm install
exit /b %ERRORLEVEL%
