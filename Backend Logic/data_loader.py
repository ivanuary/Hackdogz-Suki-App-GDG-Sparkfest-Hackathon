import json

def open_json_stores():
    with open("Backend Logic\stores.json", "r") as file:
        data = json.load(file)
    return data