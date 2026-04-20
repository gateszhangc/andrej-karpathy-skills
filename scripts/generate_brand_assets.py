from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "brand"
INK = "#101213"
PAPER = "#f6f7f2"
LINE = "#d9ddd5"
CYAN = "#24c6c8"
RED = "#f05a45"
GREEN = "#9fbf50"
GOLD = "#d6a83c"


def font(size, bold=False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Helvetica.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default(size=size)


def draw_grid(draw, size, margin, step, color, alpha=58):
    rgba = (*Image.new("RGB", (1, 1), color).getpixel((0, 0)), alpha)
    for x in range(margin, size - margin + 1, step):
        draw.line((x, margin, x, size - margin), fill=rgba, width=2)
    for y in range(margin, size - margin + 1, step):
        draw.line((margin, y, size - margin, y), fill=rgba, width=2)


def node_points(size):
    raw = [
        (0.24, 0.28, CYAN),
        (0.41, 0.20, GOLD),
        (0.61, 0.29, CYAN),
        (0.76, 0.22, RED),
        (0.30, 0.48, GREEN),
        (0.52, 0.45, CYAN),
        (0.70, 0.50, GOLD),
        (0.22, 0.68, RED),
        (0.43, 0.74, CYAN),
        (0.64, 0.70, GREEN),
        (0.80, 0.76, CYAN),
    ]
    return [(int(x * size), int(y * size), color) for x, y, color in raw]


def draw_mark(draw, size, with_letters=True):
    margin = int(size * 0.105)
    draw.rounded_rectangle((margin, margin, size - margin, size - margin), radius=int(size * 0.055), outline=(246, 247, 242, 210), width=max(3, size // 120))
    draw_grid(draw, size, margin + int(size * 0.035), max(28, size // 9), PAPER, 42)

    points = node_points(size)
    edges = [(0, 1), (0, 4), (1, 2), (2, 3), (2, 5), (4, 5), (5, 6), (4, 7), (5, 8), (6, 9), (7, 8), (8, 9), (9, 10), (6, 10)]
    for start, end in edges:
        x1, y1, color = points[start]
        x2, y2, _ = points[end]
        draw.line((x1, y1, x2, y2), fill=(*Image.new("RGB", (1, 1), color).getpixel((0, 0)), 185), width=max(4, size // 70))

    for x, y, color in points:
        radius = max(8, size // 45)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color)
        inner = max(3, radius // 3)
        draw.ellipse((x - inner, y - inner, x + inner, y + inner), fill=PAPER)

    if with_letters:
        letter_font = font(int(size * 0.18), bold=True)
        label = "AKS"
        bbox = draw.textbbox((0, 0), label, font=letter_font)
        text_w = bbox[2] - bbox[0]
        draw.text(((size - text_w) / 2, size * 0.505), label, font=letter_font, fill=PAPER)


def make_logo(path, size):
    scale = 3
    image = Image.new("RGBA", (size * scale, size * scale), INK)
    draw = ImageDraw.Draw(image, "RGBA")
    draw_mark(draw, size * scale, with_letters=True)
    image = image.resize((size, size), Image.Resampling.LANCZOS)
    image.save(path)


def make_og(path):
    width, height = 1200, 630
    image = Image.new("RGBA", (width, height), INK)
    draw = ImageDraw.Draw(image, "RGBA")

    for x in range(-40, width + 40, 58):
      draw.line((x, 0, x + 260, height), fill=(246, 247, 242, 24), width=1)
    for y in range(48, height, 58):
      draw.line((0, y, width, y), fill=(246, 247, 242, 20), width=1)

    for index in range(44):
        x = 680 + int(math.sin(index * 1.8) * 210 + (index % 6) * 38)
        y = 82 + int((index * 89) % 470)
        color = [CYAN, RED, GREEN, GOLD][index % 4]
        draw.ellipse((x - 5, y - 5, x + 5, y + 5), fill=color)
        if index > 0:
            px = 680 + int(math.sin((index - 1) * 1.8) * 210 + ((index - 1) % 6) * 38)
            py = 82 + int(((index - 1) * 89) % 470)
            draw.line((px, py, x, y), fill=(*Image.new("RGB", (1, 1), color).getpixel((0, 0)), 130), width=2)

    draw.text((72, 96), "ANDREJ", font=font(86, bold=True), fill=PAPER)
    draw.text((72, 190), "KARPATHY", font=font(86, bold=True), fill=PAPER)
    draw.text((72, 298), "SKILLS", font=font(54, bold=True), fill=CYAN)
    draw.text((76, 388), "neural intuition / code / teaching / AI systems", font=font(30), fill=(246, 247, 242, 215))
    draw.line((76, 455, 520, 455), fill=RED, width=5)
    draw.text((76, 488), "unofficial skill map", font=font(24, bold=True), fill=(246, 247, 242, 190))
    image.convert("RGB").save(path, quality=94)


def make_icons(source):
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "favicon-96x96.png": 96,
        "apple-touch-icon.png": 180,
        "icon-192.png": 192,
        "icon-512.png": 512,
    }
    for name, size in sizes.items():
        source.resize((size, size), Image.Resampling.LANCZOS).save(OUT / name)
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    source.save(ROOT / "favicon.ico", sizes=ico_sizes)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    make_logo(OUT / "logo.png", 1024)
    make_logo(OUT / "logo-mark.png", 512)
    mark = Image.open(OUT / "logo-mark.png").convert("RGBA")
    make_icons(mark)
    make_og(OUT / "og-image.png")


if __name__ == "__main__":
    main()
