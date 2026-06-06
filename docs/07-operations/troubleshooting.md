# Troubleshooting

---

## Template

Date:

Symptoms:

Investigation:

Root Cause:

Resolution:

Prevention:

---

## 2026-06-04

Issue:
Roo stuck at API Request

Symptoms:
- Infinite API Request
- No LiteLLM logs
- No network activity

Investigation:
- LiteLLM healthy
- Vertex healthy
- Gemini healthy
- rg installed

Root Cause:
Roo 3.54.0 searched for:

node_modules/@vscode/ripgrep/bin

VS Code 1.123 ships:

node_modules/@vscode/ripgrep-universal/bin/darwin-arm64/rg

Resolution:
Created compatibility symlink.

