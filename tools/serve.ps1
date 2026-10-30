# Local preview server for this site — no Node.js or Python needed.
# Usage (from the project folder):
#   powershell -ExecutionPolicy Bypass -File tools\serve.ps1
# Then open http://localhost:8080/ in your browser. Press Ctrl+C to stop.
param([int]$Port = 8080)

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$types = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
  ".svg" = "image/svg+xml"; ".png" = "image/png"; ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".webp" = "image/webp"
  ".pdf" = "application/pdf"; ".xml" = "application/xml"; ".txt" = "text/plain; charset=utf-8"; ".json" = "application/json"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/  (Ctrl+C to stop)"

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $urlPath = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    $file = [IO.Path]::GetFullPath((Join-Path $root $urlPath.TrimStart("/")))
    $status = 200

    # Folders need a trailing slash so relative links resolve, like on GitHub Pages.
    if ((Test-Path $file -PathType Container) -and -not $urlPath.EndsWith("/")) {
      $ctx.Response.Redirect($urlPath + "/")
      $ctx.Response.Close()
      continue
    }
    if (Test-Path $file -PathType Container) { $file = Join-Path $file "index.html" }
    if (-not $file.StartsWith($root + [IO.Path]::DirectorySeparatorChar) -or -not (Test-Path $file -PathType Leaf)) {
      $file = Join-Path $root "404.html"
      $status = 404
    }

    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $ctx.Response.StatusCode = $status
    $ctx.Response.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.Close()
  }
} finally {
  $listener.Stop()
}
