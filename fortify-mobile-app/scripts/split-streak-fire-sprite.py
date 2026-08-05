from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPRITE_PATH = ROOT / "assets" / "animations" / "streak-fire" / "fire-sprite.png"
OUTPUT_DIR = SPRITE_PATH.parent / "frames"
GRID_SIZE = 4
FRAME_SIZE = 320


def main() -> None:
    sprite = Image.open(SPRITE_PATH).convert("RGBA")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    x_edges = [round(sprite.width * index / GRID_SIZE) for index in range(GRID_SIZE + 1)]
    y_edges = [round(sprite.height * index / GRID_SIZE) for index in range(GRID_SIZE + 1)]

    frame_number = 1
    for row in range(GRID_SIZE):
        for column in range(GRID_SIZE):
            frame = sprite.crop(
                (
                    x_edges[column],
                    y_edges[row],
                    x_edges[column + 1],
                    y_edges[row + 1],
                )
            )
            frame.thumbnail((FRAME_SIZE, FRAME_SIZE), Image.Resampling.LANCZOS)
            canvas = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
            canvas.alpha_composite(
                frame,
                ((FRAME_SIZE - frame.width) // 2, (FRAME_SIZE - frame.height) // 2),
            )
            canvas.save(OUTPUT_DIR / f"frame-{frame_number:02d}.png", optimize=True)
            frame_number += 1

    print(f"Wrote {frame_number - 1} frames to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
