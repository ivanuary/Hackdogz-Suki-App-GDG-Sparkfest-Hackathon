import json

class Store:
    def __init__(self, store_id:int, store_name:str, store_address:str, latitude:float, longitude:float, payment_methods:list, store_products:list):
        self.store_id = store_id
        self.store_name = store_name
        self.store_address = store_address
        self.latitude = latitude
        self.longitutde = longitude
        self.payment_methods = payment_methods
        self.store_products = store_products

def open_json_stores():
    with open("Backend Logic\stores.json", "r") as file:
        data = json.load(file)
    return data

def search_product_via_stores(search_key:str, stores_dict:dict):
    search_key = search_key.strip().lower()
    stores_list = stores_dict["store"]

    stores_with_product = []

    for i, store in enumerate(stores_list):
        products = [prod.strip().lower() for prod in store["store_products"]]

        if search_key in products:
            stores_with_product.append(store)
    
    return stores_with_product

def print_stores_with_products(list_stores_product:list):
    for i, store in enumerate(list_stores_product):
        print(f"Store Name: {store['store_name'].title()}")
        print(f"Store Address: {store['store_address'].title()}")

        print("Products")
        for product in store['store_products']:
            print(f" > {product.title()}")

        print("Payment Methods")
        for payment in store['payment_methods']:
            print(f" > {payment.title()}")
        
        print("\n\n")

    
        



