$logFile = Join-Path $PSScriptRoot "dev-output.log"
$node = "C:\Program Files\nodejs\node.exe"
$next = Join-Path $PSScriptRoot "node_modules\next\dist\bin\next"
$env:NODE_ENV = "development"
& $node $next dev *>> $logFile
