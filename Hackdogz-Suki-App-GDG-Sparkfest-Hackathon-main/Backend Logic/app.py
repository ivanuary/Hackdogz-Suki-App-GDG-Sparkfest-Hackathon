from flask import Flask, render_template, request, jsonify
import data_loader
import search_service

app = Flask(__name__)

stores = data_loader.open_json_stores()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/search")
def search():
    product_search_key = request.args.get("product")

    latitude = float(request.args.get("lat"))

    longitude = float(request.args.get("lon"))

    user_coordinates = (latitude, longitude)

    search_results = search_service.search_product_via_stores(product_search_key, stores, user_coordinates)

    return jsonify(search_results)
   
if __name__ == "__main__":
    app.run(debug=True)