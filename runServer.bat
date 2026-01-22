cd /d "%~dp0"
echo %cd%
start python "%~dp0\python\openLocalhost.py"
python "%~dp0\python\server.py"