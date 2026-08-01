from PIL import Image
import os

img = Image.open('src/assets/second_committee/member_1.jpeg')
W, H = img.size

row_height = (H - 120) / 5
y_offset = 120
rows = [4, 5, 4, 3, 4]
img_idx = 1

output_dir = 'src/assets/second_committee'

for r, cols in enumerate(rows):
    cell_w = W / cols
    # Adjust y center slightly upwards to catch the face, not the name
    y_center = y_offset + r * row_height + row_height * 0.4 
    for c in range(cols):
        x_center = c * cell_w + cell_w / 2
        
        # Crop 220x220 around center
        box = (
            int(x_center - 120),
            int(y_center - 120),
            int(x_center + 120),
            int(y_center + 120)
        )
        face = img.crop(box)
        face.save(f'{output_dir}/face_{img_idx}.jpeg')
        img_idx += 1
