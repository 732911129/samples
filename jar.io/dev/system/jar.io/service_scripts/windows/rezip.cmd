@ECHO OFF
SETLOCAL ENABLEEXTENSIONS

SET USAGE="Usage: %0 [ zipfile ] [ task-guid ]"
SET ZIPFILE=%1
SET GUID=%2
SHIFT
SET ARGS=%*
SET STAGING="\Users\%USERNAME%\Desktop\jar-io\tmp\build_staging\%GUID%"

IF "%ZIPFILE%"=="" (
  ECHO %USAGE%
  EXIT /B 1 
) ELSE IF "%GUID%"=="" (
  ECHO %USAGE%
  EXIT /B 1
)

IF NOT EXIST %ZIPFILE% (
  ECHO "%ZIPFILE% does not exist."
  EXIT /B 1
) ELSE (
  ECHO "%ZIPFILE% exists."
)

IF NOT EXIST %STAGING% (
  ECHO "Making %STAGING% directory..."
  MD %STAGING%
) ELSE (
  ECHO "Clearing %STAGING% directory..."
  RD %STAGING%
)

ECHO "Unzipping %ZIPFILE% into %STAGING%..."
powershell.exe -nologo -noprofile -command "& { Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::ExtractToDirectory('%ZIPFILE%', '%STAGING%'); }"

