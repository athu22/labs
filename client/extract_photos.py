import cv2
import os
import numpy as np

image_path = "/Users/atharvpatil/Downloads/Lab/client/src/assets/second_committee/member_1.jpeg"
output_dir = "/Users/atharvpatil/Downloads/Lab/client/src/assets/second_committee_fixed"
os.makedirs(output_dir, exist_ok=True)

img = cv2.imread(image_path)
if img is None:
    print("Could not read image.")
    exit()

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold to find the photos (photos are darker than white background typically)
# We can use Canny edge detection or thresholding.
# Let's use a simple binary inverse thresholding if background is white.
_, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

# Find contours
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

photos = []
img_area = img.shape[0] * img.shape[1]

for cnt in contours:
    x, y, w, h = cv2.boundingRect(cnt)
    area = w * h
    
    # A passport photo should be a significant size but not the whole image.
    # Say between 1% and 10% of the image area.
    if img_area * 0.005 < area < img_area * 0.2:
        # Check aspect ratio (width/height should be between 0.5 and 1.2 for a portrait/square photo)
        aspect_ratio = float(w)/h
        if 0.5 < aspect_ratio < 1.2:
            photos.append((x, y, w, h))

print(f"Found {len(photos)} potential photos.")

# Sort photos by Y (row) then X (col)
# Group by Y with some tolerance (e.g., half the height)
if len(photos) > 0:
    mean_h = sum([p[3] for p in photos]) / len(photos)
    photos.sort(key=lambda p: (p[1] // (mean_h * 0.5), p[0]))

for i, (x, y, w, h) in enumerate(photos):
    # Crop the exact rectangle
    photo_img = img[y:y+h, x:x+w]
    out_path = os.path.join(output_dir, f"photo_{i+1}.jpeg")
    cv2.imwrite(out_path, photo_img)

print("Saved fixed photos.")
