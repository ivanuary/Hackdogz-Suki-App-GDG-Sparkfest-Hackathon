def search_product_via_stores(search_key:str, stores_dict:dict):
    search_key = search_key.strip().lower()
    stores_list = stores_dict["store"]

    stores_with_product = []

    for i, store in enumerate(stores_list):
        products = [prod.strip().lower() for prod in store["store_products"]]

        if search_key in products:
            stores_with_product.append(store)
    
    return stores_with_product