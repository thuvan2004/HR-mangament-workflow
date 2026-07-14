import os
import sys
import urllib.request
import zipfile

# Node.js portable URL
node_url = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip"
zip_path = "node_portable.zip"
extract_dir = "node_portable"

def main():
    if not os.path.exists(extract_dir):
        os.makedirs(extract_dir)
        
    print(f"Downloading portable Node.js from {node_url}...")
    try:
        urllib.request.urlretrieve(node_url, zip_path)
        print("Download complete. Extracting zip file...")
        
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
            
        print("Extraction complete. Cleaning up...")
        os.remove(zip_path)
        print("Node.js portable installation complete!")
        
        # Verify
        node_bin = os.path.join(os.getcwd(), extract_dir, "node-v20.11.1-win-x64", "node.exe")
        if os.path.exists(node_bin):
            print(f"Successfully verified node.exe at: {node_bin}")
        else:
            print("Warning: Could not find node.exe after extraction.")
            
    except Exception as e:
        print(f"Error occurred: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
