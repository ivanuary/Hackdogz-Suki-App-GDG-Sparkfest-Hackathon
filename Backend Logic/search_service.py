import navigation
import time_logic
import gemini

from difflib import get_close_matches

def sort_by_distance(stores_with_product:dict, user_coordinates:tuple):
    stores_with_product["exact_matches"] = navigation.calculate_distance(user_coordinates, stores_with_product["exact_matches"])
    stores_with_product["related_matches"] = navigation.calculate_distance(user_coordinates, stores_with_product["related_matches"])

    stores_with_product["exact_matches"] = sorted(stores_with_product["exact_matches"], key=lambda store: store['distance'])
    stores_with_product["related_matches"] = sorted(stores_with_product["related_matches"], key=lambda store: store['distance'])

    return stores_with_product

def suggested_word(search_key:str, stores_list:list):
    all_products = []

    for store in stores_list:
        for product in store["store_products"].keys():
            all_products.append(product)
    
    set_all_products = set(all_products)

    suggested_word = get_close_matches(search_key, list(set_all_products), n=1, cutoff=0.6)
    
    correct_word = ""
    if len(suggested_word) == 1:
        correct_word = suggested_word[0]

    return correct_word
    
def search_product_via_stores(search_key:str, stores_dict:dict, user_coordinates:tuple):
    search_key = gemini.query_to_gemini_or_not(search_key).strip().lower()
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

    if not stores_with_product["exact_matches"] and not stores_with_product["related_matches"] :
        corrected_search_key = suggested_word(search_key, stores_list)
        if corrected_search_key and corrected_search_key != search_key:
            sorted_stores = search_product_via_stores(corrected_search_key, stores_dict, user_coordinates)
            return sorted_stores
        
        stores_with_product["has_results"] = False
        return stores_with_product
    else:
        stores_with_product["has_results"] = True
        sorted_stores = sort_by_distance(stores_with_product, user_coordinates)
        return sorted_stores
