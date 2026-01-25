# xinghuo_continue_http.ps1
# PowerShell 持续对话 HTTP 调用脚本

param (
    [string]$reason = "任务已完成",
    [string]$workspace = "c:\\Users\\shuli\\Mizuno-16-Craft-BE-CIT"
)

# 设置控制台编码为 UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
chcp 65001 | Out-Null

# 修复从 GBK 终端传入的乱码参数
try {
    $gbk = [System.Text.Encoding]::GetEncoding('GB2312')
    $utf8 = [System.Text.Encoding]::UTF8
    $reasonBytes = $gbk.GetBytes($reason)
    $fixedReason = $utf8.GetString($reasonBytes)
    # 只有当转换后看起来像有效中文时才使用修复后的值
    if ($fixedReason -match '[\u4e00-\u9fff]') {
        $reason = $fixedReason
    }
} catch {
    # 转换失败则保持原值
}

# 读取端口文件
$portFile = Join-Path $workspace ".xinghuo_continue_port"
if (Test-Path $portFile) {
    $port = (Get-Content $portFile -Raw -Encoding UTF8).Trim()
} else {
    $port = "34872"
}

# 构建 JSON 请求体
$body = @{
    jsonrpc = "2.0"
    id = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    method = "tools/call"
    params = @{
        name = "xinghuo_continue"
        arguments = @{
            reason = $reason
            workspace = $workspace
        }
    }
} | ConvertTo-Json -Depth 10

# 发送请求
$bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
try {
    $response = Invoke-RestMethod -Uri "http://localhost:$port" -Method Post -Body $bodyBytes -ContentType "application/json; charset=utf-8" -TimeoutSec 300
    Write-Output ($response.result.content[0].text)
} catch {
    Write-Error "调用失败: $_"
}
