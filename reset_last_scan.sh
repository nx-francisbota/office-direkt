 #!/bin/bash

# Define the file path containing the date
file_path="./public/pdf/LASTSCAN"

# Check if the file exists
if [[ ! -f "$file_path" ]]; then
  echo "Error: File '$file_path' does not exist."
  exit 1
fi

# Clear the file content to reset the date
truncate -s 0 "$file_path"

# Optional: Informative message
echo "Date reset in file: $file_path"

exit 0
