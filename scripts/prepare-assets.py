"""Prepare site images from the supplied source files.

Only crops and resizes. No recolouring, retouching or regeneration, so the
sarees and the logo appear exactly as photographed / supplied.

Usage:
    python3 scripts/prepare-assets.py <source-dir>

<source-dir> must contain:
    1.webp  approved homepage mockup (used ONLY for temporary energy imagery)
    (2.jpg–5.jpg, the saree photos, are used by scripts/make-storefront.py)
The original logo is read from public/brand/anaadi-ecofutures-logo-original.png.
"""

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "images"

# (source file, output name, crop box (left, top, right, bottom))
# Saree images are produced by scripts/make-storefront.py.
SAREE_CROPS: list = []

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
