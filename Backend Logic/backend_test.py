import main
import json

stores = main.open_json_stores()

print("Welcome mga Suki!")
print("What products do you want to buy today?")
product_search_key = input("Input Search: ")

list_of_stores_with_product = main.search_product_via_stores(product_search_key, stores)

main.print_stores_with_products(list_of_stores_with_product)


