@echo off
setlocal EnableDelayedExpansion

if not defined GRADLE_WORKER_CAP set "GRADLE_WORKER_CAP=6"

set "CPUS="
for /f %%i in ('wmic cpu get NumberOfCores /value ^| find "="') do (
  for /f "tokens=2 delims==" %%j in ("%%i") do set "CPUS=%%j"
)

if not defined CPUS (
  if defined NUMBER_OF_PROCESSORS (
    set /a CPUS=NUMBER_OF_PROCESSORS / 2
  ) else (
    set "CPUS=4"
  )
)

if !CPUS! LSS 1 set "CPUS=1"

set "WORKERS=!CPUS!"
if !WORKERS! GTR %GRADLE_WORKER_CAP% set "WORKERS=%GRADLE_WORKER_CAP%"

echo [gradlew-with-worker-cap] cpus=!CPUS! cap=%GRADLE_WORKER_CAP% -^> --max-workers=!WORKERS! 1>&2
gradlew.bat --max-workers=!WORKERS! %*
