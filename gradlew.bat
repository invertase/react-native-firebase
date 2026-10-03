@echo off
setlocal EnableDelayedExpansion

set "ROOT_DIR=%~dp0"
set "FORWARDED_ARGS="

:collectArgs
if "%~1"=="" goto runGradle
set "ARGUMENT=%~1"
if "!ARGUMENT:~0,26!"=="-PinternalKtlintGitFilter=" (
  set "ARGUMENT=-PrnfbKtlintGitFilter=!ARGUMENT:~26!"
)
set FORWARDED_ARGS=!FORWARDED_ARGS! "!ARGUMENT!"
shift
goto collectArgs

:runGradle
pushd "%ROOT_DIR%tests\android"
call gradlew.bat !FORWARDED_ARGS!
set "GRADLE_EXIT=%ERRORLEVEL%"
popd
exit /b %GRADLE_EXIT%
