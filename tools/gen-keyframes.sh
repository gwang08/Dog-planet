#!/bin/bash
# Compose all Chapter-1 keyframes from OUR OWN reference art (faithful characters + ship).
# Requires GEMINI_API_KEY in env. Output → assets/scenes/.
set -e
cd "$(dirname "$0")/../assets"
PY=~/.claude/skills/.venv/bin/python3
CS=../tools/compose-scene.py
DOG=mame-hero.png; SHIP=ship-pump.png; PILL=pill.png; MOO=moodeng.png; PEN=boss-penguin.png; JET=mame-ship.png; CITY=scenes/v1-b.png

STYLE="SOFT cute cartoon illustration, gentle painterly shading, SAME art style as the shiba character. MAME is a BIPEDAL shiba standing UPRIGHT on two legs like a human (black/white fur, scarf, paw pendant). Any citizens are CUTE little cartoon meme-animal creatures (NOT realistic humans, NOT grey aliens). Setting: a neon alien CITY. CLEAN — absolutely NO on-screen text, NO doge-face holograms, NO floating words."

gen(){ echo "=== $1 ==="; $PY $CS "scenes/$1" "$2" "${@:3}"; }

# V2A — charge down the street
gen v2a.png "$STYLE SCENE: MAME sprints FORWARD down the neon city street, determined, fists clenched, cute meme-animal citizens clutching green pills scattering aside. The red PUMP-01 airship looms far ahead. Dynamic wide cinematic shot." $DOG $PILL $CITY
# V2B — scout from an alley
gen v2b.png "$STYLE SCENE: MAME crouches low, pressed against a dark alley wall, peeking out toward the red PUMP-01 airship docked ahead. Tense, stealthy, moody shadows. Wide cinematic shot." $DOG $SHIP
# V3a — Moo Deng blocks
gen v3a.png "$STYLE SCENE: MOO DENG (the small hippo character from image 2) stands in the middle of the road with arms spread WIDE, BLOCKING MAME's path to the red PUMP-01 airship behind her. MAME faces her. Tense standoff, NOT fighting. Wide cinematic shot." $DOG $MOO $SHIP
# V3b — Moo Deng steps aside
gen v3b.png "$STYLE SCENE: MOO DENG (image 2) lowers her arms and reluctantly steps ASIDE, head down, while MAME walks past her. Emotional, NOT fighting. Medium cinematic shot, neon city." $DOG $MOO
# V4a — Penguin steps in
gen v4a.png "$STYLE SCENE: MAME stands at the foot of the huge red PUMP-01 airship. PENGUIN (the penguin villain from image 2) slides in front of the ship, flippers crossed, smug, blocking MAME. Tense confrontation. Wide cinematic shot." $DOG $PEN $SHIP
# V4b — Penguin menacing closeup
gen v4b.png "$STYLE SCENE: PENGUIN (image 2) leans toward MAME, menacing and arrogant, pointing a flipper. MAME glares back, defiant. Dramatic medium shot, neon glow." $DOG $PEN
# V5Aa — MAME attacks
gen v5a-a.png "$STYLE SCENE: MAME GLOWS bright golden with energy and LUNGES at PENGUIN (image 2) in a burst of golden meme energy. Dynamic action, impact, dramatic. Wide cinematic shot." $DOG $PEN
# V5Ab — Penguin knocked back
gen v5a-b.png "$STYLE SCENE: PENGUIN (image 1) staggers backward, knocked off balance, stumbling toward the red PUMP-01 airship behind him. Defeated, panicked. Wide cinematic shot, neon city." $PEN $SHIP
# V5B — MAME trapped
gen v5b.png "$STYLE SCENE: MAME is caught inside a glowing energy net/cage. PENGUIN (image 2) stands over him, smug and victorious. Dark, ominous, neon glow. Wide cinematic shot." $DOG $PEN
# END-TRUE a — Penguin flees toward the moon
gen endtrue-a.png "$STYLE SCENE: PENGUIN (image 1) leaps aboard the red PUMP-01 airship (image 2) as it BLASTS upward into the night sky toward a huge glowing MOON. Trails of light. Epic wide cinematic shot, stars." $PEN $SHIP
# END-TRUE b — MAME chases on his jet
gen endtrue-b.png "$STYLE SCENE: MAME rides the red-and-white number-77 fighter JET (image 1) rocketing UP through the starry night sky, chasing the distant red PUMP-01 airship (image 2) toward a huge glowing MOON. Epic chase, motion trails. Wide cinematic shot." $JET $SHIP
# END-BAD — captured
gen endbad.png "$STYLE SCENE: MAME slumps trapped inside a glowing energy cage on the ground, while the red PUMP-01 airship (image 2) flies away into the distant dark sky. Bleak, lonely, neon city ruins. Wide cinematic shot." $DOG $SHIP

echo "ALLKEYFRAMES_DONE"
ls -la scenes/v2a.png scenes/v2b.png scenes/v3a.png scenes/v3b.png scenes/v4a.png scenes/v4b.png scenes/v5a-a.png scenes/v5a-b.png scenes/v5b.png scenes/endtrue-a.png scenes/endtrue-b.png scenes/endbad.png
