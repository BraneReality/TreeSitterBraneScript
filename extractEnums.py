import re
import sys
from pathlib import Path

def extract_enums(c_file_path, output_header_path, enum_names):
    with open(c_file_path, 'r', encoding='utf-8') as file:
        c_code = file.read()
    
    # Regex to match named enums
    enum_pattern = re.compile(r'enum\s+(\w+)\s*{([^}]+)};', re.MULTILINE | re.DOTALL)
    extracted_enums = []
    
    for match in enum_pattern.finditer(c_code):
        name, body = match.groups()
        if name in enum_names:
            extracted_enums.append(f"enum {name} {{{body}}};")
    
    if not extracted_enums:
        print("No matching enums found.")
        return
    
    # Write to header file
    output_path = Path(output_header_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as header_file:
        header_file.write("#ifndef EXTRACTED_ENUMS_H\n#define EXTRACTED_ENUMS_H\n\n")
        header_file.write("\n".join(extracted_enums))
        header_file.write("\n\n#endif // EXTRACTED_ENUMS_H\n")
    
    print(f"Extracted enums written to {output_header_path}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python extract_enums.py <input.c> <output.h> <enum_name1> [<enum_name2> ...]")
        sys.exit(1)
    
    input_c_file = sys.argv[1]
    output_header_file = sys.argv[2]
    enum_names = sys.argv[3:]
    
    extract_enums(input_c_file, output_header_file, enum_names)
