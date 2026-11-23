import sys

file_path = '/Users/atharvpatil/Downloads/Lab/client/src/pages/About.jsx'
with open(file_path, 'r') as f:
    content = f.read()

# Replace all occurrences
new_content = content.replace('rounded-full object-cover', 'rounded-full object-contain bg-white')

with open(file_path, 'w') as f:
    f.write(new_content)

print("Replacement done.")
