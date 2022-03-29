@echo off
:: svn导出目录
set "folder=%USERPROFILE%\Desktop\serverExport"
:: 线上svn本地仓库
:: set "copyfolder=F:\svn.legu.cc\code76"

echo %folder%

rd /s /q %folder%

svn.exe update --username ddb --password ddb --no-auth-cache res\samejson
svn.exe update --username ddb --password ddb --no-auth-cache 
svn.exe export --username ddb --password ddb --no-auth-cache ./ %folder%

cd /d %folder%

if exist Explanation rd /s /q Explanation
if exist log rd /s /q log
if exist huodongjson rd /s /q huodongjson
if exist doc rd /s /q doc
if exist docs rd /s /q docs
if exist tools rd /s /q tools
if exist tests rd /s /q tests

if exist config.py del /f /s /q config.py
if exist hequ.py del /f /s /q hequ.py
if exist pid.txt del /f /s /q pid.txt
if exist _apidoc.html del /f /s /q _apidoc.html
if exist export.bat del /f /s /q export.bat
if exist exportAndCopy.bat del /f /s /q exportAndCopy.bat

del /S *.pyc
del /S json\*.txt


:: xcopy /s /e /c /y /h /r %folder%\* %copyfolder%\
pause
