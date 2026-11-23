import fitz
import os

pdf_path = "/Users/atharvpatil/.gemini/antigravity-ide/brain/841153fe-a2bb-42a5-b2bc-f1bc2dd99b0a/media__1785572109652.pdf"
doc = fitz.open(pdf_path)

output_dir = "/Users/atharvpatil/Downloads/Lab/client/src/assets/new_team"
os.makedirs(output_dir, exist_ok=True)

img_idx = 1
for page_num in range(1, 3):
    page = doc[page_num]
    images = page.get_images(full=True)
    
    # Sort images by y coordinate to ensure they are in order of reading
    # PyMuPDF get_images() doesn't return coordinates directly.
    # We can filter by size. Faces are usually larger or have specific dimensions.
    # Actually, we can just save all of them and I'll see which ones are the faces.
    
    for img_index, img_info in enumerate(images):
        xref = img_info[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        
        # Save only if it's larger than say 20kb (to skip small icons or borders)
        if len(image_bytes) > 20000:
            with open(os.path.join(output_dir, f"team_{img_idx}.{image_ext}"), "wb") as f:
                f.write(image_bytes)
            img_idx += 1

print(f"Extracted {img_idx - 1} large images.")
