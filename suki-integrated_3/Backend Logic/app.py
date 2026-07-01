import os

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import data_loader
import search_service

# This file lives in "Backend Logic/". The actual frontend lives in the
# sibling "SUKI HACKATHON/" folder, one level up.
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BACKEND_DIR)
FRONTEND_DIR = os.path.join(REPO_ROOT, "SUKI HACKATHON")

# Serve Front.html/function.js/color.css/Images straight from that folder at
# the site root, so all its existing relative paths keep working unchanged.
app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path="")
CORS(app)
stores = data_loader.open_json_stores()

# Fallback location used whenever the browser has no/denied geolocation, or
# sends missing/invalid lat/lon: PUP Sta. Mesa.
DEFAULT_LAT = 14.5978
DEFAULT_LON = 121.0110


def parse_coordinates(args):
    """Safely read lat/lon from query params, falling back to PUP Sta. Mesa
    if they're missing or not valid numbers, instead of raising a 500."""
    try:
        latitude = float(args.get("lat", DEFAULT_LAT))
        longitude = float(args.get("lon", DEFAULT_LON))
    except (TypeError, ValueError):
        latitude, longitude = DEFAULT_LAT, DEFAULT_LON
    return latitude, longitude


@app.route("/")
def home():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.route("/search")
def search():
    # Frontend sends product (may be blank for "browse all"), lat, and lon.
    product_search_key = request.args.get("product", "")
    latitude, longitude = parse_coordinates(request.args)

    user_coordinates = (latitude, longitude)

    search_results = search_service.search_product_via_stores(product_search_key, stores, user_coordinates)

    return jsonify(search_results)


if __name__ == "__main__":
    app.run(debug=True)
