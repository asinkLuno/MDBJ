"""Split individual tape strips from realistic-tape-collection.png."""

from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = Path(__file__).parent / "realistic-tape-collection.png"
OUT = Path(__file__).parent / "individual"
OUT.mkdir(exist_ok=True)

img = Image.open(SRC).convert("RGBA")
arr = np.array(img)

# Use alpha channel: anything with alpha > 10 is tape
mask = arr[:, :, 3] > 10

# Dilate to connect parts of the same strip
struct = ndimage.generate_binary_structure(2, 2)
dilated = ndimage.binary_dilation(mask, structure=struct, iterations=4)

# Label connected components
labeled, num = ndimage.label(dilated)  # pyright: ignore[reportGeneralTypeIssues]
print(f"Found {num} components")

padding = 4
saved = 0
for i in range(1, num + 1):
    ys, xs = np.where(labeled == i)
    if (labeled == i).sum() < 2000:  # skip tiny noise
        continue

    y0 = max(0, ys.min() - padding)
    y1 = min(arr.shape[0], ys.max() + padding + 1)
    x0 = max(0, xs.min() - padding)
    x1 = min(arr.shape[1], xs.max() + padding + 1)

    # Crop preserving original RGBA (transparency included)
    crop = arr[y0:y1, x0:x1]

    out_path = OUT / f"tape_{saved + 1:02d}.png"
    Image.fromarray(crop, "RGBA").save(out_path)
    print(f"  tape_{saved + 1:02d}.png  ({x1-x0}×{y1-y0}px)")
    saved += 1

print(f"\nSaved {saved} tapes to {OUT}/")
