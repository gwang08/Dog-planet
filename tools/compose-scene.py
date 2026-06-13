#!/usr/bin/env python3
"""Composite multiple of OUR OWN character/ship PNGs into one cinematic scene frame
using Gemini image model (multi-image input keeps each asset faithful — no UFO redraw).

Usage:
  GEMINI_API_KEY=... python3 compose-scene.py OUT.png "prompt" img1.png [img2.png ...]
"""
import sys, os, mimetypes
from pathlib import Path
from google import genai
from google.genai import types

def main():
    out, prompt, imgs = sys.argv[1], sys.argv[2], sys.argv[3:]
    client = genai.Client(api_key=os.environ['GEMINI_API_KEY'])
    parts = [prompt]
    for p in imgs:
        data = Path(p).read_bytes()
        mt = mimetypes.guess_type(p)[0] or 'image/png'
        parts.append(types.Part.from_bytes(data=data, mime_type=mt))
    config = types.GenerateContentConfig(
        response_modalities=['IMAGE'],
        image_config=types.ImageConfig(aspect_ratio='16:9'),
    )
    resp = client.models.generate_content(
        model='gemini-3.1-flash-image-preview', contents=parts, config=config)
    for part in resp.candidates[0].content.parts:
        if getattr(part, 'inline_data', None):
            Path(out).write_bytes(part.inline_data.data)
            print('saved', out)
            return
    print('NO IMAGE in response', file=sys.stderr); sys.exit(1)

if __name__ == '__main__':
    main()
