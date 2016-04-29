@ECHO OFF
SET cmd=%0
SHIFT
powershell -executionpolicy unrestricted -file %cmd%.ps1 %*




