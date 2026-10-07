"""Turn the supplied saree photos into storefront images.

Faithful edits only: the saree pixels (colour, weave, motifs) are kept as
photographed. The script
  1. cuts the saree out of the photo (rembg; model chosen per photo),
  2. removes leftover table in the tassel corner (keeps only blue there,
     since only the blue pallu/tassels belong to the saree in that area),
  3. optionally rotates the cut-out so it stands upright,
  4. places it on a warm ivory studio backdrop with a soft shadow, 4:5,
  5. writes a matching pallu close-up.

Usage (needs `pip install "rembg[cpu]" pillow numpy` in a virtualenv):
    python scripts/make-storefront.py <dir-with-2.jpg..5.jpg>
"""

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "images"

W, H = 1200, 1500  # 4:5, matches the collection grid

# source, output stem, rembg model, blue-only cleanup box (x0, y0, x1, y1),
# rotation (degrees, counter-clockwise), detail box on the final image
SAREES = [
    ("2.jpg", "magenta-peacock-blue", "isnet-general-use", (0, 1060, 455, 1280), 0, (170, 560, 690, 1080)),
    ("3.jpg", "orange-peacock-blue", "birefnet-general-lite", (0, 1040, 430, 1280), 0, (170, 420, 690, 940)),
    ("4.jpg", "ivory-magenta", "birefnet-general-lite", None, None, (300, 260, 900, 860)),
    ("5.jpg", "coral-peacock-blue", "birefnet-general-lite", (0, 1080, 445, 1280), 0, (170, 470, 690, 990)),
]

BACKDROP_CENTRE = np.array([247, 243, 234], dtype=np.float32)  # warm ivory
BACKDROP_EDGE = np.array([236, 229, 216], dtype=np.float32)
SHADOW = (64, 48, 34)


def keep_blue_only(img: Image.Image, box) -> Image.Image:
    """Inside `box`, make every non-blue pixel transparent."""
    a = np.array(img).astype(np.int16)
    x0, y0, x1, y1 = box
    r, g, b, al = (a[y0:y1, x0:x1, i] for i in range(4))
    blue = (b > r + 18) & (b > g - 25)
    al[~blue] = 0
    a[y0:y1, x0:x1, 3] = al
    return Image.fromarray(a.astype(np.uint8), "RGBA")


def upright_angle(img: Image.Image) -> float:
    """Rotation that makes the cut-out's long axis vertical, with a slight
    tilt like the other flat-lays."""
    al = np.array(img.split()[3]) > 128
    ys, xs = np.nonzero(al)
    xs = xs - xs.mean()
    ys = ys - ys.mean()
    cov = np.cov(np.vstack([xs, ys]))
    vals, vecs = np.linalg.eigh(cov)
    vx, vy = vecs[:, np.argmax(vals)]
    axis = math.degrees(math.atan2(vy, vx))  # image coords, y down
    return axis - 90 + 12  # long axis to vertical, then a 12° lean


def backdrop() -> Image.Image:
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H * 0.45) / (H * 0.75)) ** 2)
    t = np.clip(d, 0, 1)[..., None] ** 1.6
    rgb = BACKDROP_CENTRE * (1 - t) + BACKDROP_EDGE * t
    return Image.fromarray(rgb.astype(np.uint8), "RGB").convert("RGBA")


def compose(cut: Image.Image) -> Image.Image:
    # Measure from clearly opaque pixels, ignoring faint matte haze.
    solid = cut.split()[3].point(lambda v: 255 if v > 60 else 0)
    cut = cut.crop(solid.getbbox())
    scale = min(W * 0.80 / cut.width, H * 0.84 / cut.height)
    cut = cut.resize((round(cut.width * scale), round(cut.height * scale)), Image.LANCZOS)
    x = (W - cut.width) // 2
    y = (H - cut.height) // 2 + 10

    canvas = backdrop()
    alpha = cut.split()[3]
    for radius, offset, opacity in ((26, (14, 22), 0.22), (6, (3, 5), 0.20)):
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        layer = Image.new("RGBA", cut.size, SHADOW + (0,))
        layer.putalpha(alpha.point(lambda v: int(v * opacity)))
        sh.alpha_composite(layer, (x + offset[0], y + offset[1]))
        canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(radius)))
    canvas.alpha_composite(cut, (x, y))
    return canvas.convert("RGB")


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    sessions: dict[str, object] = {}
    for name, stem, model, clean, rotate, detail in SAREES:
        session = sessions.setdefault(model, new_session(model))
        cut = remove(Image.open(src / name), session=session).convert("RGBA")
        if clean:
            cut = keep_blue_only(cut, clean)
        # Drop near-invisible matte haze (it would catch shadow as grey
        # specks), then soften the edge by a hair so it sits on the backdrop.
        a = cut.split()[3].point(lambda v: 0 if v < 40 else v)
        cut.putalpha(a.filter(ImageFilter.GaussianBlur(0.6)))
        angle = upright_angle(cut) if rotate is None else rotate
        if angle:
            cut = cut.rotate(angle, resample=Image.BICUBIC, expand=True)
        final = compose(cut)
        final.save(OUT / f"store-{stem}.jpg", "JPEG", quality=88, optimize=True, progressive=True)
        final.crop(detail).save(OUT / f"store-detail-{stem}.jpg", "JPEG", quality=88, optimize=True)
        print(f"wrote store-{stem}.jpg (rotated {angle:.1f}°)")


if __name__ == "__main__":
    main()
