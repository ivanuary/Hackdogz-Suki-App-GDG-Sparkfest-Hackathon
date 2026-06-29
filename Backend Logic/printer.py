def print_stores_with_products(list_stores_product:list):
    for i, store in enumerate(list_stores_product):
        print(f"Store Name: {store['store_name'].title()}")
        print(f"Store Address: {store['store_address'].title()}")
        print(f"Distance: {store['distance']:0.3f}km away")

        print("Products")
        for product in store['store_products']:
            print(f" > {product.title()}")

        print("Payment Methods")
        for payment in store['payment_methods']:
            print(f" > {payment.title()}")
        
        print("\n")