class Store:
    def __init__(self, store_id:int, store_name:str, store_address:str, latitude:float, longitude:float, payment_methods:list, store_products:list):
        self.store_id = store_id
        self.store_name = store_name
        self.store_address = store_address
        self.latitude = latitude
        self.longitutde = longitude
        self.payment_methods = payment_methods
        self.store_products = store_products