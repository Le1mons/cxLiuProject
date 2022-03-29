@echo off
set "folder=C:\Users\admin\Desktop\serverExport"

rd /s /q %folder%

c:/svnbin/svn.exe update --username ddb --password ddb --no-auth-cache samejson
c:/svnbin/svn.exe update --username ddb --password ddb --no-auth-cache 
c:/svnbin/svn.exe export --username ddb --password ddb --no-auth-cache ./ C:\Users\admin\Desktop\serverExport

cd /d %folder%

if exist Explanation rd /s /q Explanation
if exist log rd /s /q log
if exist patch rd /s /q patch
if exist tools rd /s /q tools
if exist patch rd /s /q patch
if exist tests rd /s /q tests

if exist config.py del /f /s /q config.py
if exist hequ.py del /f /s /q hequ.py
if exist pid.txt del /f /s /q pid.txt
if exist _apidoc.html del /f /s /q _apidoc.html
if exist export.bat del /f /s /q export.bat

del /S *.pyc
del /S json\*.txt