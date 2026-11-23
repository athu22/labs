import sys

def main():
    file_path = '/Users/atharvpatil/Downloads/Lab/client/src/pages/About.jsx'
    with open(file_path, 'r') as f:
        lines = f.readlines()

    # Find the start and end of Zonal & District Representatives
    start_idx = -1
    end_idx = -1
    
    for i, line in enumerate(lines):
        if '{/* Zonal & District Representatives */}' in line:
            start_idx = i
            break
            
    if start_idx != -1:
        # Find the end of this block which is right before the closing `</div>` and `</section>` of the Second Executive Committee
        # Let's look for the closing tags after the button
        for i in range(start_idx, len(lines)):
            if 'onClick={() => setIsThirdCommitteeVisible(!isThirdCommitteeVisible)}' in lines[i]:
                # Found the button, now find the end of the div containing it
                for j in range(i, len(lines)):
                    if '</motion.button>' in lines[j]:
                        # The block ends after </motion.button> and the </div> following it
                        end_idx = j + 2
                        break
                break

    print(f"Block found from {start_idx} to {end_idx}")
    
    if start_idx == -1 or end_idx == -1:
        print("Could not find the block to move.")
        return

    # Extract the block
    block = lines[start_idx:end_idx+1]
    
    # Remove the block from original position
    del lines[start_idx:end_idx+1]

    # Now find where to insert it: under the leadership team.
    # The leadership team ends with `</section>` right before `{/* First Executive Committee Section */}`
    insert_idx = -1
    for i, line in enumerate(lines):
        if '{/* First Executive Committee Section */}' in line:
            # We want to insert it before the closing `</div>` and `</section>` of the previous section
            # The previous section ends around i-1 or i-2
            insert_idx = i - 2
            break
            
    print(f"Insert index found at {insert_idx}")
    if insert_idx == -1:
        print("Could not find the insertion point.")
        return

    # Insert the block
    lines = lines[:insert_idx] + block + lines[insert_idx:]

    with open(file_path, 'w') as f:
        f.writelines(lines)
        
    print("Move successful!")

if __name__ == '__main__':
    main()
