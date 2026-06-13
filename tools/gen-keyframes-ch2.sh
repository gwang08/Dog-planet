#!/bin/bash
# Compose all Chapter-2 keyframes from OUR OWN reference art (faithful MAME, ships, Penguin, Sahur).
# Requires GEMINI_API_KEY. Output → assets/scenes/c2-*.png
set -e
cd "$(dirname "$0")/../assets"
PY=~/.claude/skills/.venv/bin/python3
CS=../tools/compose-scene.py
DOG=mame-hero.png; JET=mame-ship.png; SHIP=ship-pump.png; PEN=boss-penguin.png; SAH=sahur.png

STYLE="SOFT cute cartoon illustration, gentle painterly shading, SAME art style as the shiba. MAME is a BIPEDAL black-and-white shiba standing UPRIGHT on two legs like a human (dark scarf, paw-print pendant). Setting: a neon Pump.fun base on the DARK SIDE OF THE MOON — grey cratered lunar ground, glowing neon metallic base structures, Earth/Dog Planet shining in a black starry sky. CLEAN — absolutely NO on-screen text, NO doge-face holograms, NO floating words."

gen(){ echo "=== $1 ==="; $PY $CS "scenes/$1" "$2" "${@:3}"; }

# V1 — arrival (MAME + his jet + the docked PUMP-01 airship)
gen c2-v1.png "$STYLE SCENE: MAME stands on the grey cratered moon surface beside his red-and-white number-77 fighter JET (image 2). Ahead looms a huge neon Pump.fun lunar base; the red PUMP-01 pill-shaped airship (image 3) is docked. Earth glows in the starry sky. Wide cinematic shot." $DOG $JET $SHIP
# V2A — charge front gate
gen c2-v2a.png "$STYLE SCENE: MAME charges forward toward the glowing front gate of the neon Pump.fun lunar base, determined, fists clenched, moon dust kicking up. Dynamic wide cinematic shot." $DOG
# V2B — stealth airlock
gen c2-v2b.png "$STYLE SCENE: MAME crouches low, sneaking through a dark metallic cargo airlock of the lunar base, glowing neon panels, tense shadows. Wide cinematic shot." $DOG
# V3 — Penguin returns
gen c2-v3.png "$STYLE SCENE: inside the neon lunar base hall, the PENGUIN villain (image 2) stands arrogantly blocking the path; MAME faces him. Metallic sci-fi interior, purple-blue lights. Cinematic." $DOG $PEN
# V4 — Tung Tung Sahur appears
gen c2-v4.png "$STYLE SCENE: TUNG TUNG SAHUR (image 2 — the tall walking wooden-log creature with a carved grinning face and a wooden baseball bat) looms and blocks the path inside the neon lunar base; MAME faces him. Ominous purple-blue lighting. Wide cinematic shot." $DOG $SAH
# V5A — defeat Sahur
gen c2-v5a.png "$STYLE SCENE: MAME blazes with bright golden energy and strikes TUNG TUNG SAHUR (image 2 — wooden-log creature with bat), who cracks, splinters and staggers backward in a burst of golden meme energy. Dynamic action, neon lunar base. Wide cinematic shot." $DOG $SAH
# V5B — defeated
gen c2-v5b.png "$STYLE SCENE: MAME knocked down and cornered on the lunar floor, TUNG TUNG SAHUR (image 2 — wooden-log creature) looms over him with its wooden bat raised, eerie grin, dark ominous neon base. Wide cinematic shot." $DOG $SAH
# ENDTRUE — the Pump.fun core
gen c2-endtrue.png "$STYLE SCENE: MAME stands before a massive glowing pulsing Pump.fun CORE — a giant energy reactor of swirling glowing capsules/pills and light deep inside the lunar base, Earth visible through a window. Awe and dread. Epic wide cinematic shot." $DOG
# ENDBAD — fallen
gen c2-endbad.png "$STYLE SCENE: MAME fallen and defeated on the cold grey lunar floor of the neon Pump.fun base, the red PUMP-01 airship (image 2) flying away into the black starry sky. Bleak, lonely, cinematic." $DOG $SHIP

echo "C2_KEYFRAMES_DONE"
ls -la scenes/c2-*.png
