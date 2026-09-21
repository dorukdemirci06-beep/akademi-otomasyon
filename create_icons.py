import os
import subprocess
import sys

def main():
    try:
        import cairosvg
        from PIL import Image
    except ImportError:
        print("Installing cairosvg and Pillow...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "cairosvg", "Pillow"])
        import cairosvg
        from PIL import Image

    svg_path = r"c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon\frontend\public\favicon.svg"
    png_path = r"c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon\frontend\public\icon-512x512.png"
    ico_path = r"c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon\icon.ico"

    # Convert SVG to PNG
    print("Converting SVG to PNG...")
    cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=512, output_height=512)
    print(f"Created {png_path}")

    # Convert PNG to ICO
    print("Converting PNG to ICO...")
    img = Image.open(png_path)
    img.save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
    print(f"Created {ico_path}")

    # Create 192x192 PNG for PWA
    png_path_192 = r"c:\Users\doruk\OneDrive\Masaüstü\Akademi Otomasyon\frontend\public\icon-192x192.png"
    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(png_path_192, format="PNG")
    print(f"Created {png_path_192}")

if __name__ == "__main__":
    main()
