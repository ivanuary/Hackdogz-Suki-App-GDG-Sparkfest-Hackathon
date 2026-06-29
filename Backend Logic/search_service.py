import navigation

def sort_by_distance(stores_with_product:list, user_coordinates:tuple):
    # Calculates distance per exact match list and related match list
    stores_by_match_with_distance = []
    for match_list in stores_with_product:
        stores_with_distance = navigation.calculate_distance(user_coordinates, match_list)
        stores_by_match_with_distance.append(stores_with_distance)

    sorted_stores_by_match = []
    for match_list in stores_by_match_with_distance:
        sorted_stores = sorted(match_list, key=lambda store: store['distance'])
        sorted_stores_by_match.append(sorted_stores)

    return sorted_stores_by_match

def search_product_via_stores(search_key:str, stores_dict:dict, user_coordinates:tuple):
    search_key = search_key.strip().lower()
    stores_list = stores_dict["store"]

    #First list will be exact matches, 2nd list would be for related matches

    exact_matches = []
    related_matches = []

    for i, store in enumerate(stores_list):
        products = [prod.strip().lower() for prod in store['store_products']]

        if search_key in products:
            exact_matches.append(store)
            continue
        
        for product in products:
            if search_key in product:
                related_matches.append(store)

    stores_with_product = [exact_matches, related_matches]
    
    sorted_stores = sort_by_distance(stores_with_product, user_coordinates)

    return sorted_stores