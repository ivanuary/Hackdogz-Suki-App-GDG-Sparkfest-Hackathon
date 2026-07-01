def print_stores_with_products(list_stores_product:dict):
    print("Exact Matches: ")
    print("-----------------")
    for store in list_stores_product["exact_matches"]:
        print(f"Store Name: {store['store_name'].title()}")
        print(f"Store Address: {store['store_address'].title()}")
        print(f"Distance: {store['distance']:0.3f}km away")

        if store["is_open"] == True:
            print("Status: Open")
        else:
            print("Status: Closed")
        
        print("Products")
        for product in store['store_products']:
            print(f" > {product.title()}")

        print("Payment Methods")
        for payment in store['payment_methods']:
            print(f" > {payment.title()}")
            
        print("\n")

    print("Related Matches: ")
    print("-----------------")
    for store in list_stores_product["related_matches"]:
        print(f"Store Name: {store['store_name'].title()}")
        print(f"Store Address: {store['store_address'].title()}")
        print(f"Distance: {store['distance']:0.3f}km away")
        
        if store["is_open"] == True:
            print("Status: Open")
        else:
            print("Status: Closed")

        print("Products")
        for product, price in store['store_products'].items():
            print(f" > {product}: PHP {price}")

        print("Payment Methods")
        for payment in store['payment_methods']:
            print(f" > {payment.title()}")
            
        print("\n")
