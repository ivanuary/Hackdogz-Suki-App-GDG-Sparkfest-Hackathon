import data_loader
import printer
import search_service

stores = data_loader.open_json_stores()

print("Welcome mga Suki!")
print("What products do you want to buy today?")
product_search_key = input("Input Search: ")
print("")

sample_user_coordinates = (14.665469930789099, 121.12901637058972)

list_of_stores_with_product = search_service.search_product_via_stores(product_search_key, stores, sample_user_coordinates)

printer.print_stores_with_products(list_of_stores_with_product)