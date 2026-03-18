<?php
$logFile = __DIR__ . '/../uploads/email_logs.txt';

if (!file_exists($logFile)) {
    die("<h2>No emails sent yet.</h2><p>The log file doesn't exist.</p>");
}

$content = file_get_contents($logFile);
?>
<!DOCTYPE html>
<html>
<head>
    <title>HeritX Email Logs</title>
    <style>
        body { font-family: monospace; max-width: 800px; margin: 20px auto; background: #f4f4f4; }
        .email-block { background: white; padding: 20px; border-left: 5px solid #4CAF50; margin-bottom: 20px; white-space: pre-wrap; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        h1 { font-family: sans-serif; }
    </style>
</head>
<body>
    <h1>Sent Email Logs (Localhost)</h1>
    <div class="email-block">
        <?php echo htmlspecialchars($content); ?>
    </div>
</body>
</html>
