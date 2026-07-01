import navigation
import time_logic

def sort_by_distance(stores_with_product:dict, user_coordinates:tuple):
    stores_with_product["exact_matches"] = navigation.calculate_distance(user_coordinates, stores_with_product["exact_matches"])
    stores_with_product["related_matches"] = navigation.calculate_distance(user_coordinates, stores_with_product["related_matches"])

    stores_with_product["exact_matches"] = sorted(stores_with_product["exact_matches"], key=lambda store: store['distance'])
    stores_with_product["related_matches"] = sorted(stores_with_product["related_matches"], key=lambda store: store['distance'])

    return stores_with_product

def search_product_via_stores(search_key:str, stores_dict:dict, user_coordinates:tuple):
    search_key = search_key.strip().lower()
    stores_list = time_logic.is_store_open(stores_dict["store"])

    exact_matches = []
    related_matches = []

    for store in stores_list:
        products = [prod.strip().lower() for prod in store['store_products']]

        if search_key in products:
            exact_matches.append(store)
            continue
        
        for product in products:
            if search_key in product:
                related_matches.append(store)
                break
    
    stores_with_product = {"exact_matches":exact_matches, "related_matches":related_matches}
    
    if len(stores_with_product["exact_matches"]) == 0 and len(stores_with_product["related_matches"]) == 0:
        stores_with_product["has_results"] = False
    else:
        stores_with_product["has_results"] = True

    sorted_stores = sort_by_distance(stores_with_product, user_coordinates)

    return sorted_stores