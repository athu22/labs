import cv2
import os

image_path = "/Users/atharvpatil/Downloads/Lab/client/src/assets/second_committee/member_1.jpeg"
output_dir = "/Users/atharvpatil/Downloads/Lab/client/src/assets/second_committee/faces"
os.makedirs(output_dir, exist_ok=True)

img = cv2.imread(image_path)
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
# Trying different scale factors and minNeighbors to get exactly 20 faces if possible
faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

print(f"Detected {len(faces)} faces.")

# Sort faces by Y coordinate (rows) and then X coordinate (columns)
# We can use a tolerance for Y to group them into rows
faces_list = list(faces)
faces_list.sort(key=lambda f: (f[1] // 100, f[0])) # Group by Y with 100px tolerance, then sort by X

for i, (x, y, w, h) in enumerate(faces_list):
    # Expand the box a little to get more of the head/shoulders
    margin = int(w * 0.3)
    x1 = max(0, x - margin)
    y1 = max(0, y - margin)
    x2 = min(img.shape[1], x + w + margin)
    y2 = min(img.shape[0], y + h + margin)
    
    face_img = img[y1:y2, x1:x2]
    out_path = os.path.join(output_dir, f"detected_{i+1}.jpeg")
    cv2.imwrite(out_path, face_img)

print("Saved cropped faces.")
