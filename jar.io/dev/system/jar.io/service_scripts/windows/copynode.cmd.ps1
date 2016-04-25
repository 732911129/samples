@ECHO OFF
SETLOCAL ENABLEEXTENSIONS

SET usage="Usage: %0 [ node ] [ service1 ] [ service2 ]"

SET node=%1
SET s1=%2
SET s2=%3
SET source=%s1\%node
SET dest=%s2\%node

IF "%s1%"=="" (
  ECHO %usage%
  EXIT /B 1 
) ELSE IF "%s2%"=="" (
  ECHO %usage%
  EXIT /B 1 
) ELSE IF "%node%"=="" (
  ECHO %usage%
  EXIT /B 1
)

IF NOT EXIST %s1% (
  ECHO "Source %s1% does not exist. Exiting."
  EXIT /B 1
)

IF EXIST %dest% (
  ECHO "Destination exists, deleting..."
  Remove-Item -path %dest% -recurse
  ECHO "Done."
)

IF NOT EXIST %s2% (
  ECHO "Making destination root...."
  New-Item %s2% -type directry -force
  ECHO "Done."
)

ECHO "Copying %source% to %dest%..."
Copy-Item %source% %s2% -recurse
ECHO "Done."


