import navigation

def sort_by_distance(stores_with_product:list, user_coordinates:tuple):
    stores_with_distance = navigation.calculate_distance(user_coordinates, stores_with_product)

    sorted_stores = sorted(stores_with_distance, key=lambda store: store['distance'])

    return sorted_stores

def search_product_via_stores(search_key:str, stores_dict:dict, user_coordinates:tuple):
    search_key = search_key.strip().lower()
    stores_list = stores_dict["store"]

    stores_with_product = []

    for i, store in enumerate(stores_list):
        products = [prod.strip().lower() for prod in store['store_products']]

        if search_key in products:
            stores_with_product.append(store)
    
    sorted_stores = sort_by_distance(stores_with_product, user_coordinates)

    return sorted_stores