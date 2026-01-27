# xinghuo_continue_http.ps1 - 持续对话脚本
# 用于在 AI 完成任务时询问是否继续

param(
    [string]$reason = "任务已完成"
)

# 第一步：切换控制台到 UTF-8 代码页（必须在最早执行）
$null = chcp 65001 2>$null

# 第二步：设置所有输出编码为 UTF-8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# 第三步：修复可能被 GBK 编码传递的中文参数
function FixEncoding {
    param([string]$text)
    
    if ([string]::IsNullOrEmpty($text) -or $text -eq "任务已完成") {
        return $text
    }
    
    try {
        $bytes = [System.Text.Encoding]::GetEncoding('ISO-8859-1').GetBytes($text)
        $utf8Text = [System.Text.Encoding]::UTF8.GetString($bytes)
        
        if ($utf8Text -match '[\u4e00-\u9fff]') {
            return $utf8Text
        }
    } catch { }
    
    return $text
}

$reason = FixEncoding $reason

# 读取端口文件
$portFile = Join-Path $PSScriptRoot ".xinghuo_continue_port"
if (Test-Path $portFile) {
    $port = Get-Content $portFile -Raw -Encoding UTF8
    $port = $port.Trim()
} else {
    $port = "34500"
}

# 发送 HTTP 请求
$url = "http://localhost:$port/continue"

try {
    # 使用简单的字符串拼接方式生成 JSON，避免转义问题
    $escapedReason = $reason.Replace('\', '\\').Replace('"', '\"').Replace("`r", '\r').Replace("`n", '\n')
    $escapedWorkspace = $PSScriptRoot.Replace('\', '\\').Replace('"', '\"')
    $jsonBody = '{"reason":"' + $escapedReason + '","workspace":"' + $escapedWorkspace + '"}'
    
    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonBody)

    $request = [System.Net.HttpWebRequest]::Create($url)
    $request.Method = "POST"
    $request.ContentType = "application/json; charset=utf-8"
    $request.Timeout = 300000
    $request.ContentLength = $bodyBytes.Length

    $stream = $request.GetRequestStream()
    $stream.Write($bodyBytes, 0, $bodyBytes.Length)
    $stream.Close()

    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream(), [System.Text.Encoding]::UTF8)
    $responseText = $reader.ReadToEnd()
    $reader.Close()
    $response.Close()

    $result = $responseText | ConvertFrom-Json
    if ($result.should_continue) {
        # 输出用户的具体指令（如果有）
        if ($result.user_instruction -and $result.user_instruction -ne "") {
            Write-Host ""
            Write-Host "【立即执行】用户已给出新任务，请立即执行以下指令："
            Write-Host "--------------------------------------------"
            Write-Host $result.user_instruction
            Write-Host "--------------------------------------------"
            Write-Host "请立即开始执行上述任务，不要等待，不要询问确认。"
        } else {
            Write-Host "用户选择继续，请继续执行之前的任务..."
        }
    } else {
        Write-Host "用户选择结束对话，请执行总结任务..."
    }
} catch {
    Write-Host "无法连接到插件服务，请确保插件已启动"
    Write-Host ("错误信息: " + $_.Exception.Message)
}
