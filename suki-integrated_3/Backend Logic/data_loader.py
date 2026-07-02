import json
import os

# Resolve stores.json relative to this file's own folder so it works no
# matter what directory the app/script is launched from, and on any OS
# (the old hardcoded "Backend Logic\stores.json" only worked on Windows,
# and only if you ran it from the repo root).
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORES_PATH = os.path.join(BASE_DIR, "stores.json")


def open_json_stores():
    with open(STORES_PATH, "r", encoding="utf-8") as file:
        data = json.load(file)
    return data
