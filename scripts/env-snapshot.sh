#!/bin/bash

OUTPUT="docs/environment-snapshot.md"

echo "# Environment Snapshot" > "$OUTPUT"
echo "" >> "$OUTPUT"

echo "Generated: $(date)" >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## VS Code" >> "$OUTPUT"
code --version | head -1 >> "$OUTPUT"
echo "" >> "$OUTPUT"

echo "## Node" >> "$OUTPUT"
node -v >> "$OUTPUT" 2>/dev/null

echo "" >> "$OUTPUT"

echo "## NPM" >> "$OUTPUT"
npm -v >> "$OUTPUT" 2>/dev/null

echo "" >> "$OUTPUT"

echo "## Python" >> "$OUTPUT"
python3 --version >> "$OUTPUT" 2>/dev/null

echo "" >> "$OUTPUT"

echo "## Git" >> "$OUTPUT"
git --version >> "$OUTPUT"

echo "" >> "$OUTPUT"

echo "## Ripgrep" >> "$OUTPUT"
rg --version | head -1 >> "$OUTPUT"

echo "" >> "$OUTPUT"

echo "## OS" >> "$OUTPUT"
sw_vers >> "$OUTPUT"

echo "" >> "$OUTPUT"

echo "## CPU" >> "$OUTPUT"
sysctl -n machdep.cpu.brand_string >> "$OUTPUT"

echo "" >> "$OUTPUT"

echo "## PATH" >> "$OUTPUT"
echo '```' >> "$OUTPUT"
echo "$PATH" >> "$OUTPUT"
echo '```' >> "$OUTPUT"

echo ""
echo "Snapshot saved:"
echo "$OUTPUT"

