"""
Generate the complete LingXi audio palette via Stable Audio 2.5 official API.

27 tracks total:
  - 10 background music loops (30-60s, instrumental, seamless) → assets/audio/music/
  - 17 action SFX (1-8s, single events)                        → assets/audio/sfx/

Aesthetic: Eastern mystical / zen / spiritual / contemplative.
Target market: US + Europe primary.

Setup:
  1. https://platform.stability.ai/ -> Create account
  2. Account -> API Keys -> Create
  3. Copy the sk-... key
  4. Run: python generate_music.py YOUR_API_KEY
     OR set env: $env:STABILITY_API_KEY="sk-..."; python generate_music.py

Cost: 27 x 20 credits = 540 credits ≈ $5.40 USD (well within 1025-credit budget).
Output:
  music -> C:/Dev/LingXi/assets/audio/music/*.mp3
  sfx   -> C:/Dev/LingXi/assets/audio/sfx/*.mp3
"""
import os
import sys
import time
import requests
from pathlib import Path

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

API_KEY = os.environ.get("STABILITY_API_KEY") or (sys.argv[1] if len(sys.argv) > 1 else "")
if not API_KEY or not API_KEY.startswith("sk-"):
    print("ERROR: provide Stability AI API key via env STABILITY_API_KEY or as arg")
    print("       (key must start with 'sk-')")
    sys.exit(1)

# NOTE: URL uses 'stable-audio-2'; model parameter uses 'stable-audio-2.5'
ENDPOINT = "https://api.stability.ai/v2beta/audio/stable-audio-2/text-to-audio"

BASE_DIR = Path(__file__).parent.parent / "assets" / "audio"
MUSIC_DIR = BASE_DIR / "music"
SFX_DIR = BASE_DIR / "sfx"
MUSIC_DIR.mkdir(parents=True, exist_ok=True)
SFX_DIR.mkdir(parents=True, exist_ok=True)

# Stability AI pricing: 20 credits per generation regardless of duration.
CREDITS_PER_TRACK = 20
USD_PER_CREDIT = 0.01  # 1000 credits = $10

