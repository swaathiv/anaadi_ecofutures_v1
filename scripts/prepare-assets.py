"""Prepare site images from the supplied source files.

Only crops and resizes. No recolouring, retouching or regeneration, so the
sarees and the logo appear exactly as photographed / supplied.

Usage:
    python3 scripts/prepare-assets.py <source-dir>

<source-dir> must contain:
    1.webp  approved homepage mockup (used ONLY for temporary energy imagery)
    2.jpg   magenta saree, peacock-blue pallu
    3.jpg   orange saree, peacock-blue pallu
    4.jpg   ivory saree, magenta pallu
    5.jpg   coral-red saree, peacock-blue pallu
The original logo is read from public/brand/anaadi-ecofutures-logo-original.png.
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "images"

# (source file, output name, crop box (left, top, right, bottom))
SAREE_CROPS = [
    # Full sarees: trimmed to remove the floor, feet and neighbouring sarees.
    ("2.jpg", "saree-magenta-peacock-blue.jpg", (0, 250, 822, 1215)),
    ("3.jpg", "saree-orange-peacock-blue.jpg", (0, 40, 835, 1205)),
    ("4.jpg", "saree-ivory-magenta.jpg", (0, 0, 1280, 960)),
    ("5.jpg", "saree-coral-peacock-blue.jpg", (0, 70, 860, 1250)),
    # Pallu details.
    ("2.jpg", "detail-magenta-pallu.jpg", (60, 560, 560, 960)),
    ("3.jpg", "detail-orange-pallu.jpg", (40, 360, 600, 808)),
    ("4.jpg", "detail-ivory-pallu.jpg", (360, 90, 1120, 560)),
    ("5.jpg", "detail-coral-pallu.jpg", (60, 380, 600, 812)),
]

# TEMPORARY: concept imagery cropped from the approved mockup. Replace with
# approved photographs before launch (see README, "Assets to replace").
MOCKUP_CROPS = [
    ("temp-energy-hero.jpg", (432, 133, 747, 492)),
    ("temp-energy-card.jpg", (35, 814, 435, 1121)),
    # Draped ivory fabric with green/gold border (homepage hero). Its top-left
    # ~60% x 65% sits behind the main hero image, matching the mockup.
    ("temp-fabric-hero.jpg", (573, 290, 865, 623)),
    # Folded ivory fabrics with green/gold borders (homepage Vastras card).
    ("temp-fabric-card.jpg", (462, 814, 865, 1121)),
]

# Original logo: crop away the empty padding only.
LOGO_CROP = (190, 345, 998, 835)


def save_jpeg(img: Image.Image, path: Path) -> None:
    img.convert("RGB").save(path, "JPEG", quality=90, optimize=True, progressive=True)
    print(f"wrote {path.relative_to(ROOT)} {img.size[0]}x{img.size[1]}")


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)

    for name, out, box in SAREE_CROPS:
        save_jpeg(Image.open(src / name).crop(box), OUT / out)

    mockup = Image.open(src / "1.webp")
    for out, box in MOCKUP_CROPS:
        save_jpeg(mockup.crop(box), OUT / out)

    logo = Image.open(ROOT / "public/brand/anaadi-ecofutures-logo-original.png")
    cropped = logo.crop(LOGO_CROP)
    cropped.save(OUT / "logo.png", optimize=True)
    print(f"wrote assets/images/logo.png {cropped.size[0]}x{cropped.size[1]}")


if __name__ == "__main__":
    main()
