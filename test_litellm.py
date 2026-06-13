import litellm
import os

litellm.set_verbose=True
try:
    response = litellm.completion(
        model="vertex_ai/claude-opus-4-8@default",
        messages=[{"role": "user", "content": "Hello"}],
        vertex_project="antigravity-backend-498211",
        vertex_location="us-east5" # Trying a specific region instead of global
    )
    print(response)
except Exception as e:
    print(f"Error: {e}")