# =============================================================================
# THE 27-TRACK PALETTE
# =============================================================================
TRACKS = [
    # -------------------------------------------------------------------------
    # A. BACKGROUND MUSIC LOOPS (10 tracks, 30-60s each)
    # -------------------------------------------------------------------------
    {
        "name": "music-01-pet-idle",
        "category": "music",
        "duration": 60,
        "prompt": (
            "calm spirit pet companion ambient, ethereal Eastern meditation, "
            "soft kalimba arpeggio, tibetan singing bowl, gentle bamboo flute, "
            "warm sustained string pad, breathing space, contemplative zen home, "
            "peaceful daily presence, 60 seconds seamless loop, instrumental, "
            "no vocals, no drums, no percussion"
        ),
    },
    {
        "name": "music-02-fortune-reveal",
        "category": "music",
        "duration": 60,
        "prompt": (
            "daily fortune reveal background, mystical destiny chart, "
            "soft erhu melody, ambient hang drum, distant temple wind chimes, "
            "warm cinematic pad, hopeful contemplative, ceremonial Eastern, "
            "60 seconds seamless loop, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "music-03-face-reading-eye",
        "category": "music",
        "duration": 60,
        "prompt": (
            "introspective face reading scene, contemplative gentle piano, "
            "soft whispering ambient pad, subtle glass wind chimes, "
            "thoughtful focused gaze, cinematic mystical, light reveal, "
            "60 seconds seamless loop, instrumental zen background, "
            "no vocals, no drums, no percussion"
        ),
    },
    {
        "name": "music-04-fengshui-heart",
        "category": "music",
        "duration": 60,
        "prompt": (
            "feng shui compass GPS background, harmonic spatial resonance, "
            "deep cosmic drone, soft hang drum pulse, distant temple bells, "
            "energy flow ambient, slow breathing space, Eastern mystical, "
            "60 seconds seamless loop, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "music-05-divination-oracle",
        "category": "music",
        "duration": 60,
        "prompt": (
            "ancient oracle divination ceremony, ceremonial wooden percussion soft tap, "
            "distant erhu strings, ambient ritual drone, mysterious suspended atmosphere, "
            "Eastern temple oracle bones casting, sacred ritual, "
            "60 seconds seamless loop, instrumental, contemplative"
        ),
    },
    {
        "name": "music-06-hexagram-reveal",
        "category": "music",
        "duration": 45,
        "prompt": (
            "I-Ching hexagram reveal, ascending mystical wash, "
            "ethereal choir pad instrumental no lyrics, celestial bell shimmer, "
            "luminous wisdom unfolding, sacred Eastern revelation, "
            "warm cinematic, 45 seconds seamless loop, "
            "instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "music-07-meditation-chat",
        "category": "music",
        "duration": 60,
        "prompt": (
            "tranquil meditation chat ambient, soft acoustic guitar fingerpicking, "
            "gentle nature breeze, warm sunlight pad, peaceful flowing kalimba, "
            "mindful zen breathing space, intimate conversation companion, "
            "60 seconds seamless loop, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "music-08-paywall-ascend",
        "category": "music",
        "duration": 45,
        "prompt": (
            "uplifting subscription unlock cinematic, hopeful ascending strings, "
            "soft glockenspiel sparkle, warm choir pad instrumental, "
            "ethereal premium reveal, golden inspiring transcendent, "
            "Eastern modern fusion, 45 seconds seamless loop, "
            "instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "music-09-loading-thinking",
        "category": "music",
        "duration": 30,
        "prompt": (
            "soft mystical loading ambient, gentle crystal bell tones, "
            "subtle drone pad, spacious breathing texture, AI thinking pause, "
            "30 seconds seamless loop, instrumental, no percussion, no vocals"
        ),
    },
    {
        "name": "music-10-night-mode",
        "category": "music",
        "duration": 60,
        "prompt": (
            "night mode evening lullaby, soft mellotron strings, "
            "distant glass chimes, intimate cozy moonlight, "
            "twilight reflective companion, glowing celestial pad, "
            "deeper warmth, 60 seconds seamless loop, instrumental zen, "
            "no vocals, no drums, no percussion"
        ),
    },

    # -------------------------------------------------------------------------
    # B. ACTION SFX (17 tracks, 1-8s each, single events)
    # -------------------------------------------------------------------------
    {
        "name": "sfx-11-app-launch",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "app launch opening signature chime, ethereal mystical swell, "
            "ascending crystal bell cascade, tibetan singing bowl resonance, "
            "warm magical bloom, 3 seconds short SFX one-shot, "
            "instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-12-pet-tap",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "gentle magic chime single hit, soft crystal tap, light kalimba pluck, "
            "warm pet interaction touch, 1 second short SFX one-shot, "
            "instrumental, no vocals, no drums, no percussion"
        ),
    },
    {
        "name": "sfx-13-category-select",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "soft selection ding single hit, gentle UI confirmation, "
            "subtle glass chime, light glockenspiel tap, "
            "1 second short SFX one-shot, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-14-jiao-sheng-yes",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "auspicious wood block click followed by golden chime cascade, "
            "moon block divination yes answer, ceremonial Eastern oracle confirmation, "
            "warm celebratory mystical reveal, 2 seconds short SFX one-shot, "
            "instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-15-jiao-xiao-maybe",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "playful tinkling wood block double tap, light glass chime sprinkle, "
            "moon block divination smile uncertain answer, gentle whimsical mystery, "
            "2 seconds short SFX one-shot, instrumental, no vocals"
        ),
    },
    {
        "name": "sfx-16-jiao-nu-no",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "somber wood block heavy click, low temple bell toll, "
            "moon block divination no negative answer, contemplative serious denial, "
            "2 seconds short SFX one-shot, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-17-hexagram-reveal",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "ascending mystical wash rise, hexagram reveal swell, "
            "ethereal bell shimmer cascade, sacred wisdom unfolding burst, "
            "I-Ching trigram revelation, 4 seconds short SFX one-shot, "
            "instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-18-camera-capture",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "camera shutter click followed by crystal chime sparkle, "
            "magical photo capture moment, light glass shimmer, "
            "face reading snapshot, 2 seconds short SFX one-shot, "
            "instrumental, no vocals"
        ),
    },
    {
        "name": "sfx-19-compass-spin",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "magical compass whoosh swirl, ascending energy pulse, "
            "ethereal directional sweep, feng shui scan rotation, "
            "mystical wind shimmer, 3 seconds short SFX one-shot, "
            "instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-20-result-fortune",
        "category": "sfx",
        "duration": 6,
        "prompt": (
            "golden chime cascade reveal, warm celebratory bell shimmer, "
            "fortune result bloom, ascending glockenspiel sparkle, "
            "ethereal triumphant warm glow, 5 seconds short SFX one-shot, "
            "instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-21-level-up",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "sparkling celebratory ding cascade, ascending magical chime burst, "
            "level up achievement bright shimmer, warm uplifting bell roll, "
            "3 seconds short SFX one-shot, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-22-pet-evolution",
        "category": "sfx",
        "duration": 7,
        "prompt": (
            "transcendent magical evolution burst, rising ethereal choir pad swell instrumental, "
            "celestial bell wash explosion, luminous breakthrough transformation, "
            "sacred awakening ascending arpeggio, golden cosmic bloom, "
            "6 seconds short SFX one-shot, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-23-quota-warning",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "soft low temple gong toll single hit, gentle warning resonance, "
            "contemplative pause cue, trial used reminder, "
            "2 seconds short SFX one-shot, instrumental, no vocals, no harsh tones"
        ),
    },
    {
        "name": "sfx-24-subscription-success",
        "category": "sfx",
        "duration": 6,
        "prompt": (
            "warm fanfare bloom, golden ascending strings swell, "
            "celebratory bell cascade, subscription success premium unlock, "
            "uplifting cinematic reveal, ethereal triumphant glow, "
            "5 seconds short SFX one-shot, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-25-achievement-unlock",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "bright chime cascade burst, achievement unlock sparkle, "
            "ascending glockenspiel ding roll, warm triumphant shimmer, "
            "3 seconds short SFX one-shot, instrumental, no vocals, no drums"
        ),
    },
    {
        "name": "sfx-26-error-soft",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "gentle low gong soft toll single hit, contemplative pause, "
            "calm reset cue, soft denial reminder, no harsh tones, "
            "2 seconds short SFX one-shot, instrumental, no vocals"
        ),
    },
    {
        "name": "sfx-27-notification",
        "category": "sfx",
        "duration": 5,
        "prompt": (
            "light bell ping single hit, gentle notification chime, "
            "soft crystal tap alert, warm subtle ding, "
            "1 second short SFX one-shot, instrumental, no vocals, no drums"
        ),
    },
]


# =============================================================================
# GENERATION
# =============================================================================
def generate(prompt: str, duration: int, out_path: Path) -> bool:
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Accept": "audio/*",
    }
    files = {
        "prompt": (None, prompt),
        "duration": (None, str(duration)),
        "output_format": (None, "mp3"),
        "model": (None, "stable-audio-2.5"),
    }
    for attempt in range(3):
        try:
            resp = requests.post(ENDPOINT, headers=headers, files=files, timeout=180)
            if resp.status_code == 200:
                out_path.write_bytes(resp.content)
                return True
            print(f"    [HTTP {resp.status_code}] {resp.text[:200]}")
            if resp.status_code in (401, 403):
                return False  # auth error, no retry
            time.sleep(5)
        except Exception as e:
            print(f"    [EXC {attempt+1}/3] {e}")
            time.sleep(5)
    return False


def out_dir_for(category: str) -> Path:
    return MUSIC_DIR if category == "music" else SFX_DIR


def main():
    music_count = sum(1 for t in TRACKS if t["category"] == "music")
    sfx_count = sum(1 for t in TRACKS if t["category"] == "sfx")
    total_credits = len(TRACKS) * CREDITS_PER_TRACK
    total_usd = total_credits * USD_PER_CREDIT

    print("=" * 72)
    print("  LingXi Audio Palette — Stable Audio 2.5")
    print(f"  {len(TRACKS)} tracks total  ({music_count} music + {sfx_count} sfx)")
    print(f"  Estimated cost: {total_credits} credits  ≈  ${total_usd:.2f} USD")
    print(f"  Music dir: {MUSIC_DIR}")
    print(f"  SFX   dir: {SFX_DIR}")
    print("=" * 72)

    success = fail = skip = 0
    success_music = success_sfx = 0
    total_seconds = 0

    for i, track in enumerate(TRACKS, 1):
        out = out_dir_for(track["category"]) / f"{track['name']}.mp3"
        tag = "MUS" if track["category"] == "music" else "SFX"

        if out.exists() and out.stat().st_size > 1000:
            print(f"  [{i:2d}/{len(TRACKS)}] [{tag}] [SKIP] {track['name']} (already exists)")
            skip += 1
            continue

        print(f"  [{i:2d}/{len(TRACKS)}] [{tag}] [GEN ] {track['name']} ({track['duration']}s)...")
        t0 = time.time()
        ok = generate(track["prompt"], track["duration"], out)
        dt = time.time() - t0
        if ok:
            print(f"      [OK] {out.stat().st_size // 1024} KB  · {dt:.1f}s")
            success += 1
            total_seconds += track["duration"]
            if track["category"] == "music":
                success_music += 1
            else:
                success_sfx += 1
        else:
            print(f"      [FAIL] {dt:.1f}s")
            fail += 1
        time.sleep(2)  # polite spacing

    spent_credits = (success + fail) * CREDITS_PER_TRACK
    spent_usd = spent_credits * USD_PER_CREDIT

    print(f"\n{'=' * 72}")
    print("  SUMMARY")
    print(f"{'=' * 72}")
    print(f"  Generated:  {success}  ({success_music} music + {success_sfx} sfx)")
    print(f"  Failed:     {fail}")
    print(f"  Skipped:    {skip}  (already existed)")
    print(f"  Total audio length: {total_seconds}s ({total_seconds // 60}m {total_seconds % 60}s)")
    print(f"  Credits spent (incl. failed):  {spent_credits}")
    print(f"  USD cost (incl. failed):       ${spent_usd:.2f}")
    print(f"  Output music: {MUSIC_DIR}")
    print(f"  Output sfx:   {SFX_DIR}")
    print(f"{'=' * 72}")


if __name__ == "__main__":
    main()
