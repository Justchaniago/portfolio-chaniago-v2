# LiteLLM Runbook

## Health Check

curl http://localhost:4000/health

## Models

curl http://localhost:4000/v1/models

## Chat Test

curl -X POST http://localhost:4000/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{"model":"gemini-3.5-flash","messages":[{"role":"user","content":"hello"}]}'

## Logs

tail -f /Users/f/litellm.log

## Error Logs

tail -f /Users/f/litellm-error.log

