import subprocess

result = subprocess.run(["git", "show", "eba763c~1:frontend/src/pages/Dashboard.jsx"], capture_output=True)
with open("old_dashboard.jsx", "wb") as f:
    f.write(result.stdout)
