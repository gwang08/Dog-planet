#!/bin/bash
# Pha 3b: transcribe each joined scene → timestamped subtitle JSON in scenes/subs/<name>.json
cd "$(dirname "$0")/../assets/scenes"
mkdir -p subs
PY=~/.claude/skills/.venv/bin/python3
SCRIPT=~/.claude/skills/ai-multimodal/scripts/gemini_batch_process.py
PROMPT='Transcribe ONLY the spoken dialogue. Return STRICT JSON array of {"start":sec,"end":sec,"text":"..."}, short phrases max 8 words, precise timestamps. JSON only.'

for f in chapter1-v1-wakeup chapter1-v2a-charge chapter1-v2b-scout chapter1-v3-moodeng chapter1-v4-penguin chapter1-v5a-defeat chapter1-v5b-trapped chapter1-endtrue-chase chapter1-endbad-caught; do
  if [ -f "$f.mp4" ]; then
    echo "=== $f ==="
    $PY $SCRIPT --task transcribe --files "$f.mp4" --prompt "$PROMPT" 2>/dev/null | sed -n '/\[/,/\]/p' > "subs/$f.json"
    cat "subs/$f.json"
  fi
done
echo "ALLSUBS_DONE"
