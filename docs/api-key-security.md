# API Key Security

Do not put API keys in frontend code.

## Rules

- Store API keys in environment variables.
- Do not commit `.env`.
- Keep real provider calls in local CLI or a user-controlled backend.
- Hosted demos must use `MockProvider` only.
- Never print full API keys in logs, reports, manifests, screenshots, or errors.

## DashScope

PowerShell:

```powershell
$env:DASHSCOPE_API_KEY="sk-your-key"
$env:DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com"
```

Bash:

```bash
export DASHSCOPE_API_KEY="sk-your-key"
export DASHSCOPE_BASE_URL="https://dashscope.aliyuncs.com"
```

Use Beijing keys with `https://dashscope.aliyuncs.com` and Singapore keys with `https://dashscope-intl.aliyuncs.com`.
