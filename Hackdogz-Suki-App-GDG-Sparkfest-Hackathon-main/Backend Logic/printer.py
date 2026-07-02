def print_stores_with_products(list_stores_product:dict):
    if list_stores_product["has_results"]:
        if list_stores_product["exact_matches"]:
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
                for product, price in store['store_products'].items():
                    print(f" > {product.title()}: PHP {price}")

                print("Payment Methods")
                for payment in store['payment_methods']:
                    print(f" > {payment.title()}")
                    
                print("\n")
        
        if list_stores_product["related_matches"]:
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
                    print(f" > {product.title()}: PHP {price}")

                print("Payment Methods")
                for payment in store['payment_methods']:
                    print(f" > {payment.title()}")
                    
                print("\n")
    
    else:
        print("No Matches Found!")
