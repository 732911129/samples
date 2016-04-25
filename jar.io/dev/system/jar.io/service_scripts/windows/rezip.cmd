@echo off

set cmd=%0

shift

powershell -executionpolicy unrestricted -file %cmd%.ps1 %*
