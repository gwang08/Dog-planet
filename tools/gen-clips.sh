#!/bin/bash
# Pha 2: generate all Chapter-1 Veo clips (single-frame locked to each keyframe + spoken dialogue).
# Continues past failures (logs FAIL) so we can retry individually. Requires GEMINI_API_KEY.
cd "$(dirname "$0")/../assets"
PY=~/.claude/skills/.venv/bin/python3
SCRIPT=~/.claude/skills/ai-multimodal/scripts/gemini_batch_process.py
LOCK="Animate THIS EXACT frame. Keep the background, characters, neon city and ship EXACTLY as shown — do NOT change scenery, do NOT invent text. Only add natural motion."

gen(){ # $1=out $2=keyframe $3=prompt
  echo ">>> GEN $1"
  local res path
  res=$($PY $SCRIPT --task generate-video --model veo-3.1-fast-generate-preview --resolution 720p --aspect-ratio 16:9 \
        --reference-images "scenes/$2" --prompt "$3" 2>/dev/null | grep "Generated video:")
  path=$(echo "$res" | sed 's/.*Generated video: //' | tr -d '[:space:]')
  if [ -n "$path" ] && [ -f "$path" ]; then mv "$path" "scenes/$1"; echo "OK $1"; else echo "FAIL $1"; fi
}

# ---- V1 WAKE-UP (regen, 3 clips) ----
gen v1-1.mp4 v1-a.png "$LOCK The sitting shiba slowly wakes, eyes flutter open, lifts its head, dazed. Soft ambient city sounds. The shiba speaks softly, young brave male voice: 'Ugh... where am I?'"
gen v1-2.mp4 v1-b.png "$LOCK The upright shiba looks around at the chaotic neon city, confused and hopeful. The shiba speaks, young brave male voice: 'Is this... Dog Planet? My home?'"
gen v1-3.mp4 v1-c.png "$LOCK The shiba tilts its head up toward the red airship, realization dawning. The shiba speaks, young brave male voice, grave: 'No. This isn't home. That airship — the Pump dot fun mothership. So the legends were real.'"

# ---- V2A CHARGE / V2B SCOUT (1 each) ----
gen v2a-1.mp4 v2a.png "$LOCK The shiba sprints forward down the street, determined, citizens scatter. The shiba speaks, fierce young male voice: 'Pump dot fun burned my home. Time to burn it down — no more hiding!'"
gen v2b-1.mp4 v2b.png "$LOCK The shiba creeps along the alley wall, peeking toward the ship, cautious. The shiba speaks low, young male voice: 'An operation this big... I need to find its weak point first.'"

# ---- V3 MOO DENG (2 clips, no fight) ----
gen v3-1.mp4 v3a.png "$LOCK Moo Deng the hippo holds her arms out, blocking the road, pleading. Moo Deng speaks, soft worried female voice: 'Stop! You can't destroy that ship!' Then the shiba replies firmly, young male voice: 'Step aside, Moo Deng.'"
gen v3-2.mp4 v3b.png "$LOCK The shiba walks forward as Moo Deng lowers her arms and steps aside, head down. Shiba, young male voice: 'Pump dot fun burned my home. That ship goes down.' Moo Deng, sad female voice: 'I can't stop you, can I.'"

# ---- V4 PENGUIN (2 clips) ----
gen v4-1.mp4 v4a.png "$LOCK The penguin slides in front of the airship, flippers crossed, smug. Shiba, young male voice: 'Now... time to tear this ship apart.' Penguin replies, deep arrogant villain voice: 'Touch my ship and you're scrap, mutt.'"
gen v4-2.mp4 v4b.png "$LOCK The penguin leans in menacing, pointing a flipper; the shiba glares back. Penguin, deep arrogant voice: 'I run Pump dot fun. Pump and dump is forever.' Shiba, defiant: 'Not anymore. This ship ends tonight.'"

# ---- V5A DEFEAT (2 clips) ----
gen v5a-1.mp4 v5a-a.png "$LOCK The shiba blazes with golden energy and lunges at the penguin in a burst of light. Shiba shouts, fierce young male voice: 'For Dog Planet — and every real meme you killed!'"
gen v5a-2.mp4 v5a-b.png "$LOCK The penguin staggers backward, knocked off balance, stumbling toward the airship. Penguin cries out, panicked deep voice: 'Argh! You haven't won yet, Shiba!'"

# ---- V5B TRAPPED (1 clip) ----
gen v5b-1.mp4 v5b.png "$LOCK The shiba struggles inside a glowing energy cage; the penguin looms smug. Penguin speaks, cruel deep voice: 'Charging in blind? Foolish. Pump dot fun always wins.'"

# ---- END-TRUE CHASE (2 clips) ----
gen endtrue-1.mp4 endtrue-a.png "$LOCK The penguin leaps aboard the red airship as it blasts upward toward the huge moon, trailing light. Penguin shouts, deep voice: 'This isn't finished!'"
gen endtrue-2.mp4 endtrue-b.png "$LOCK The shiba on the number-77 jet rockets up through the stars chasing the airship toward the moon. Shiba declares, determined young male voice: 'Run all you want, Penguin. I'll chase you to the moon and back!'"

# ---- END-BAD CAUGHT (1 clip) ----
gen endbad-1.mp4 endbad.png "$LOCK The shiba slumps in the glowing cage as the airship shrinks into the distant sky. A somber deep narrator voice: 'MAME was captured. Pump dot fun tightens its grip on the galaxy.'"

echo "ALLCLIPS_DONE"
ls -la scenes/*.mp4 | grep -E "v1-|v2a-|v2b-|v3-|v4-|v5a-|v5b-|endtrue-|endbad-"
