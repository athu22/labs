import fitz

pdf_path = "/Users/atharvpatil/.gemini/antigravity-ide/brain/841153fe-a2bb-42a5-b2bc-f1bc2dd99b0a/media__1785572109652.pdf"
doc = fitz.open(pdf_path)

for i in range(1, 3): # Page 2 and 3 (0-indexed 1 and 2)
    page = doc[i]
    images = page.get_images(full=True)
    print(f"Page {i+1} has {len(images)} images")
