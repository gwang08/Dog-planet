#!/bin/bash
# Pha 3a: join per-scene Veo clips into one named scene file each (memorable names).
cd "$(dirname "$0")/../assets/scenes"

join(){ # $1=output  $2..=input clips
  local out="$1"; shift
  if [ "$#" -eq 1 ]; then
    ffmpeg -y -i "$1" -c copy "$out" >/dev/null 2>&1 && echo "OK $out (1 clip)" || echo "FAIL $out"
    return
  fi
  local args="" filt="" n=0
  for f in "$@"; do args="$args -i $f"; filt="$filt[$n:v][$n:a]"; n=$((n+1)); done
  ffmpeg -y $args -filter_complex "${filt}concat=n=$n:v=1:a=1[v][a]" -map "[v]" -map "[a]" \
    -c:v libx264 -pix_fmt yuv420p -c:a aac "$out" >/dev/null 2>&1 && echo "OK $out ($n clips)" || echo "FAIL $out"
}

join chapter1-v1-wakeup.mp4    v1-1.mp4 v1-2.mp4 v1-3.mp4
join chapter1-v2a-charge.mp4   v2a-1.mp4
join chapter1-v2b-scout.mp4    v2b-1.mp4
join chapter1-v3-moodeng.mp4   v3-1.mp4 v3-2.mp4
join chapter1-v4-penguin.mp4   v4-1.mp4 v4-2.mp4
join chapter1-v5a-defeat.mp4   v5a-1.mp4 v5a-2.mp4
join chapter1-v5b-trapped.mp4  v5b-1.mp4
# endtrue-2 pending Veo quota — ENDTRUE uses endtrue-1 for now (add endtrue-2 on next reset)
if [ -f endtrue-2.mp4 ]; then join chapter1-endtrue-chase.mp4 endtrue-1.mp4 endtrue-2.mp4; else join chapter1-endtrue-chase.mp4 endtrue-1.mp4; fi
join chapter1-endbad-caught.mp4 endbad-1.mp4
echo "ALLJOINED"
ls -la chapter1-*.mp4
