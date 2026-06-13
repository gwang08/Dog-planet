#!/bin/bash
# Finish Chapter 1: gen the 7 missing clips first, then regen MAME-voice scenes for a
# CONSISTENT young-adult MALE voice. Continues past failures (logs FAIL). Needs GEMINI_API_KEY.
cd "$(dirname "$0")/../assets"
PY=~/.claude/skills/.venv/bin/python3
SCRIPT=~/.claude/skills/ai-multimodal/scripts/gemini_batch_process.py
LOCK="Animate THIS EXACT frame. Keep the background, characters, neon city and ship EXACTLY as shown — do NOT change scenery, do NOT invent text. Only add natural motion."
VM="MAME speaks in a YOUNG ADULT MALE voice — heroic, masculine, confident, slightly raspy (NEVER female)."
VP="The penguin speaks in a DEEP, arrogant, gravelly MALE villain voice."
VW="Moo Deng speaks in a soft, worried FEMALE voice."

gen(){ echo ">>> GEN $1"; local res path
  res=$($PY $SCRIPT --task generate-video --model veo-3.1-fast-generate-preview --resolution 720p --aspect-ratio 16:9 \
        --reference-images "scenes/$2" --prompt "$3" 2>/dev/null | grep "Generated video:")
  path=$(echo "$res" | sed 's/.*Generated video: //' | tr -d '[:space:]')
  if [ -n "$path" ] && [ -f "$path" ]; then mv "$path" "scenes/$1"; echo "OK $1"; else echo "FAIL $1"; fi
}

# === 7 MISSING (complete the story) ===
gen v4-2.mp4 v4b.png "$LOCK The penguin leans in menacing, the shiba glares back. $VP Penguin: 'I run Pump dot fun. Pump and dump is forever.' $VM MAME: 'Not anymore. This ship ends tonight.'"
gen v5a-1.mp4 v5a-a.png "$LOCK The shiba blazes with golden energy and lunges at the penguin. $VM MAME shouts: 'For Dog Planet — and every real meme you killed!'"
gen v5a-2.mp4 v5a-b.png "$LOCK The penguin staggers backward toward the airship. $VP Penguin cries out, panicked: 'Argh! You haven't won yet, Shiba!'"
gen v5b-1.mp4 v5b.png "$LOCK The shiba struggles in a glowing energy cage; the penguin looms. $VP Penguin, cruel: 'Charging in blind? Foolish. Pump dot fun always wins.'"
gen endtrue-1.mp4 endtrue-a.png "$LOCK The penguin leaps aboard the airship as it blasts up toward the huge moon. $VP Penguin shouts: 'This isn't finished!'"
gen endtrue-2.mp4 endtrue-b.png "$LOCK The shiba on the number-77 jet rockets up through the stars chasing the airship toward the moon. $VM MAME declares: 'Run all you want, Penguin. I'll chase you to the moon and back!'"
gen endbad-1.mp4 endbad.png "$LOCK The shiba slumps in the glowing cage as the airship shrinks into the sky. A somber deep MALE narrator: 'MAME was captured. Pump dot fun tightens its grip on the galaxy.'"

# === REGEN MAME-voice scenes (consistent male voice) ===
gen v1-1.mp4 v1-a.png "$LOCK The sitting shiba slowly wakes, eyes flutter open, dazed. $VM MAME, softly: 'Ugh... where am I?'"
gen v1-2.mp4 v1-b.png "$LOCK The upright shiba looks around the chaotic neon city, confused and hopeful. $VM MAME: 'Is this... Dog Planet? My home?'"
gen v1-3.mp4 v1-c.png "$LOCK The shiba tilts its head up toward the red airship, realization dawning. $VM MAME, grave: 'No. This isn't home. That airship — the Pump dot fun mothership. So the legends were real.'"
gen v2a-1.mp4 v2a.png "$LOCK The shiba sprints forward down the street, citizens scatter. $VM MAME, fierce: 'Pump dot fun burned my home. Time to burn it down — no more hiding!'"
gen v2b-1.mp4 v2b.png "$LOCK The shiba creeps along the alley wall, peeking toward the ship. $VM MAME, low: 'An operation this big... I need to find its weak point first.'"

echo "FINISH_DONE"
