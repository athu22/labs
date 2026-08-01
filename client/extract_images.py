import fitz
import os

pdf_path = "/Users/atharvpatil/Downloads/ACLAP Second BODY.pdf"
output_dir = "/Users/atharvpatil/Downloads/Lab/client/src/assets/second_committee"
os.makedirs(output_dir, exist_ok=True)

try:
    doc = fitz.open(pdf_path)
    img_count = 0
    for page_index in range(len(doc)):
        page = doc[page_index]
        image_list = page.get_images(full=True)
        
        images_with_pos = []
        for img in image_list:
            xref = img[0]
            try:
                rects = page.get_image_rects(xref)
                y0 = rects[0].y0 if rects else 0
                x0 = rects[0].x0 if rects else 0
                images_with_pos.append((xref, img, y0, x0))
            except:
                images_with_pos.append((xref, img, 0, 0))
                
        # Sort by y0 (row), then by x0 (column)
        images_with_pos.sort(key=lambda x: (round(x[2]/50), round(x[3]/50)))
        
        for item in images_with_pos:
            xref = item[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            img_count += 1
            out_path = f"{output_dir}/member_{img_count}.{image_ext}"
            with open(out_path, "wb") as f:
                f.write(image_bytes)
    print(f"Extracted {img_count} images.")
except Exception as e:
    print("Error:", e)
