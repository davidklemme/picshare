import csv
import os
import re
import shutil
import subprocess
from pathlib import Path

# HIER PFADE ANPASSEN
SOURCE_DIR = Path("/Pfad/zu/deinen/Originalen")
TARGET_DIR = Path("/Pfad/zu/den/fertigen_ZIPs")
CSV_FILE = Path("formular_export.csv")  # CSV enthält: family_name,child_name,image_numbers,zip_password
TEMP_DIR = Path("./temp_sort")
SUPPORTED_EXTENSIONS = (".jpg", ".jpeg", ".cr2")


def safe_folder_name(value):
    return re.sub(r"[^A-Za-z0-9._-]+", "_", value.strip()).strip("_") or "familie"


def create_encrypted_zips():
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    source_files = [path for path in SOURCE_DIR.iterdir() if path.is_file()]

    with CSV_FILE.open(mode="r", encoding="utf-8", newline="") as file_handle:
        reader = csv.reader(file_handle, delimiter=",")
        next(reader, None)  # Header überspringen

        for row in reader:
            if not row or len(row) < 4:
                continue

            family_name = safe_folder_name(row[0])
            child_name = row[1].strip()
            numbers_raw = row[2]
            zip_password = row[3].strip()

            requested_numbers = re.findall(r"\d+", numbers_raw)
            if not requested_numbers or not zip_password:
                print(f"[-] Überspringe {family_name}: Keine Bilder oder kein Passwort.")
                continue

            family_temp_dir = TEMP_DIR / family_name
            if family_temp_dir.exists():
                shutil.rmtree(family_temp_dir)
            family_temp_dir.mkdir(parents=True)

            print(f"\n[+] Sammle Bilder für {family_name} ({child_name})...")
            copied_count = 0

            for number in requested_numbers:
                found_file = next(
                    (
                        path
                        for path in source_files
                        if number in path.name and path.suffix.lower() in SUPPORTED_EXTENSIONS
                    ),
                    None,
                )
                if found_file:
                    shutil.copy2(found_file, family_temp_dir / found_file.name)
                    copied_count += 1
                else:
                    print(f"    [!] Nummer {number} nicht gefunden.")

            if copied_count == 0:
                print("    [-] Keine Bilder gefunden. ZIP wird nicht erstellt.")
                shutil.rmtree(family_temp_dir)
                continue

            zip_target_path = TARGET_DIR / f"{family_name}.zip"
            if zip_target_path.exists():
                zip_target_path.unlink()

            print(f"    [*] Erstelle passwortgeschütztes ZIP für {family_name}...")
            result = subprocess.run(
                ["zip", "-P", zip_password, "-r", str(zip_target_path), family_name],
                cwd=TEMP_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
                text=True,
            )

            if result.returncode == 0:
                print(f"    [✔] Erfolgreich: {zip_target_path.name} erstellt.")
            else:
                print(f"    [X] Fehler beim Zippen: {result.stderr}")

            shutil.rmtree(family_temp_dir)

    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)


if __name__ == "__main__":
    create_encrypted_zips()
