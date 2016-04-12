@ECHO OFF
SETLOCAL ENABLEEXTENSIONS

ZIPFILE=%1
GUID=%2
SHIFT
ARGS=%*
STAGING=\Users\%USERNAME%\jar.io\tmp\build_staging\%GUID%

IF NOT EXIST %STAGING% (
  ECHO "Making %STAGING% directory..."
  MD %STAGING%
) ELSE (
  ECHO "Clearing %STAGING% directory..."
  RD %STAGING%
)

ECHO "Unzipping %ZIP% into %STAGING%..."
unzip %ZIP% -d %STAGING%

