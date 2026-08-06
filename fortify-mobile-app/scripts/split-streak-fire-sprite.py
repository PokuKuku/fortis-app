from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SPRITE_PATH = ROOT / "assets" / "animations" / "streak-fire" / "fire-sprite-simple.png"
OUTPUT_DIR = SPRITE_PATH.parent / "frames"
GRID_SIZE = 4
FRAME_SIZE = 320
ALPHA_THRESHOLD = 32
FLAME_BASELINE = 310
FLAME_CENTER_X = FRAME_SIZE // 2
BASE_ANCHOR_HEIGHT = 24
CELL_BOTTOM_BLEED = 16


def largest_component_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    width, height = image.size
    pixels = alpha.load()
    visited = bytearray(width * height)
    largest_count = 0
    largest_bbox = (0, 0, width, height)

    for y in range(height):
        for x in range(width):
            index = y * width + x
            if visited[index] or pixels[x, y] < ALPHA_THRESHOLD:
                continue

            queue = deque([(x, y)])
            visited[index] = 1
            count = 0
            min_x = max_x = x
            min_y = max_y = y

            while queue:
                current_x, current_y = queue.popleft()
                count += 1
                min_x = min(min_x, current_x)
                max_x = max(max_x, current_x)
                min_y = min(min_y, current_y)
                max_y = max(max_y, current_y)

                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if not (0 <= next_x < width and 0 <= next_y < height):
                        continue
                    next_index = next_y * width + next_x
                    if visited[next_index] or pixels[next_x, next_y] < ALPHA_THRESHOLD:
                        continue
                    visited[next_index] = 1
                    queue.append((next_x, next_y))

            if count > largest_count:
                largest_count = count
                largest_bbox = (
                    max(0, min_x - 3),
                    max(0, min_y - 3),
                    min(width, max_x + 4),
                    min(height, max_y + 4),
                )

    return largest_bbox


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
                    y_edges[row + 1] + CELL_BOTTOM_BLEED,
                )
            )
            isolated = Image.new("RGBA", frame.size, (0, 0, 0, 0))
            component_bbox = largest_component_bbox(frame)
            isolated.paste(frame.crop(component_bbox), component_bbox)
            scaled_height = round(isolated.height * FRAME_SIZE / isolated.width)
            frame = isolated.resize((FRAME_SIZE, scaled_height), Image.Resampling.LANCZOS)
            visible_alpha = frame.getchannel("A").point(
                lambda alpha: 255 if alpha >= ALPHA_THRESHOLD else 0
            )
            visible_bbox = visible_alpha.getbbox()
            vertical_offset = FLAME_BASELINE - (visible_bbox[3] if visible_bbox else FRAME_SIZE)
            if visible_bbox:
                base_band = visible_alpha.crop(
                    (
                        0,
                        max(0, visible_bbox[3] - BASE_ANCHOR_HEIGHT),
                        FRAME_SIZE,
                        visible_bbox[3],
                    )
                )
                base_bbox = base_band.getbbox()
                base_center = (base_bbox[0] + base_bbox[2]) / 2 if base_bbox else FRAME_SIZE / 2
            else:
                base_center = FRAME_SIZE / 2
            horizontal_offset = round(FLAME_CENTER_X - base_center)
            canvas = Image.new("RGBA", (FRAME_SIZE, FRAME_SIZE), (0, 0, 0, 0))
            canvas.alpha_composite(frame, (horizontal_offset, vertical_offset))
            canvas.save(OUTPUT_DIR / f"frame-{frame_number:02d}.png", optimize=True)
            frame_number += 1

    print(f"Wrote {frame_number - 1} frames to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
