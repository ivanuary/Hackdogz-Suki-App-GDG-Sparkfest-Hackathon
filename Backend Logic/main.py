import data_loader
import printer
import search_service

stores = data_loader.open_json_stores()

print("Welcome mga Suki!")
print("What products do you want to buy today?")
product_search_key = input("Input Search: ")

list_of_stores_with_product = search_service.search_product_via_stores(product_search_key, stores)

printer.print_stores_with_products(list_of_stores_with_product)